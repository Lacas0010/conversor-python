# Conversor de Arquivos - Universal & 100% Offline 🚀

Uma suíte completa e avançada de processamento, conversão e manipulação de arquivos construída com **FastAPI**, **Vanilla JS** (Material Design 3 & Glassmorphism) e **PyMuPDF / Python Data Engine**.

Funciona como um verdadeiro **canivete suíço para arquivos**, executando tudo diretamente no seu navegador, mas rodando **100% localmente na sua máquina**, sem enviar nenhum byte para a nuvem.

---

> [!IMPORTANT]
> **Privacidade e Sigilo Absoluto:** Esta ferramenta foi projetada para operar em ambientes de alta segurança e estrita conformidade com a **LGPD**. Não realiza requisições externas, telemetria ou chamadas a APIs de terceiros.

---

## ✨ Principais Destaques

- **⚡ Processamento 100% Local:** Sem limites de tamanho artificial de arquivos impostos por serviços em nuvem.
- **🎨 Interface Moderna Material Design 3:** Design em vidro (*glassmorphism*), tema escuro/claro nativo, micro-animações e foco em usabilidade.
- **👁️ Pré-Visualização Dinâmica Inteligente:** Pré-visualize instantaneamente antes e depois da conversão:
  - Planilhas e tabelas estruturadas (`.xlsx`, `.xls`, `.csv`) via `pandas`.
  - Documentos Word formatados (`.docx`) via `mammoth`.
  - Arquivos PDF multipágina interativos.
  - Imagens em alta resolução, áudios e vídeos via Blob URLs de memória RAM.
- **🛡️ Película Anti-Iframe:** Camada protetora para permitir operações fluidas de arrastar e soltar (*Drag & Drop*) mesmo sobre visualizadores incorporados.
- **🔌 Logs em Tempo Real:** Conexão contínua via **WebSocket** que transmite logs do backend diretamente para o console do terminal web.
- **❤️ Encerramento Inteligente (Heartbeat):** Monitoramento de ciclo de vida via WebSocket. Ao fechar a aba do navegador, o servidor finaliza o processo local automaticamente para poupar memória.
- **💀 Easter Egg Retro (DOOM 1993):** Emulador DOSBox WebAssembly integrado totalmente offline. Digite `iddqd` na interface para jogar o clássico DOOM (1993) em janela flutuante com som e suporte a teclado.

---

## 🛠️ Catálogo de Ferramentas (23 Funções)

As ferramentas estão divididas em 4 categorias no painel de navegação:

### 1. 🔄 Conversão & Extração
* **Converter Formato:** Conversor universal para mais de 50 formatos (Documentos Office, Imagens Raster/Vetoriais, Áudios, Vídeos/GIFs, Dados Geoespaciais, XML, JSON, YAML e bancos SQLite).
* **Converter em Lote (ZIP):** Fila de conversão paralela de múltiplos arquivos com download em pacote `.zip` compactado.
* **Extrair Tabelas (PDF):** Localiza e extrai matrizes tabulares de PDFs para planilhas editáveis `.xlsx` ou `.csv`.
* **Reconhecimento OCR:** Extração óptica de caracteres em documentos digitalizados e fotos, gerando arquivos `.docx` ou `.txt`.
* **Renomear em Lote:** Padronização em massa de nomes de arquivos usando tags dinâmicas (`{nome}`, `{i}`, `{data}`).

### 2. 📂 Organização de PDF
* **Juntar PDFs:** Mescla múltiplos PDFs em um único documento sequencial.
* **Juntar DOCX:** Concatena múltiplos arquivos do Word (`.docx`) preservando estrutura e estilos.
* **Dividir PDF:** Desmembra todas as páginas de um PDF em arquivos individuais dentro de um `.zip`.
* **Imagens p/ PDF:** Converte uma sequência de fotos/imagens em um PDF multipágina alinhado.
* **PDF p/ Imagens:** Exporta cada página de um PDF como imagem individual de alta resolução.
* **Fatiar por MB (SEI):** Divide PDFs pesados em partes menores que respeitam um limite estrito de megabytes (ideal para sistemas como o SEI / Processos Eletrônicos).

### 3. ✏️ Edição Avançada de PDF
* **Rotacionar PDF:** Corrige a orientação de páginas em ângulos de 90°, 180° ou 270°.
* **Remover Páginas:** Exclui páginas específicas ou intervalos determinados (ex: `1, 3-5, 9`).
* **Numerar Páginas:** Insere numeração personalizada no rodapé de todas as páginas (*Página X de Y*).
* **Adicionar Marca d'Água:** Aplica marca d'água textual diagonal com opacidade customizada sobre o conteúdo.
* **Extrair Páginas:** Gera um novo documento contendo exclusivamente as páginas selecionadas.
* **Reparar PDF:** Reconstrói cabeçalhos corrompidos e tabelas de referências cruzadas (`xref`) danificadas.

