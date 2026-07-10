# Conversor de Arquivos - Universal & Offline

Esta é uma aplicação "Web Local" poderosa e 100% offline construída com **FastAPI**, **Vanilla JS** (Material Design 3) e **PyMuPDF**. Ela serve como um canivete suíço para arquivos, oferecendo ferramentas para manipulação avançada de PDFs, extração de planilhas e conversões de formatos — tudo diretamente no seu navegador, mas rodando inteiramente na sua própria máquina local, sem enviar dados para a internet.

> [!IMPORTANT]
> **Privacidade Absoluta:** Esta ferramenta foi desenvolvida para rodar de forma isolada. Ela não efetua conexões de rede externas, requisições de API ou telemetria, garantindo sigilo e segurança na manipulação de dados corporativos ou governamentais sensíveis.

---

## 🛠️ Ferramentas Disponíveis

O conversor possui 20 ferramentas organizadas em 4 categorias no painel lateral:

### 1. Conversão & Extração
* **Converter Formato**: Conversão universal individual para mais de 50 formatos (tabelas, documentos, imagens de alta resolução/RAW, áudios, vídeos com exportação de GIFs, dados espaciais e bancos de dados sqlite).
* **Converter Lote (ZIP)**: Processamento paralelo de múltiplos arquivos, retornando um pacote `.zip` consolidado.
* **Extrair Tabelas (PDF)**: Varre o documento PDF procurando tabelas nativas e as exporta para planilhas `.xlsx` ou `.csv` estruturadas.
* **OCR (Texto)**: Escaneamento óptico de PDFs digitalizados ou imagens para extração de texto estruturado para arquivos `.docx` ou `.txt`.

### 2. Organização de PDF
* **Juntar PDFs**: Unificação de múltiplos arquivos PDF em um único documento, mantendo a ordem de envio.
* **Dividir PDF**: Separação de todas as páginas de um PDF em arquivos individuais exportados em um `.zip`.
* **Imagens p/ PDF**: Construção de um arquivo PDF multipágina a partir de uma fila de imagens (PNG, JPG, etc.).
* **PDF p/ Imagens**: Extração de todas as páginas de um PDF como imagens em alta resolução compactadas em um `.zip`.

### 3. Edição Avançada (PDF)
* **Rotacionar PDF**: Ajuste e rotação de páginas em lote nos ângulos de 90°, 180° ou 270°.
* **Remover Páginas**: Exclusão de páginas selecionadas do documento por números individuais ou intervalos (ex: `1, 3-5, 8`).
* **Numerar Páginas**: Adição de numeração automática no rodapé das páginas no formato "Página X de Y".
* **Marca d'Água**: Aplicação de marca d'água textual inclinada e semitransparente sobre todas as páginas.
* **Extrair Páginas**: Criação de um novo PDF contendo apenas as páginas indicadas (ex: `1, 3, 5-8`).
* **Reparar PDF**: Recuperação estrutural e de tabelas de referências cruzadas em arquivos PDF danificados ou corrompidos.

### 4. Segurança & Otimização
* **Proteger PDF**: Criptografia local de PDFs usando algoritmo robusto AES-256 e senha definida pelo usuário.
* **Desbloquear PDF**: Remoção de senhas e restrições de edição de documentos PDF (requer senha original).
* **Sanitizar Arquivo**: Remoção de todos os metadados ocultos de privacidade em PDFs e imagens (EXIF, autores, histórico de softwares).
* **Comprimir Arquivo**: Redução de tamanho de arquivos PDF (otimização interna) ou vídeos pesados (via aceleração de compressão FFmpeg).
* **Censurar PDF (Tarja Preta)**: Busca por termos ou CPFs e aplica uma tarja preta definitiva sobre os textos (adequação à LGPD).
* **Assinar PDF (A1)**: Assinatura digital do PDF usando certificados do tipo A1 (arquivos `.pfx` ou `.p12`).



## 🚀 Como Rodar o Projeto

Você tem duas formas de rodar a aplicação:

