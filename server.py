import os
import sys
import webbrowser
import threading
import time
import asyncio
import shutil
from typing import List
from contextlib import contextmanager
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

last_heartbeat = time.time()
server_started = False
heartbeat_clients = 0

# Adiciona o diretório atual ao path para importar o motor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from conversor_motor import (
    converter_arquivo, obter_saidas_permitidas, ConversionError,
    juntar_pdfs, dividir_pdf, proteger_pdf, desbloquear_pdf,
    pdf_para_imagens, imagens_para_pdf,
    extrair_tabelas_pdf, sanitizar_arquivo, comprimir_arquivo, ocr_documento
)

# --- CONFIGURAÇÃO FFMPEG PARA O PYINSTALLER ---
# No início do server.py, defina isso:
ffmpeg_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ffmpeg.exe")
os.environ["FFMPEG_PATH"] = ffmpeg_path
# ----------------------------------------------

app = FastAPI(title="Conversor de Arquivos - Web Interface")

# Determina o diretório base para suportar PyInstaller (.exe) ou script
base_dir = sys._MEIPASS if getattr(sys, 'frozen', False) else os.path.dirname(os.path.abspath(__file__))

# Monta a pasta atual como servidora de arquivos estáticos
app.mount("/static", StaticFiles(directory=base_dir), name="static")

active_websockets = []

@app.websocket("/ws/log")
async def websocket_log(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_websockets.remove(websocket)

class WsRedirector:
    def __init__(self, original_stream, loop):
        self.original_stream = original_stream
        self.loop = loop

    def write(self, text):
        self.original_stream.write(text)
        if text and active_websockets:
            for ws in active_websockets.copy():
                try:
                    asyncio.run_coroutine_threadsafe(ws.send_text(text), self.loop)
                except Exception:
                    pass

    def flush(self):
        self.original_stream.flush()

@contextmanager
def redirect_to_ws(loop):
    orig_stdout = sys.stdout
    orig_stderr = sys.stderr
    sys.stdout = WsRedirector(orig_stdout, loop)
    sys.stderr = WsRedirector(orig_stderr, loop)
    try:
        yield
    finally:
        sys.stdout = orig_stdout
        sys.stderr = orig_stderr

@app.get("/")
def serve_index():
    """
    Serve a página principal index.html, suportando modo PyInstaller (.exe) ou script.
    """
    index_path = os.path.join(base_dir, "index.html")
    
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="index.html não encontrado.")
    return FileResponse(index_path)

@app.get("/favicon.ico", include_in_schema=False)
def favicon():
    icon_path = os.path.join(base_dir, "app_icon.ico")
    if os.path.exists(icon_path):
        return FileResponse(icon_path)
    raise HTTPException(status_code=404, detail="Ícone não encontrado")

@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    target_format: str = Form(None),
    csv_delimiter: str = Form(";")
):
    """
    Recebe o arquivo carregado, salva-o temporariamente em uma pasta local 'temp_uploads',
    processa a conversão offline usando o motor local e retorna o arquivo convertido ou link.
    """
    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)
    
    # Salva o arquivo original localmente
    input_path = os.path.join(temp_dir, file.filename)
    try:
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Falha ao salvar o arquivo enviado: {str(e)}"}
        )

    # Se não foi fornecido formato de destino, apenas retorna informações do arquivo
    if not target_format:
        ext_origem = os.path.splitext(file.filename)[1].lower()
        saidas = obter_saidas_permitidas(input_path)
        return {
            "status": "success",
            "filename": file.filename,
            "size": len(content),
            "allowed_targets": saidas
        }

    # Se foi fornecido um formato de destino, executa a conversão real offline!
    name, ext = os.path.splitext(file.filename)
    output_filename = f"{name}_convertido{target_format}"
    output_path = os.path.join(temp_dir, output_filename)

    try:
        converter_arquivo(input_path, output_path, delimitador=csv_delimiter)
        # Retorna sucesso e o caminho/url do arquivo convertido
        return {
            "status": "success",
            "filename": file.filename,
            "converted_filename": output_filename,
            "message": "Conversão realizada com sucesso 100% offline!"
        }
    except ConversionError as ce:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": f"Erro de Conversão: {str(ce)}"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Erro inesperado no servidor: {str(e)}"}
        )

