# Conversor de Arquivos - Universal & Offline

Esta é uma aplicação "Web Local" poderosa e 100% offline construída com **FastAPI**, **Vanilla JS** (Material Design 3) e **PyMuPDF**. Ela serve como um canivete suíço para arquivos, oferecendo ferramentas para manipulação avançada de PDFs, extração de planilhas e conversões de formatos — tudo diretamente no seu navegador, mas rodando inteiramente na sua própria máquina local, sem enviar dados para a internet.

> [!IMPORTANT]
> **Privacidade Absoluta:** Esta ferramenta foi desenvolvida para rodar de forma isolada. Ela não efetua conexões de rede externas, requisições de API ou telemetria, garantindo sigilo e segurança na manipulação de dados corporativos ou governamentais sensíveis.

---

## 🛠️ Ferramentas Disponíveis

1. **Conversão de Formatos**: Transforme CSVs para Excel, JSONs para planilhas, Word para PDF, e vice-versa.
2. **Juntar PDFs**: Combine infinitos documentos PDF em um único arquivo de forma otimizada.
3. **Dividir PDF**: Fatie um documento PDF em páginas únicas individuais, exportadas automaticamente via arquivo `.zip`.
4. **Imagens para PDF**: Empacote uma série de fotos (JPG, PNG) em um arquivo PDF multipágina em questão de segundos.
5. **PDF para Imagens**: Extraia imagens em alta qualidade das páginas do seu documento.
6. **Segurança de PDF**: Aplique ou quebre senhas (Criptografia AES-256) para proteger arquivos sigilosos.
7. **Extração de Tabelas (PDF)**: Transforme tabelas nativas dentro de PDFs em planilhas Excel estruturadas automaticamente.
8. **Sanitização de Arquivos**: Limpe todo e qualquer metadado ou rastro de PDFs e Imagens, garantindo privacidade militar antes do envio.
9. **Compressão Otimizada**: Reduza massivamente o peso de PDFs e vídeos através do motor otimizado de deflate interno.
10. **Reconhecimento OCR Avançado**: Leia o texto contido em PDFs escaneados ou imagens e transforme num documento `.docx` usando Tesseract.

---

## 🚀 Como Rodar o Projeto

Você tem duas formas de rodar a aplicação:

**⚠️ Pré-requisito de Mídia (FFmpeg)**
Para realizar conversões de áudio e vídeo (como extração de MP3), o motor necessita do executável do FFmpeg. Crie uma pasta chamada `ffmpeg_bin` na raiz do projeto (no mesmo nível do `server.py`) e coloque o `ffmpeg.exe` dentro dela. Caso contrário, o motor tentará buscar uma instalação global no PATH do Windows.

### Opção 1: Via Python Script (Desenvolvimento)

1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
2. Inicie o servidor FastAPI:
   ```bash
   python server.py
   ```
3. O servidor abrirá automaticamente o seu navegador web no endereço local.

### Opção 2: Via Executável (Produção .exe)

O projeto está preparado para ser empacotado num executável standalone.

1. Instale o PyInstaller:
   ```bash
   pip install pyinstaller
   ```
2. Compile o código:
   ```bash
   pyinstaller --name "Conversor_Universal" --onefile --noconsole --icon="app_icon.ico" --add-data "index.html;." --add-data "logo.svg;." --add-data "app_icon.ico;." --add-data "ffmpeg_bin;ffmpeg_bin/" --add-data "Tesseract-OCR;Tesseract-OCR/" --hidden-import="fastapi" --hidden-import="uvicorn" --hidden-import="uvicorn.logging" --hidden-import="uvicorn.loops.auto" --hidden-import="uvicorn.protocols.http.auto" --hidden-import="uvicorn.protocols.websockets.auto" --hidden-import="uvicorn.lifespan.on" server.py
   ```
3. Acesse a pasta `dist` recém-criada e dê um clique duplo no `Conversor_Universal.exe`.

---

## ⚡ Arquitetura e Recursos Avançados

- **Encerramento Inteligente (Heartbeat):** Ao rodar via executável, o backend possui uma conexão WebSocket contínua com a aba do navegador. Quando o usuário fecha a aba, o servidor detecta a desconexão e encerra o processo do Python na hora de forma segura.
- **Glassmorphism & Material Design 3:** A interface `index.html` foi totalmente reescrita em Vanilla JS sem frameworks pesados, aplicando um design luxuoso, modo noturno dinâmico e micro-interações fluidas.
- **Log em Tempo Real:** As saídas do backend são transmitidas via WebSocket diretamente para a UI, permitindo visualizar logs do motor de processamento no próprio navegador.

---

## 📁 Estrutura do Projeto

```text
conversor python/
├── index.html            # Interface Gráfica Web Frontend (Vanilla JS + M3)
├── server.py             # Servidor Backend (FastAPI, WebSockets, Rotas)
├── conversor_motor.py    # Cérebro de conversões e manipulação de arquivos
├── requirements.txt      # Lista de dependências Python
├── ffmpeg_bin/           # (Opcional) Pasta contendo o ffmpeg.exe para compressão de mídias
├── Tesseract-OCR/        # (Opcional) Pasta contendo o Tesseract para reconhecimento OCR
├── temp_uploads/         # Diretório criado automaticamente para processamento local
└── dist/                 # Diretório criado ao compilar o .exe final
```