### 4. 🔒 Segurança & Otimização
* **Proteger PDF:** Criptografa o PDF com chave forte AES-256 e senha personalizada.
* **Desbloquear PDF:** Remove senhas e restrições de permissão/impressão (necessário informar a senha atual).
* **Sanitizar Arquivo:** Limpa metadados ocultos de PDFs e imagens (dados EXIF, histórico de edição, autor e GPS).
* **Comprimir Arquivo:** Reduz o tamanho de PDFs e comprime vídeos pesados utilizando aceleração local.
* **Censurar PDF (Tarja Preta):** Localiza palavras-chave, nomes ou CPFs e aplica tarja preta definitiva sobre os dados sensíveis.
* **Assinar PDF (A1):** Aplica assinatura digital em conformidade com certificados digitais padrão ICP-Brasil / A1 (`.pfx` ou `.p12`).

---

## 📦 Dependências e Pré-Requisitos

### Dependências Opcionais do Sistema:
1. **FFmpeg (Áudio & Vídeo):**
   - Para converter vídeos, extrair MP3 ou gerar GIFs animados, coloque o executável `ffmpeg.exe` dentro da pasta `ffmpeg_bin/` na raiz do projeto (ou adicione o FFmpeg ao `PATH` do sistema).
2. **Tesseract-OCR (OCR Local):**
   - Para reconhecimento óptico de caracteres em PDFs escaneados ou imagens, mantenha a pasta `Tesseract-OCR/` com o executável e dados de idioma `por.traineddata` e `eng.traineddata`.
3. **LibreOffice (Documentos & Apresentações):**
   - Para conversões avançadas de PPT/PPTX e ODT, o motor detecta automaticamente o LibreOffice instalado no sistema ou em uma pasta `LibreOfficePortable/` local.

---

## 🚀 Como Executar

### Método 1: Modo Script Python (Ambiente de Desenvolvimento)

1. Clone ou baixe o repositório em sua máquina.
2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   # No Windows:
   .\venv\Scripts\activate
   ```
3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```
4. Inicie o servidor:
   ```bash
   python server.py
   ```
5. O navegador padrão será aberto automaticamente no endereço: `http://127.0.0.1:8080`.

---

### Método 2: Executável Standalone (.EXE para Windows)

O projeto pode ser empacotado em um único arquivo `.exe` executável sem necessidade de Python instalado na máquina de destino.

1. Instale o PyInstaller no seu ambiente:
   ```bash
   pip install pyinstaller
   ```
2. Compile a aplicação com o comando completo:
   ```bash
   pyinstaller --name "Conversor_Universal" --onefile --noconsole --icon="app_icon.ico" --add-data "index.html;." --add-data "style.css;." --add-data "script.js;." --add-data "logo.svg;." --add-data "app_icon.ico;." --add-data "doom;doom/" --add-data "ffmpeg_bin;ffmpeg_bin/" --add-data "Tesseract-OCR;Tesseract-OCR/" --hidden-import="fastapi" --hidden-import="uvicorn" --hidden-import="uvicorn.logging" --hidden-import="uvicorn.loops.auto" --hidden-import="uvicorn.protocols.http.auto" --hidden-import="uvicorn.protocols.websockets.auto" --hidden-import="uvicorn.lifespan.on" server.py
   ```
   *(Ou utilize o arquivo de especificação já configurado `pyinstaller Conversor_Universal.spec`)*
3. O executável final estará disponível no diretório `dist/Conversor_Universal.exe`.

---

## 📁 Estrutura do Projeto

```text
conversor python/
├── index.html               # Interface principal (Material Design 3 & Glassmorphism)
├── style.css                # Estilos visuais, temas claro/escuro e micro-animações
├── script.js                # Lógica do frontend, WebSockets e gerenciamento de tarefas
├── logo.svg                 # Logotipo vetorial da aplicação
├── app_icon.ico             # Ícone oficial do executável Windows
├── server.py                # Servidor FastAPI com endpoints REST e WebSockets
├── conversor_motor.py       # Motor unificado de conversão e processamento de arquivos
├── requirements.txt         # Lista de dependências Python categorizadas
├── .gitignore               # Regras de exclusão para versionamento Git
├── Conversor_Universal.spec # Especificação de build do PyInstaller
│
├── doom/                    # Easter Egg: DOOM 1 (1993) Offline WebAssembly
│   ├── index.html           # Player em canvas do jogo
│   ├── js-dos.js            # Emulador JS-DOS 6.22
│   ├── wdosbox.js           # DOSBox Core JavaScript
│   ├── wdosbox.wasm.js      # DOSBox Core WebAssembly Binário
│   └── doom.jsdos           # Pacote com DOOM1.WAD e executável oficial
│
├── ffmpeg_bin/              # [Opcional] Binários do FFmpeg para processamento de áudio/vídeo
├── Tesseract-OCR/           # [Opcional] Motor Tesseract para reconhecimento de texto
├── LibreOfficePortable/     # [Opcional] LibreOffice portátil para conversão de apresentações
├── temp_uploads/            # [Automático] Diretório temporário de trabalho
└── dist/                    # [Compilado] Executável final gerado para distribuição
```

---

## 🎮 Easter Egg

Durante o uso da aplicação, experimente digitar a palavra mágica **`iddqd`** em qualquer lugar da tela para acionar a janela retrô de **DOOM (1993)**, rodando de forma 100% offline direto no navegador!