@app.get("/api/download/{filename}")
def download_file(filename: str):
    """
    Permite baixar o arquivo convertido a partir da pasta temporária local.
    """
    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_uploads")
    file_path = os.path.join(temp_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado no servidor local.")
    return FileResponse(file_path, filename=filename)

@app.post("/api/heartbeat")
def heartbeat():
    global last_heartbeat, server_started
    last_heartbeat = time.time()
    server_started = True
    return {"status": "ok"}

@app.websocket("/ws/heartbeat")
async def websocket_heartbeat(websocket: WebSocket):
    global heartbeat_clients, server_started
    await websocket.accept()
    heartbeat_clients += 1
    server_started = True
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        heartbeat_clients -= 1

def remover_arquivos_temporarios(*caminhos: str):
    """
    Remove arquivos e pastas temporários locais para evitar o acúmulo de arquivos em disco.
    """
    time.sleep(1.0)
    for caminho in caminhos:
        try:
            if os.path.exists(caminho):
                if os.path.isdir(caminho):
                    shutil.rmtree(caminho, ignore_errors=True)
                else:
                    os.remove(caminho)
        except Exception:
            pass

@app.post("/api/converter")
async def convert_file_stream(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    acao: str = Form("Converter Formato"),
    formato_saida: str = Form(None),
    senha: str = Form(None),
    csv_delimiter: str = Form(";")
):
    temp_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_uploads")
    os.makedirs(temp_dir, exist_ok=True)

    input_paths = []
    for file in files:
        ipath = os.path.join(temp_dir, file.filename)
        try:
            with open(ipath, "wb") as f:
                content = await file.read()
                f.write(content)
            input_paths.append(ipath)
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": f"Erro ao receber arquivo temporário: {str(e)}"}
            )

    loop = asyncio.get_running_loop()

    try:
        if acao == "Juntar PDFs":
            output_filename = "pdfs_juntos.pdf"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, juntar_pdfs, input_paths, output_path)
            background_tasks.add_task(remover_arquivos_temporarios, *input_paths, output_path)
            
        elif acao == "Dividir PDF":
            input_path = input_paths[0]
            name = os.path.splitext(os.path.basename(input_path))[0]
            dir_saida = os.path.join(temp_dir, f"{name}_dividido")
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, dividir_pdf, input_path, dir_saida)
            
            zip_base = os.path.join(temp_dir, f"{name}_dividido")
            shutil.make_archive(zip_base, 'zip', dir_saida)
            output_path = f"{zip_base}.zip"
            output_filename = os.path.basename(output_path)
            
            shutil.rmtree(dir_saida, ignore_errors=True)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)
            
        elif acao == "Proteger PDF":
            input_path = input_paths[0]
            name = os.path.splitext(os.path.basename(input_path))[0]
            output_filename = f"{name}_protegido.pdf"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, proteger_pdf, input_path, output_path, senha)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)
            
        elif acao == "Desbloquear PDF":
            input_path = input_paths[0]
            name = os.path.splitext(os.path.basename(input_path))[0]
            output_filename = f"{name}_desbloqueado.pdf"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, desbloquear_pdf, input_path, output_path, senha)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)
            
        elif acao == "Imagens para PDF":
            output_filename = "imagens_juntas.pdf"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, imagens_para_pdf, input_paths, output_path)
            background_tasks.add_task(remover_arquivos_temporarios, *input_paths, output_path)
            
        elif acao == "PDF para Imagens":
            input_path = input_paths[0]
            name = os.path.splitext(os.path.basename(input_path))[0]
            dir_saida = os.path.join(temp_dir, f"{name}_imagens")
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, pdf_para_imagens, input_path, dir_saida, "png")
            
            zip_base = os.path.join(temp_dir, f"{name}_imagens")
            shutil.make_archive(zip_base, 'zip', dir_saida)
            output_path = f"{zip_base}.zip"
            output_filename = os.path.basename(output_path)
            
            shutil.rmtree(dir_saida, ignore_errors=True)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)
            
        elif acao == "Extrair Tabelas (PDF)":
            input_path = input_paths[0]
            name = os.path.splitext(os.path.basename(input_path))[0]
            ext_saida = formato_saida if formato_saida else ".xlsx"
            output_filename = f"{name}_tabelas{ext_saida}"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, extrair_tabelas_pdf, input_path, output_path)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)

        elif acao == "Sanitizar Arquivo":
            input_path = input_paths[0]
            name, ext = os.path.splitext(os.path.basename(input_path))
            output_filename = f"{name}_sanitizado{ext}"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, sanitizar_arquivo, input_path, output_path)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)

        elif acao == "Comprimir Arquivo":
            input_path = input_paths[0]
            name, ext = os.path.splitext(os.path.basename(input_path))
            output_filename = f"{name}_comprimido{ext}"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, comprimir_arquivo, input_path, output_path)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)

        elif acao == "Reconhecimento OCR":
            input_path = input_paths[0]
            name = os.path.splitext(os.path.basename(input_path))[0]
            ext_saida = formato_saida if formato_saida else ".txt"
            output_filename = f"{name}_ocr{ext_saida}"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, ocr_documento, input_path, output_path)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)
            
        elif acao == "Converter em Lote (ZIP)":
            lote_id = f"lote_{int(time.time() * 1000)}"
            lote_dir = os.path.join(temp_dir, lote_id)
            os.makedirs(lote_dir, exist_ok=True)
            
            for ipath in input_paths:
                nome_base = os.path.splitext(os.path.basename(ipath))[0]
                caminho_saida = os.path.join(lote_dir, f"{nome_base}{formato_saida}")
                with redirect_to_ws(loop):
                    await loop.run_in_executor(None, converter_arquivo, ipath, caminho_saida, csv_delimiter)
            
            zip_base = os.path.join(temp_dir, f"{lote_id}_final")
            shutil.make_archive(zip_base, 'zip', lote_dir)
            output_path = f"{zip_base}.zip"
            output_filename = "lote_convertido.zip"
            
            background_tasks.add_task(remover_arquivos_temporarios, *input_paths, lote_dir, output_path)

        else:
            input_path = input_paths[0]
            name, ext = os.path.splitext(os.path.basename(input_path))
            output_filename = f"{name}_convertido{formato_saida}"
            output_path = os.path.join(temp_dir, output_filename)
            with redirect_to_ws(loop):
                await loop.run_in_executor(None, converter_arquivo, input_path, output_path, csv_delimiter)
            background_tasks.add_task(remover_arquivos_temporarios, input_path, output_path)

        return FileResponse(
            path=output_path,
            filename=output_filename,
            media_type="application/octet-stream",
            headers={"Content-Disposition": f"attachment; filename={output_filename}"}
        )
    except ConversionError as ce:
        background_tasks.add_task(remover_arquivos_temporarios, *input_paths)
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": f"Erro de processamento: {str(ce)}"}
        )
    except Exception as e:
        background_tasks.add_task(remover_arquivos_temporarios, *input_paths)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Erro interno no servidor: {str(e)}"}
        )

