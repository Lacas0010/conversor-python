// SPA Routing Vanilla JS Logic
const railBtns = document.querySelectorAll('.nav-tab');
const sections = document.querySelectorAll('.view');

railBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        if (!targetId) return;

        // Alterna estado dos botões da sidebar
        railBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Alterna exibição das telas
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
    });
});




// ------------------ Lógica do Conversor de Arquivos ------------------
const fileInput = document.getElementById('file-input');
const dropzone = document.getElementById('dropzone');
const fileQueue = document.getElementById('file-queue');
const formatSelect = document.getElementById('format-select');
const delimiterField = document.getElementById('delimiter-field');
const convertBtn = document.getElementById('convert-btn');
const progressWrapper = document.getElementById('progress-wrapper');
const statusAlert = document.getElementById('status-alert');
window.currentAction = "Converter Formato"; // Variável global substitui o Select
const inputPassword = document.getElementById('input-password');
const inputWatermark = document.getElementById('input-watermark');
const inputPages = document.getElementById('input-pages');
const selectAngle = document.getElementById('select-angle');

let selectedFiles = [];
let currentPreviewIndex = 0;
let isSortingQueue = false;

const previewSection = document.getElementById('preview-section');
const previewFilename = document.getElementById('preview-filename');
const previewCounter = document.getElementById('preview-counter');
const previewContentContainer = document.getElementById('preview-content-container');
const btnPrevPreview = document.getElementById('btn-prev-preview');
const btnNextPreview = document.getElementById('btn-next-preview');