**⚠️ Pré-requisito de Mídia (FFmpeg)**
Para realizar conversões de áudio e vídeo (como extração de MP3 ou geração de GIFs), o motor necessita do executável do FFmpeg. Crie uma pasta chamada `ffmpeg_bin` na raiz do projeto (no mesmo nível do `server.py`) e coloque o `ffmpeg.exe` dentro dela. Caso contrário, o motor tentará buscar uma instalação global no PATH do Windows.

**⚠️ Pré-requisito de Documentos (LibreOffice)**
Para a conversão de apresentações (PPT/PPTX), arquivos OpenDocument (ODT) ou para exportar PDFs a partir de documentos de texto, o motor busca por uma instalação do LibreOffice. Ele tentará localizar o `soffice` nos seguintes caminhos de forma automática:
1. No PATH do sistema (instalação padrão do sistema).
2. Na pasta local `LibreOfficePortable/` na raiz do projeto (durante desenvolvimento/script) ou **lado a lado com o executável final `Conversor_Universal.exe` (quando rodar via `.exe` na pasta `dist`)** para que o programa a encontre, e não dentro do código fonte.
3. Nos caminhos padrão do Windows (`C:\Program Files\LibreOffice` ou `C:\Program Files (x86)\LibreOffice`).

### Opção 1: Via Python Script (Desenvolvimento)

1. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
   *Ou instale-as diretamente via terminal:*
   ```bash
   pip install fastapi uvicorn python-multipart PyMuPDF pandas openpyxl pdfplumber pytesseract Pillow python-docx docx2pdf xlrd pyarrow geopandas fiona pikepdf pyhanko
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

- **Visualizador Dinâmico Inteligente:** Área integrada na workspace principal que renderiza previews em tempo real na memória RAM (via URLs de Blob) para imagens, áudio, vídeo e PDFs, além de renderizar de forma instantânea planilhas (`.xlsx`, `.xls`, `.csv`) e documentos Word (`.docx`) com o auxílio do backend local (`pandas` e `mammoth`).
- **Película Protetora Anti-Iframe:** Camada invisível de captura de mouse que impede que iframes (como o leitor de PDF) interceptem eventos de arrastar e soltar (Drag & Drop), mantendo a experiência de carregamento de arquivos fluida.
- **Encerramento Inteligente (Heartbeat):** Ao rodar via executável, o backend possui uma conexão WebSocket contínua com a aba do navegador. Quando o usuário fecha a aba, o servidor detecta a desconexão e encerra o processo do Python na hora de forma segura.
- **Glassmorphism & Material Design 3:** A interface `index.html` foi reescrita com Material Design 3 em Vanilla JS com estética luxuosa de vidro, modo noturno dinâmico e micro-animações.
- **Log em Tempo Real:** Transmissão de logs de execução do backend diretamente para o console do terminal web no navegador via WebSockets.

---

## 📁 Estrutura do Projeto

```text
conversor python/
├── index.html            # Estrutura HTML do Frontend (Material Design 3 & Glassmorphism)
├── style.css             # Estilização CSS e efeitos visuais do Frontend
├── script.js             # Lógica e interações do Frontend (Vanilla JS)
├── logo.svg              # Logo da aplicação em vetor
├── app_icon.ico          # Ícone do executável final (.exe)
├── server.py             # Servidor Backend (FastAPI, WebSockets, Rotas API)
├── conversor_motor.py    # Motor principal de processamento de arquivos (Python-fitz, pandas, etc.)
├── requirements.txt      # Dependências do Python limpas e necessárias
├── Conversor_Universal.spec # Arquivo de configuração de compilação do PyInstaller
├── update.py             # Script de utilidade/atualização de arquivos de estilo
├── fix_light_mode.py     # Script utilitário para correção e ajustes de cor no modo claro
├── add_theme_toggle.py   # Script de automação para inserção do alternador de temas
├── ffmpeg_bin/           # [Opcional] Diretório local do FFmpeg para compressão de mídia
├── Tesseract-OCR/        # [Opcional] Diretório local do Tesseract OCR para leitura de imagens
├── LibreOfficePortable/  # [Opcional] Diretório local do LibreOffice portátil para conversão de doc
├── temp_uploads/         # [Temporário] Pasta gerada para upload e conversões
└── dist/                 # [Compilado] Pasta contendo o executável standalone (.exe)
```