def start_browser():
    # Aguarda 1.5 segundos para garantir que o FastAPI esteja totalmente inicializado
    time.sleep(1.5)
    webbrowser.open("http://127.0.0.1:8080")

def monitor_heartbeat():
    global last_heartbeat, server_started, heartbeat_clients
    start_time = time.time()
    while True:
        time.sleep(5)
        now = time.time()
        if getattr(sys, 'frozen', False):  # Apenas desliga sozinho se for .exe
            if not server_started:
                if now - start_time > 60: # 60s sem abrir o navegador
                    os._exit(0)
            else:
                # 120s de limite para pings antigos E sem nenhum WebSocket conectado
                if heartbeat_clients == 0 and (now - last_heartbeat > 120):
                    time.sleep(5) # Grace period para recarregamento da página (F5)
                    if heartbeat_clients == 0 and (time.time() - last_heartbeat > 120):
                        os._exit(0)

if __name__ == "__main__":
    # --- CORREÇÃO PARA O PYINSTALLER NOCONSOLE ---
    # Se não houver console, redirecionamos a saída para o "limbo" (devnull)
    # para evitar que o log colorido do Uvicorn quebre a aplicação.
    if sys.stdout is None:
        sys.stdout = open(os.devnull, "w")
    if sys.stderr is None:
        sys.stderr = open(os.devnull, "w")
    # ---------------------------------------------

    # Inicia a thread que abrirá o navegador
    threading.Thread(target=start_browser, daemon=True).start()
    
    # Inicia o monitor de heartbeat para fechar quando o navegador for fechado
    threading.Thread(target=monitor_heartbeat, daemon=True).start()
    
    # Inicia o servidor local FastAPI via Uvicorn (SEM ASPAS E SEM RELOAD)
    uvicorn.run(app, host="127.0.0.1", port=8080)