function renderPreview() {
    if (selectedFiles.length === 0) {
        previewSection.classList.add('hidden');
        dropzone.classList.remove('hidden');
        return;
    }

    previewSection.classList.remove('hidden');
    dropzone.classList.add('hidden');

    const file = selectedFiles[currentPreviewIndex];
    previewFilename.textContent = file.name;
    previewCounter.textContent = `${currentPreviewIndex + 1} / ${selectedFiles.length}`;

    btnPrevPreview.disabled = currentPreviewIndex === 0;
    btnNextPreview.disabled = currentPreviewIndex === selectedFiles.length - 1;

    const url = URL.createObjectURL(file);
    previewContentContainer.innerHTML = '';

    const extension = file.name.split('.').pop().toLowerCase();

    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.className = 'preview-element';
        img.src = url;
        previewContentContainer.appendChild(img);
    } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.className = 'preview-element';
        video.src = url;
        video.controls = true;
        previewContentContainer.appendChild(video);
    } else if (file.type.startsWith('audio/')) {
        const audio = document.createElement('audio');
        audio.src = url;
        audio.controls = true;
        audio.style.width = '80%';
        previewContentContainer.appendChild(audio);
    } else if (file.type === 'application/pdf') {
        const iframe = document.createElement('iframe');
        iframe.className = 'preview-element';
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        previewContentContainer.appendChild(iframe);
    } else if (file.type.startsWith('text/') || ['csv', 'json', 'xml', 'txt', 'md', 'html', 'js', 'css', 'py'].includes(extension)) {
        const blobSlice = file.slice(0, 100 * 1024);
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const pre = document.createElement('pre');
            pre.className = 'preview-text';
            pre.textContent = text;
            previewContentContainer.appendChild(pre);
        };
        reader.readAsText(blobSlice);
    } else if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
        // Renderização dinâmica de Office via Backend
        previewContentContainer.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; gap:16px;">
                <span class="material-symbols-outlined" style="font-size: 48px; color: var(--md-sys-color-primary); animation: spin 1s linear infinite;">autorenew</span>
                <span style="color: var(--md-sys-color-on-surface-variant);">Gerando visualização...</span>
            </div>
            <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        `;
        
        const formData = new FormData();
        formData.append('file', file);
        
        fetch('/api/preview', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.html) {
                previewContentContainer.innerHTML = `<div style="width:100%; height:100%; overflow:auto; padding:16px;">${data.html}</div>`;
            } else {
                throw new Error(data.error || "Erro desconhecido");
            }
        })
        .catch(err => {
            previewContentContainer.innerHTML = `
                <div style="text-align:center; color: var(--md-sys-color-on-surface-variant);">
                    <span class="material-symbols-outlined" style="font-size: 64px; opacity:0.5;">description</span>
                    <p style="margin-top:16px;">Pré-visualização indisponível</p>
                </div>`;
        });
        
    } else {
        // Arquivos totalmente desconhecidos (ex: .exe, .zip)
        previewContentContainer.innerHTML = `
            <div style="text-align:center; color: var(--md-sys-color-on-surface-variant);">
                <span class="material-symbols-outlined" style="font-size: 64px; opacity:0.5;">draft</span>
                <p style="margin-top:16px;">Pré-visualização nativa indisponível</p>
            </div>`;
    }
}

btnPrevPreview.addEventListener('click', () => {
    if (currentPreviewIndex > 0) {
        currentPreviewIndex--;
        renderPreview();
    }
});

btnNextPreview.addEventListener('click', () => {
    if (currentPreviewIndex < selectedFiles.length - 1) {
        currentPreviewIndex++;
        renderPreview();
    }
});

// Funções auxiliares para drag & drop
const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
};

const handleDrop = (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files.length > 0) {
        addFilesToQueue(Array.from(dt.files));
    }
};

// 1. Ação do Botão "Mais Arquivos" no Visualizador
const btnAddMore = document.getElementById('btn-add-more');
if (btnAddMore) {
    btnAddMore.addEventListener('click', () => {
        // Simula o clique no input de arquivo original que já existe no dropzone
        document.getElementById('file-input').click();
    });
}

// 2. Permitir Drag & Drop diretamente em cima do Visualizador com proteção anti-iframe
const dragOverlay = document.getElementById('preview-drag-overlay');

window.addEventListener('dragenter', (e) => {
    if (isSortingQueue) return; // Aborta se estivermos apenas reorganizando a fila interna

    if (selectedFiles.length > 0 && dragOverlay) {
        dragOverlay.style.display = 'flex';
        dragOverlay.style.pointerEvents = 'auto'; // Ativa a película para bloquear o iframe
    }
});

// Garante o drop seguro em cima da película protetora
if (dragOverlay) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dragOverlay.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    dragOverlay.addEventListener('dragleave', (e) => {
        // Esconde se o mouse sair da área de drop
        if (e.relatedTarget === null || !dragOverlay.contains(e.relatedTarget)) {
            dragOverlay.style.display = 'none';
            dragOverlay.style.pointerEvents = 'none';
        }
    });

    dragOverlay.addEventListener('drop', (e) => {
        dragOverlay.style.display = 'none';
        dragOverlay.style.pointerEvents = 'none';
        handleDrop(e); // Encaminha os novos arquivos para a fila existente
    });
}


// Lógica de Expandir/Recolher Sidebar
const toolsSidebar = document.getElementById('tools-sidebar');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');

toggleSidebarBtn.addEventListener('click', () => {
    toolsSidebar.classList.toggle('collapsed');
    const icon = toggleSidebarBtn.querySelector('span');
    icon.textContent = toolsSidebar.classList.contains('collapsed') ? 'menu' : 'menu_open';
});

// Configuração dos controles de lote (Agrupado vs 1-para-1)
const batchToggles = {
    "Converter Formato": { show: true, default: false, title: "Agrupar em arquivo único (ZIP)", desc: "Compactar todos os arquivos convertidos em um único ZIP" },
    "Converter em Lote (ZIP)": { show: true, default: true, title: "Agrupar em arquivo único (ZIP)", desc: "Compactar todos os arquivos convertidos em um único ZIP" },
    "Imagens para PDF": { show: true, default: true, title: "Juntar em um único PDF", desc: "Unir todas as imagens em um PDF ou criar um PDF por imagem" },
    "Juntar DOCX": { show: true, default: true, title: "Juntar em um único Word (DOCX)", desc: "Combinar todos os documentos Word em um único arquivo DOCX ou baixar separados" },
    "Extrair Tabelas (PDF)": { show: true, default: false, title: "Agrupar em arquivo único (ZIP)", desc: "Compactar todas as planilhas extraídas em um único ZIP" },
    "Reconhecimento OCR": { show: true, default: false, title: "Agrupar em arquivo único (ZIP)", desc: "Compactar todos os arquivos de texto do OCR em um único ZIP" },
    "Renomear em Lote (ZIP)": { show: true, default: true, title: "Agrupar em arquivo único (ZIP)", desc: "Compactar todos os arquivos renomeados em um único ZIP" }
};

// Lógica de Seleção de Ferramenta
document.querySelectorAll('.tool-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tool-item').forEach(b => b.classList.remove('active'));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        window.currentAction = targetBtn.getAttribute('data-action');
        
        // Mostra/Oculta campos na direita dependendo da ferramenta
        const showPassword = ["Proteger PDF", "Desbloquear PDF", "Assinar PDF"].includes(window.currentAction);
        const passwordField = document.getElementById('input-password');
        passwordField.classList.toggle('hidden', !showPassword);
        
        if (window.currentAction === "Assinar PDF") {
            passwordField.setAttribute('label', 'Senha do Certificado A1');
        } else {
            passwordField.setAttribute('label', 'Senha do PDF');
        }
        
        document.getElementById('input-censor').classList.toggle('hidden', window.currentAction !== "Censurar PDF (Tarja Preta)");
        document.getElementById('input-extract').classList.toggle('hidden', window.currentAction !== "Extrair Páginas");
        document.getElementById('pfx-upload-container').classList.toggle('hidden', window.currentAction !== "Assinar PDF");
        
        document.getElementById('input-watermark').classList.toggle('hidden', window.currentAction !== "Adicionar Marca d'Água");
        document.getElementById('input-pages').classList.toggle('hidden', window.currentAction !== "Remover Páginas");
        document.getElementById('select-angle').classList.toggle('hidden', window.currentAction !== "Rotacionar PDF");
        document.getElementById('input-mb').classList.toggle('hidden', window.currentAction !== "Fatiar PDF por Tamanho");
        document.getElementById('input-rename').classList.toggle('hidden', window.currentAction !== "Renomear em Lote (ZIP)");
        
        const batchGroupContainer = document.getElementById('batch-group-container');
        if (batchGroupContainer) {
            const config = batchToggles[window.currentAction];
            if (config) {
                batchGroupContainer.classList.remove('hidden');
                document.getElementById('batch-group-title').textContent = config.title;
                document.getElementById('batch-group-desc').textContent = config.desc;
                const switchEl = document.getElementById('input-batch-group');
                if (switchEl) {
                    switchEl.selected = config.default;
                }
            } else {
                batchGroupContainer.classList.add('hidden');
            }
        }
        
        updateControlsState();
    });
});

dropzone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        addFilesToQueue(Array.from(e.target.files));
    }
});

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        addFilesToQueue(Array.from(e.dataTransfer.files));
    }
});

function addFilesToQueue(files) {
    files.forEach(file => {
        if (!selectedFiles.some(f => f.name === file.name)) {
            selectedFiles.push(file);
        }
    });
    renderQueue();
    updateControlsState();
    
    if (selectedFiles.length > 0) {
        if (currentPreviewIndex >= selectedFiles.length) {
            currentPreviewIndex = selectedFiles.length - 1;
        }
    } else {
        currentPreviewIndex = 0;
    }
    renderPreview();
}

function removeFileFromQueue(index) {
    selectedFiles.splice(index, 1);
    
    if (currentPreviewIndex >= selectedFiles.length) {
        currentPreviewIndex = Math.max(0, selectedFiles.length - 1);
    }
    
    renderQueue();
    updateControlsState();
    renderPreview();
}

function renderQueue() {
    fileQueue.innerHTML = '';
    selectedFiles.forEach((file, idx) => {
        const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
        const item = document.createElement('div');
        item.className = 'queue-item';
        item.dataset.index = idx;
        
        const ext = file.name.split('.').pop().toLowerCase();
        let icon = 'description';
        if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) icon = 'image';
        if (['mp3', 'wav', 'flac', 'ogg'].includes(ext)) icon = 'audio_file';
        if (['mp4', 'mkv', 'webm', 'avi', 'mov'].includes(ext)) icon = 'video_file';
        if (['zip', 'rar', '7z'].includes(ext)) icon = 'folder_zip';
        if (['sqlite', 'db'].includes(ext)) icon = 'database';
        if (['kml', 'geojson'].includes(ext)) icon = 'map';

        item.innerHTML = `
            <div class="queue-item-info">
                <span class="file-icon drag-handle" style="cursor: grab; margin-right: 8px;">drag_indicator</span>
                <span class="file-icon">${icon}</span>
                <div class="queue-item-meta">
                    <div class="queue-item-name">${file.name}</div>
                    <div class="queue-item-size">${sizeKB}</div>
                </div>
            </div>
            <button class="remove-icon-btn" onclick="event.stopPropagation(); removeFileFromQueue(${idx})">
                <span>close</span>
            </button>
        `;
        fileQueue.appendChild(item);
    });

    if (window.queueSortable) {
        window.queueSortable.destroy();
    }
    window.queueSortable = Sortable.create(fileQueue, {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        onStart: function (evt) {
            isSortingQueue = true;
        },
        onEnd: function (evt) {
            isSortingQueue = false;
            const newFiles = [];
            const items = fileQueue.querySelectorAll('.queue-item');
            items.forEach(item => {
                const oldIdx = parseInt(item.dataset.index);
                newFiles.push(selectedFiles[oldIdx]);
            });
            selectedFiles = newFiles;
            renderQueue();
            updateControlsState();
            renderPreview();
        }
    });
}

async function updateControlsState() {
    if (selectedFiles.length === 0) {
        formatSelect.innerHTML = `<md-select-option selected value=""><div slot="headline">Insira arquivos na fila</div></md-select-option>`;
        formatSelect.setAttribute('disabled', 'true');
        delimiterField.setAttribute('disabled', 'true');
        convertBtn.setAttribute('disabled', 'true');
        clearAlert();
        return;
    }

    const action = window.currentAction;
    const refFile = selectedFiles[0];
    const formData = new FormData();
    formData.append('file', refFile);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            formatSelect.innerHTML = '';
            
            let targetList = [];
            // Injeção mágica das extensões corretas baseada na ação escolhida
            if (action === "Reconhecimento OCR") {
                targetList = ['.docx', '.txt'];
            } else if (action === "Extrair Tabelas (PDF)") {
                targetList = ['.xlsx', '.csv'];
            } else {
                targetList = result.allowed_targets;
            }

            if (targetList && targetList.length > 0) {
                targetList.forEach((targetExt, index) => {
                    const option = document.createElement('md-select-option');
                    option.value = targetExt;
                    if (index === 0) option.setAttribute('selected', 'true');
                    
                    const headline = document.createElement('div');
                    headline.setAttribute('slot', 'headline');
                    headline.textContent = targetExt.toUpperCase();
                    option.appendChild(headline);
                    
                    formatSelect.appendChild(option);
                });
                
                if (action === "Converter Formato" || action === "Extrair Tabelas (PDF)" || action === "Reconhecimento OCR" || action === "Converter em Lote (ZIP)") {
                    formatSelect.removeAttribute('disabled');
                    if ((action === "Converter Formato" || action === "Converter em Lote (ZIP)") && formatSelect.value === '.csv') {
                        delimiterField.removeAttribute('disabled');
                    } else {
                        delimiterField.setAttribute('disabled', 'true');
                    }
                } else {
                    formatSelect.setAttribute('disabled', 'true');
                    delimiterField.setAttribute('disabled', 'true');
                }
                
                convertBtn.removeAttribute('disabled');
                clearAlert();
            } else {
                formatSelect.innerHTML = `<md-select-option selected value=""><div slot="headline">Formato não suportado</div></md-select-option>`;
                formatSelect.setAttribute('disabled', 'true');
                convertBtn.setAttribute('disabled', 'true');
                showAlert('O primeiro arquivo da fila não é suportado pelo motor offline.', 'error');
            }
        } else {
            showAlert(result.message || 'Falha ao analisar arquivo.', 'error');
        }
    } catch (err) {
        showAlert('Erro ao conectar com o backend local: ' + err.message, 'error');
    }
}

function playCompletionSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // Nota Dó (C5)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
        
        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime); // Nota Mi (E5)
            gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.25);
        }, 180);
    } catch (e) {
        console.warn('Web Audio API bloqueada ou indisponível:', e);
    }
}

async function startBatchConversion() {
    if (selectedFiles.length === 0) return;

    progressWrapper.style.display = 'block';
    convertBtn.setAttribute('disabled', 'true');
    clearAlert();

    const selectedFormat = formatSelect.value;
    const delimiter = delimiterField.value || ';';
    let action = window.currentAction;
    const password = inputPassword.value;
    const watermarkText = inputWatermark.value || 'CONFIDENCIAL';
    const pagesToRemove = inputPages.value || '';
    const rotationAngle = parseInt(selectAngle.value) || 90;
    
    // Novas variáveis
    const censorText = document.getElementById('input-censor').value || '';
    const extractPages = document.getElementById('input-extract').value || '';
    const pfxFile = document.getElementById('input-pfx').files[0];
    const sizeMB = document.getElementById('input-mb').value || '20';
    const renamePattern = document.getElementById('input-rename').value || '{i} - {nome} []';
    
    let successCount = 0;
    let errorsCount = 0;

    // Detecta se é para agrupar em arquivo único ou processar individualmente (1-para-1)
    const batchGroupSwitch = document.getElementById('input-batch-group');
    const groupResults = batchGroupSwitch ? batchGroupSwitch.selected : true;
    
    const originalAction = action;
    let selectedFormatOverride = selectedFormat;

    // Se a ação for Imagens para PDF mas o usuário escolheu não juntar
    if (action === "Imagens para PDF" && !groupResults) {
        action = "Converter em Lote (ZIP)";
        selectedFormatOverride = ".pdf";
    }

    // Se for Converter Formato e o usuário optou por Agrupar em ZIP
    if (action === "Converter Formato" && groupResults) {
        action = "Converter em Lote (ZIP)";
    }

    // Determina se forçaremos o loop de processamento individual um por um no frontend
    let forceIndividualLoop = false;
    if (!groupResults) {
        if (action === "Converter em Lote (ZIP)") {
            if (originalAction !== "Imagens para PDF") {
                action = "Converter Formato";
                forceIndividualLoop = true;
            }
        } else if (action === "Renomear em Lote (ZIP)" || action === "Extrair Tabelas (PDF)" || action === "Reconhecimento OCR" || action === "Juntar DOCX") {
            forceIndividualLoop = true;
            if (action === "Juntar DOCX") {
                action = "Converter Formato";
                selectedFormatOverride = ".docx";
            }
        }
    }

    // Ferramentas que processam lote direto no backend (quando agrupado)
    const isBatchAction = !forceIndividualLoop && [
        "Converter em Lote (ZIP)", "Juntar PDFs", "Juntar DOCX", "Renomear em Lote (ZIP)", "Imagens para PDF", "Extrair Tabelas (PDF)", "Reconhecimento OCR"
    ].includes(action);

    if (isBatchAction) {
        let progressText = `Processando ${selectedFiles.length} arquivos...`;
        if (action === "Converter em Lote (ZIP)") {
            progressText = `Convertendo e compactando ${selectedFiles.length} arquivos em lote...`;
        } else if (action === "Renomear em Lote (ZIP)") {
            progressText = `Renomeando e compactando ${selectedFiles.length} arquivos em lote...`;
        } else if (action === "Imagens para PDF") {
            progressText = `Combinando ${selectedFiles.length} imagens em um único PDF...`;
        } else if (action === "Juntar DOCX") {
            progressText = `Combinando ${selectedFiles.length} documentos em um único DOCX...`;
        } else if (action === "Extrair Tabelas (PDF)") {
            progressText = `Extraindo tabelas de ${selectedFiles.length} PDFs em lote...`;
        } else if (action === "Reconhecimento OCR") {
            progressText = `Executando OCR em ${selectedFiles.length} arquivos em lote...`;
        }
        document.getElementById('progress-label').textContent = progressText;

        const formData = new FormData();
        formData.append('acao', action);
        if (selectedFormatOverride) formData.append('formato_saida', selectedFormatOverride);
        if (delimiter) formData.append('csv_delimiter', delimiter);
        if (password) formData.append('senha', password);
        formData.append('marca_dagua', watermarkText);
        formData.append('paginas_remover', pagesToRemove);
        formData.append('angulo', rotationAngle);
        formData.append('tamanho_mb', sizeMB);
        formData.append('padrao_nome', renamePattern);

        for (let file of selectedFiles) {
            formData.append('files', file);
        }
        try {
            const response = await fetch('/api/converter', { method: 'POST', body: formData });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                
                let downloadName = "pdfs_juntos.pdf";
                if (action === "Imagens para PDF") {
                    downloadName = "imagens_juntas.pdf";
                } else if (action === "Juntar DOCX") {
                    downloadName = "documentos_juntos.docx";
                } else if (action === "Converter em Lote (ZIP)") {
                    downloadName = (originalAction === "Imagens para PDF") ? "imagens_individuais.zip" : "lote_convertido.zip";
                } else if (action === "Renomear em Lote (ZIP)") {
                    downloadName = "lote_renomeado.zip";
                } else if (action === "Extrair Tabelas (PDF)") {
                    downloadName = "tabelas_extraidas.zip";
                } else if (action === "Reconhecimento OCR") {
                    downloadName = "ocr_lote.zip";
                }
                
                a.download = downloadName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                successCount++;

                // Adiciona ao Histórico de forma robusta
                const historyList = document.getElementById('dynamic-history-list');
                const emptyPlaceholder = historyList.querySelector('span.material-symbols-outlined');
                if (emptyPlaceholder && emptyPlaceholder.style.opacity === '0.5') {
                    historyList.innerHTML = '';
                }
                const date = new Date().toLocaleTimeString();
                historyList.innerHTML = `
                    <div class="history-item">
                        <div class="history-meta">
                            <span class="status-icon">check_circle</span>
                            <div class="history-details">
                                <div class="name">${originalAction}: ${downloadName}</div>
                                <div class="date">Hoje às ${date}</div>
                            </div>
                        </div>
                    </div>
                ` + historyList.innerHTML;
            } else {
                const errResult = await response.json().catch(() => ({}));
                let errLabel = "Erro no processamento";
                if (action === "Converter em Lote (ZIP)") errLabel = "Erro ao processar lote";
                else if (action === "Renomear em Lote (ZIP)") errLabel = "Erro ao renomear arquivos";
                else if (action === "Imagens para PDF") errLabel = "Erro ao combinar imagens";
                else if (action === "Juntar DOCX") errLabel = "Erro ao combinar documentos";
                else if (action === "Extrair Tabelas (PDF)") errLabel = "Erro ao extrair tabelas";
                else if (action === "Reconhecimento OCR") errLabel = "Erro no OCR";
                showAlert(`${errLabel}: ${errResult.message || response.statusText}`, 'error');
                errorsCount++;
            }
        } catch (err) {
            showAlert(`Falha de rede: ${err.message}`, 'error');
            errorsCount++;
        }
    } else {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            document.getElementById('progress-label').textContent = `Processando: ${file.name} (${i + 1}/${selectedFiles.length})...`;

            const formData = new FormData();
            formData.append('files', file);
            formData.append('acao', action);
            formData.append('senha', password);
            formData.append('formato_saida', selectedFormat);
            formData.append('csv_delimiter', delimiter);
            formData.append('marca_dagua', watermarkText);
            formData.append('paginas_remover', pagesToRemove);
            formData.append('angulo', rotationAngle);
            formData.append('texto_censura', censorText || '');
            formData.append('paginas_extrair', extractPages || '');
            if (pfxFile) formData.append('certificado_pfx', pfxFile);
            formData.append('tamanho_mb', sizeMB);
            formData.append('padrao_nome', renamePattern);

            try {
                const response = await fetch('/api/converter', { method: 'POST', body: formData });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    
                    let downloadName = `processado_${file.name}`;
                    const disposition = response.headers.get('Content-Disposition');
                    if (disposition && disposition.includes('filename=')) {
                        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                        const matches = filenameRegex.exec(disposition);
                        if (matches != null && matches[1]) downloadName = matches[1].replace(/['"]/g, '');
                    }

                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = downloadName;
                    document.body.appendChild(a);
                    a.click();
                    
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    successCount++;

                    // Adiciona ao Histórico de forma robusta
                    const historyList = document.getElementById('dynamic-history-list');
                    const emptyPlaceholder = historyList.querySelector('span.material-symbols-outlined');
                    if (emptyPlaceholder && emptyPlaceholder.style.opacity === '0.5') {
                        historyList.innerHTML = '';
                    }
                    const date = new Date().toLocaleTimeString();
                    historyList.innerHTML = `
                        <div class="history-item">
                            <div class="history-meta">
                                <span class="status-icon">check_circle</span>
                                <div class="history-details">
                                    <div class="name">${originalAction}: ${downloadName}</div>
                                    <div class="date">Hoje às ${date}</div>
                                </div>
                            </div>
                        </div>
                    ` + historyList.innerHTML;
                } else {
                    const errResult = await response.json().catch(() => ({}));
                    showAlert(`Erro em ${file.name}: ${errResult.message || response.statusText}`, 'error');
                    errorsCount++;
                }
            } catch (err) {
                showAlert(`Falha de rede ao processar ${file.name}: ${err.message}`, 'error');
                errorsCount++;
            }
        }
    }

    progressWrapper.style.display = 'none';
    convertBtn.removeAttribute('disabled');
    document.getElementById('progress-label').textContent = 'Processando fila de arquivos offline...';

    if (errorsCount === 0) {
        showAlert(`<strong>Conversão concluída com sucesso!</strong><br>Todos os ${successCount} arquivo(s) foram baixados diretamente no seu navegador.`, 'success');
        const soundSwitch = document.getElementById('sound-alert-switch');
        if (soundSwitch && soundSwitch.selected) {
            playCompletionSound();
        }
        // Limpa a fila automaticamente
        selectedFiles = [];
        currentPreviewIndex = 0;
        renderQueue();
        updateControlsState();
        renderPreview();
    } else if (successCount > 0) {
        showAlert(`<strong>Conversão concluída com avisos</strong><br>Sucesso: ${successCount} | Falhas: ${errorsCount}. Verifique os alertas exibidos.`, 'error');
    }
}

function translateError(errorMsg) {
    const errorObj = {
        title: "Ocorreu um erro no processamento",
        description: "Não foi possível concluir a ação devido a um problema inesperado no servidor.",
        tip: "Certifique-se de que o arquivo enviado não está corrompido e de que o formato de destino é compatível.",
        original: errorMsg
    };

    if (!errorMsg || typeof errorMsg !== 'string') {
        return errorObj;
    }

    const cleanMsg = errorMsg.toLowerCase();

    // 1. Conexão / Rede / Servidor local desligado
    if (cleanMsg.includes("failed to fetch") || cleanMsg.includes("erro ao conectar") || cleanMsg.includes("falha de rede") || cleanMsg.includes("network error") || cleanMsg.includes("localhost") || cleanMsg.includes("127.0.0.1")) {
        errorObj.title = "Falha de Conexão com o Servidor Local";
        errorObj.description = "Não foi possível se comunicar com o motor de conversão que roda na sua máquina.";
        errorObj.tip = "Verifique se você abriu o programa executável (ou rodou <code>python server.py</code> no terminal). Se o programa estiver aberto, feche-o e tente abri-lo novamente para reiniciar o servidor local.";
        return errorObj;
    }

    // 2. Senhas do PDF
    if (cleanMsg.includes("senha incorreta") || cleanMsg.includes("password") || cleanMsg.includes("incorrect password") || cleanMsg.includes("authenticate")) {
        errorObj.title = "Senha do PDF Incorreta";
        errorObj.description = "O arquivo PDF enviado está protegido por criptografia e a senha fornecida não é válida.";
        errorObj.tip = "Por favor, digite a senha correta no campo correspondente antes de iniciar o processo de desbloqueio ou assinatura.";
        return errorObj;
    }

    // 3. Validação de Intervalos de Páginas
    if (cleanMsg.includes("valor inválido encontrado") || cleanMsg.includes("invalid literal") || cleanMsg.includes("remover páginas") || cleanMsg.includes("extrair páginas")) {
        errorObj.title = "Intervalo de Páginas Inválido";
        errorObj.description = "O formato das páginas informado é inválido ou contém letras/símbolos não permitidos.";
        errorObj.tip = "Use apenas números inteiros maiores que zero e hifens para especificar intervalos de páginas, separados por vírgula. Exemplos válidos: <code>1</code>, <code>3-5</code> ou <code>1, 3-5, 8</code>.";
        return errorObj;
    }

    // 4. Fora de Limites
    if (cleanMsg.includes("fora dos limites do documento") || cleanMsg.includes("page number out of range")) {
        errorObj.title = "Página Inexistente";
        errorObj.description = "Um ou mais números de página indicados são maiores do que o número total de páginas que este documento possui.";
        errorObj.tip = "Abra o documento PDF e confirme a quantidade total de páginas antes de selecionar quais quer extrair ou remover.";
        return errorObj;
    }

    // 5. Remover todas as páginas do PDF
    if (cleanMsg.includes("remover todas as páginas")) {
        errorObj.title = "Não é Permitido Esvaziar o PDF";
        errorObj.description = "Você tentou remover todas as páginas deste documento PDF.";
        errorObj.tip = "Um documento PDF precisa ter ao menos uma página. Se o seu objetivo é deletar o arquivo do computador, você pode fazer isso diretamente pelo Explorador de Arquivos.";
        return errorObj;
    }

    // 6. FFmpeg ausente
    if (cleanMsg.includes("ffmpeg não encontrado") || cleanMsg.includes("ffmpeg_bin")) {
        errorObj.title = "Motor de Áudio e Vídeo (FFmpeg) Ausente";
        errorObj.description = "O programa precisa do utilitário complementar 'FFmpeg' para poder compactar, converter ou extrair áudio e vídeo.";
        errorObj.tip = "Crie uma pasta chamada <code>ffmpeg_bin</code> na pasta onde o conversor está instalado e coloque o arquivo <code>ffmpeg.exe</code> dentro dela, ou instale o FFmpeg nas variáveis de ambiente do seu Windows.";
        return errorObj;
    }

    // 7. Falha de execução no FFmpeg (arquivo corrompido, etc)
    if (cleanMsg.includes("erro do ffmpeg") || cleanMsg.includes("retcode") || cleanMsg.includes("returncode")) {
        errorObj.title = "Erro no Processamento do Vídeo/Áudio";
        errorObj.description = "O motor local de mídia (FFmpeg) encontrou um problema ao ler ou converter o seu arquivo.";
        errorObj.tip = "Verifique se o vídeo ou áudio não está corrompido. Certifique-se de que ele abre e reproduz normalmente em outros programas do seu computador.";
        return errorObj;
    }

    // 8. LibreOffice ausente
    if (cleanMsg.includes("libreoffice não foi encontrado") || cleanMsg.includes("soffice") || cleanMsg.includes("libreoffice")) {
        errorObj.title = "Motor de Documentos (LibreOffice) Ausente";
        errorObj.description = "O conversor necessita do LibreOffice para converter arquivos do Microsoft Office (como DOC, DOCX, PPT, PPTX) para outros formatos.";
        errorObj.tip = "Instale o LibreOffice no seu computador ou, caso queira utilizá-lo de forma portátil sem instalar, crie uma pasta chamada <code>LibreOfficePortable</code> contendo os arquivos dele dentro da pasta do conversor.";
        return errorObj;
    }

    // 9. Bibliotecas Python faltantes
    if (cleanMsg.includes("pillow")) {
        errorObj.title = "Módulo de Imagens Ausente (Pillow)";
        errorObj.description = "Falta um pacote de processamento de imagem no servidor local.";
        errorObj.tip = "Para resolver, abra o terminal no seu ambiente de desenvolvimento e execute: <code>pip install Pillow</code>.";
        return errorObj;
    }
    if (cleanMsg.includes("pandas") || cleanMsg.includes("openpyxl") || cleanMsg.includes("xlrd") || cleanMsg.includes("pyarrow")) {
        errorObj.title = "Módulo de Planilhas Ausente (Pandas)";
        errorObj.description = "Falta um pacote necessário para manipulação de planilhas e dados estruturados.";
        errorObj.tip = "Para resolver, abra o terminal no seu ambiente de desenvolvimento e execute: <code>pip install pandas openpyxl xlrd pyarrow</code>.";
        return errorObj;
    }
    if (cleanMsg.includes("pdf2docx")) {
        errorObj.title = "Módulo de Conversão PDF para Word Ausente";
        errorObj.description = "O pacote necessário para converter PDFs diretamente em Word (.docx) não está instalado.";
        errorObj.tip = "Para resolver, abra o terminal no seu ambiente de desenvolvimento e execute: <code>pip install pdf2docx</code>.";
        return errorObj;
    }
    if (cleanMsg.includes("python-docx")) {
        errorObj.title = "Módulo de Word Ausente (python-docx)";
        errorObj.description = "Falta um pacote necessário para ler ou gerar arquivos de texto do Microsoft Word.";
        errorObj.tip = "Para resolver, abra o terminal no seu ambiente de desenvolvimento e execute: <code>pip install python-docx</code>.";
        return errorObj;
    }
    if (cleanMsg.includes("odfpy")) {
        errorObj.title = "Módulo de Planilhas ODS Ausente";
        errorObj.description = "O leitor de planilhas LibreOffice (.ods) não está instalado.";
        errorObj.tip = "Para resolver, abra o terminal no seu ambiente de desenvolvimento e execute: <code>pip install odfpy</code>.";
        return errorObj;
    }
    if (cleanMsg.includes("pyyaml")) {
        errorObj.title = "Módulo YAML Ausente";
        errorObj.description = "Falta o pacote necessário para ler ou gerar arquivos no formato YAML.";
        errorObj.tip = "Para resolver, abra o terminal no seu ambiente de desenvolvimento e execute: <code>pip install PyYAML</code>.";
        return errorObj;
    }
    if (cleanMsg.includes("pyhanko")) {
        errorObj.title = "Módulo de Assinatura Digital Ausente";
        errorObj.description = "O pacote de criptografia necessário para assinar PDFs digitalmente não foi encontrado no servidor.";
        errorObj.tip = "Para resolver, abra o terminal no seu ambiente de desenvolvimento e execute: <code>pip install pyhanko</code>.";
        return errorObj;
    }

    // 10. Conversão não suportada
    if (cleanMsg.includes("não é suportada") || cleanMsg.includes("operação não permitida") || cleanMsg.includes("destino desconhecido")) {
        errorObj.title = "Conversão Não Suportada";
        errorObj.description = "O conversor não suporta transformar este tipo de arquivo específico no formato de destino selecionado.";
        errorObj.tip = "Consulte o guia de ajuda (aba <strong>'Como Usar'</strong> no topo do painel) para verificar a lista de formatos compatíveis.";
        return errorObj;
    }

    // 11. Banco SQLite vazio
    if (cleanMsg.includes("nenhuma tabela de usuário encontrada")) {
        errorObj.title = "Banco de Dados sem Tabelas";
        errorObj.description = "Este banco de dados SQLite não possui tabelas criadas com dados legíveis para exportação.";
        errorObj.tip = "Certifique-se de que o arquivo enviado é um banco de dados válido e possui dados inseridos em tabelas de usuário.";
        return errorObj;
    }

    // 12. Erro genérico do motor
    if (cleanMsg.includes("erro de conversão") || cleanMsg.includes("erro de processamento") || cleanMsg.includes("falha ao processar")) {
        errorObj.title = "Falha no Processamento do Arquivo";
        errorObj.description = "O motor de conversão não conseguiu processar este arquivo.";
        errorObj.tip = "Certifique-se de que o arquivo não está corrompido, correndo ou protegido por uma senha de leitura.";
        return errorObj;
    }

    return errorObj;
}

function downloadFile(filename) {
    window.location.href = `/api/download/${filename}`;
}

function showAlert(msg, type) {
    statusAlert.style.display = 'block';
    statusAlert.className = 'status-alert ' + type;
    
    if (type === 'error') {
        const errorObj = translateError(msg);
        statusAlert.innerHTML = `
            <div class="alert-content-wrapper">
                <div class="alert-header">
                    <span class="material-symbols-outlined alert-icon" style="color: var(--md-sys-color-error);">error</span>
                    <span class="alert-title">${errorObj.title}</span>
                </div>
                <div class="alert-body">
                    <p class="alert-description">${errorObj.description}</p>
                    ${errorObj.tip ? `<p class="alert-tip"><strong>💡 Dica:</strong> ${errorObj.tip}</p>` : ''}
                </div>
                <details class="alert-details">
                    <summary>Informações técnicas para suporte</summary>
                    <code>${errorObj.original}</code>
                </details>
            </div>
        `;
    } else {
        let icon = type === 'success' ? 'check_circle' : 'info';
        let iconColor = type === 'success' ? '#34d399' : 'var(--md-sys-color-primary)';
        statusAlert.innerHTML = `
            <div class="alert-content-wrapper">
                <div class="alert-header" style="align-items: center;">
                    <span class="material-symbols-outlined alert-icon" style="color: ${iconColor}; margin-right: 12px;">${icon}</span>
                    <div style="flex: 1; line-height: 1.4;">${msg}</div>
                </div>
            </div>
        `;
    }
}

// Limpa notificações
function clearAlert() {
    statusAlert.style.display = 'none';
    statusAlert.innerHTML = '';
}

// WebSocket for Real-time Log
let ws = null;
const toggleTerminalBtn = document.getElementById('toggle-terminal');
const terminalContainer = document.getElementById('terminal-container');
const terminalOutput = document.getElementById('terminal-output');

if (toggleTerminalBtn) {
    toggleTerminalBtn.addEventListener('change', () => {
        if (toggleTerminalBtn.selected) {
            terminalContainer.classList.remove('hidden');
            connectWebSocket();
        } else {
            terminalContainer.classList.add('hidden');
            if (ws) {
                ws.close();
                ws = null;
            }
        }
    });
}

function connectWebSocket() {
    if (ws) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/log`;
    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        // Remove ANSI escape codes
        const text = event.data.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
        
        const logLine = document.createElement('div');
        logLine.textContent = text;
        
        // Apply color class based on content
        if (text.includes('[INFO]')) {
            logLine.className = 'log-info';
        } else if (text.includes('[WARNING]')) {
            logLine.className = 'log-warning';
        } else if (text.includes('[ERROR]')) {
            logLine.className = 'log-error';
        } else {
            logLine.className = 'log-neutral';
        }

        terminalOutput.appendChild(logLine);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };

    ws.onerror = () => {
        const logLine = document.createElement('div');
        logLine.style.color = '#F2B8B5';
        logLine.textContent = '\n[Erro de conexão com Terminal]\n';
        terminalOutput.appendChild(logLine);
    };

    ws.onclose = () => {
        ws = null;
        if (toggleTerminalBtn && toggleTerminalBtn.selected) {
            setTimeout(connectWebSocket, 3000);
        }
    };
}

// Theme toggle logic
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

// Initial check
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.classList.add('light-theme');
    themeIcon.textContent = 'dark_mode';
}

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light-theme');
    if (document.documentElement.classList.contains('light-theme')) {
        themeIcon.textContent = 'dark_mode';
    } else {
        themeIcon.textContent = 'light_mode';
    }
});

// ------------------ Heartbeat para fechamento automático ------------------
// Mantém uma conexão WebSocket aberta. Se a aba for fechada, o WebSocket
// desconecta imediatamente e o servidor encerra o processo. Se a aba apenas
// perder o foco, a conexão WebSocket permanece activa.
function connectHeartbeat() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/heartbeat`;
    const heartbeatWs = new WebSocket(wsUrl);
    
    // Mantém compatibilidade com o ping HTTP em navegadores antigos ou falhas do ws
    const fallbackInterval = setInterval(() => {
        if (heartbeatWs.readyState !== WebSocket.OPEN) {
            fetch('/api/heartbeat', { method: 'POST' }).catch(() => {});
        }
    }, 5000);

    heartbeatWs.onclose = () => {
        clearInterval(fallbackInterval);
        setTimeout(connectHeartbeat, 2000);
    };
}
connectHeartbeat();
