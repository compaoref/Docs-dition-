// ===== DOCFLOW - ÉDITEUR DE DOCUMENTS MULTI-FORMAT =====

// Configuration
const CONFIG = {
    STORAGE_KEY: 'docflow_documents',
    STORAGE_LIMIT: 10 * 1024 * 1024, // 10 MB
    AUTO_SAVE_INTERVAL: 10000, // 10 secondes
};

// Variables globales
let currentDocument = null;
let quillEditor = null;
let spreadsheetData = {};
let slidesData = {};
let autoSaveTimeout = null;

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    loadDocuments();
});

function initializeApp() {
    // Initialiser les listeners
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    // Setup Quill Editor
    initializeQuillEditor();
    
    // Cleanup on beforeunload
    window.addEventListener('beforeunload', saveCurrentDocument);
}

// ===== DOCUMENT MANAGEMENT =====

class Document {
    constructor(name, type) {
        this.id = Date.now().toString();
        this.name = name;
        this.type = type; // 'text', 'sheet', 'slides'
        this.createdAt = new Date().toISOString();
        this.modifiedAt = new Date().toISOString();
        this.content = this.getDefaultContent();
        this.metadata = {
            wordCount: 0,
            rows: 10,
            columns: 10,
            slideCount: 1
        };
    }

    getDefaultContent() {
        switch(this.type) {
            case 'text':
                return '';
            case 'sheet':
                return this.createEmptySheet(10, 10);
            case 'slides':
                return [{ content: '', background: '#ffffff' }];
            default:
                return null;
        }
    }

    createEmptySheet(rows, cols) {
        const sheet = [];
        for (let r = 0; r < rows; r++) {
            sheet[r] = [];
            for (let c = 0; c < cols; c++) {
                sheet[r][c] = '';
            }
        }
        return sheet;
    }
}

function createNewDocument(type) {
    const name = `Nouveau ${type === 'text' ? 'Document' : type === 'sheet' ? 'Tableur' : 'Présentation'}`;
    const doc = new Document(name, type);
    
    const documents = getStoredDocuments();
    documents.push(doc);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(documents));
    
    loadDocuments();
    openDocument(doc.id);
}

function openDocument(docId) {
    const documents = getStoredDocuments();
    const doc = documents.find(d => d.id === docId);
    
    if (!doc) {
        alert('Document non trouvé');
        return;
    }

    currentDocument = doc;
    showView('editor');

    document.getElementById('editorTitle').textContent = doc.name;

    switch(doc.type) {
        case 'text':
            setupTextEditor(doc);
            break;
        case 'sheet':
            setupSheetEditor(doc);
            break;
        case 'slides':
            setupSlidesEditor(doc);
            break;
    }

    updateDocumentSize();
}

function saveCurrentDocument() {
    if (!currentDocument) return;

    switch(currentDocument.type) {
        case 'text':
            currentDocument.content = quillEditor.root.innerHTML;
            break;
        case 'sheet':
            currentDocument.content = spreadsheetData;
            break;
        case 'slides':
            currentDocument.content = slidesData;
            break;
    }

    currentDocument.modifiedAt = new Date().toISOString();

    const documents = getStoredDocuments();
    const index = documents.findIndex(d => d.id === currentDocument.id);
    if (index !== -1) {
        documents[index] = currentDocument;
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(documents));
    }
}

function deleteDocument(docId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document?')) return;

    const documents = getStoredDocuments();
    const filtered = documents.filter(d => d.id !== docId);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(filtered));

    loadDocuments();
    showAlert('Document supprimé', 'success');
}

function duplicateDocument(docId) {
    const documents = getStoredDocuments();
    const doc = documents.find(d => d.id === docId);

    if (!doc) return;

    const newDoc = new Document(doc.name + ' (copie)', doc.type);
    newDoc.content = JSON.parse(JSON.stringify(doc.content));
    
    documents.push(newDoc);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(documents));

    loadDocuments();
    showAlert('Document dupliqué', 'success');
}

// ===== DOCUMENT LOADING & DISPLAY =====

function getStoredDocuments() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function loadDocuments() {
    const documents = getStoredDocuments();
    const container = document.getElementById('documentsList');
    
    if (documents.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📄</div>
                <h3 style="color: var(--gray); margin-bottom: 10px;">Aucun document</h3>
                <p style="color: var(--gray); margin-bottom: 20px;">Créez ou importez un document pour commencer</p>
                <button class="btn btn-primary" onclick="openImportModal()">📥 Importer</button>
            </div>
        `;
        return;
    }

    container.innerHTML = documents.map(doc => `
        <div class="document-card">
            <div class="doc-icon">${getDocumentIcon(doc.type)}</div>
            <div class="doc-name">${doc.name}</div>
            <div class="doc-meta">
                ${new Date(doc.modifiedAt).toLocaleDateString('fr-FR')}
            </div>
            <div class="doc-actions">
                <button class="doc-action-btn" onclick="openDocument('${doc.id}')">Ouvrir</button>
                <button class="doc-action-btn" onclick="duplicateDocument('${doc.id}')">Dupliquer</button>
                <button class="doc-action-btn" onclick="deleteDocument('${doc.id}')" style="background: #fee2e2; color: var(--danger);">Supprimer</button>
            </div>
        </div>
    `).join('');
}

function getDocumentIcon(type) {
    const icons = {
        'text': '📝',
        'sheet': '📊',
        'slides': '🎞️'
    };
    return icons[type] || '📄';
}

// ===== TEXT EDITOR SETUP =====

function initializeQuillEditor() {
    const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
    ];

    quillEditor = new Quill('#textEditor', {
        theme: 'snow',
        placeholder: 'Commencez à écrire...',
        modules: {
            toolbar: toolbarOptions
        }
    });

    quillEditor.on('text-change', () => {
        saveWithDelay();
    });
}

function setupTextEditor(doc) {
    const toolbar = document.getElementById('toolbar');
    toolbar.innerHTML = `
        <div class="toolbar-group">
            <button class="tool-btn" title="Gras" onclick="quillEditor.format('bold', true)" data-hotkey="b">
                <strong>B</strong>
            </button>
            <button class="tool-btn" title="Italique" onclick="quillEditor.format('italic', true)" data-hotkey="i">
                <i>I</i>
            </button>
            <button class="tool-btn" title="Souligner" onclick="quillEditor.format('underline', true)" data-hotkey="u">
                <u>U</u>
            </button>
        </div>
        <div class="toolbar-group">
            <select class="tool-select" onchange="setFontSize(this.value)">
                <option value="">Taille</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
            </select>
        </div>
        <div class="toolbar-group">
            <button class="tool-btn" title="Titre H1" onclick="quillEditor.format('header', 1)">H1</button>
            <button class="tool-btn" title="Titre H2" onclick="quillEditor.format('header', 2)">H2</button>
        </div>
        <div class="toolbar-group">
            <button class="tool-btn" title="Liste à puces" onclick="quillEditor.format('list', 'bullet')">• Liste</button>
            <button class="tool-btn" title="Liste numérotée" onclick="quillEditor.format('list', 'ordered')">1. Num</button>
        </div>
        <div class="toolbar-group">
            <button class="tool-btn" title="Annuler" onclick="quillEditor.history.undo()">↶ Undo</button>
            <button class="tool-btn" title="Refaire" onclick="quillEditor.history.redo()">↷ Redo</button>
        </div>
    `;

    const workspace = document.getElementById('workspace');
    workspace.innerHTML = '<div id="textEditor"></div>';
    
    // Reinitialize Quill
    initializeQuillEditor();
    quillEditor.root.innerHTML = doc.content;
}

function setFontSize(size) {
    if (size) {
        quillEditor.format('size', size);
    }
}

// ===== SPREADSHEET EDITOR SETUP =====

function setupSheetEditor(doc) {
    spreadsheetData = doc.content;

    const toolbar = document.getElementById('toolbar');
    toolbar.innerHTML = `
        <div class="toolbar-group">
            <button class="tool-btn" onclick="insertRow()">➕ Ligne</button>
            <button class="tool-btn" onclick="insertColumn()">➕ Colonne</button>
        </div>
        <div class="toolbar-group">
            <button class="tool-btn" onclick="deleteSelectedRow()">➖ Ligne</button>
            <button class="tool-btn" onclick="deleteSelectedColumn()">➖ Colonne</button>
        </div>
        <div class="toolbar-group">
            <button class="tool-btn" onclick="makeBoldSelection()" title="Gras"><strong>B</strong></button>
            <button class="tool-btn" onclick="changeBackgroundColor()" title="Couleur">🎨</button>
        </div>
    `;

    const workspace = document.getElementById('workspace');
    workspace.innerHTML = '<div class="spreadsheet-container"><div class="spreadsheet-grid"><table class="grid-table" id="spreadsheetTable"></table></div></div>';

    renderSpreadsheet();
}

function renderSpreadsheet() {
    const table = document.getElementById('spreadsheetTable');
    table.innerHTML = '';

    // Header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<td class="grid-cell grid-row-header"></td>';
    
    for (let c = 0; c < spreadsheetData[0].length; c++) {
        const th = document.createElement('td');
        th.className = 'grid-cell grid-header';
        th.textContent = String.fromCharCode(65 + c);
        headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Data rows
    for (let r = 0; r < spreadsheetData.length; r++) {
        const tr = document.createElement('tr');
        
        const rowHeader = document.createElement('td');
        rowHeader.className = 'grid-cell grid-row-header';
        rowHeader.textContent = r + 1;
        tr.appendChild(rowHeader);

        for (let c = 0; c < spreadsheetData[r].length; c++) {
            const td = document.createElement('td');
            td.className = 'grid-cell';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'grid-input';
            input.value = spreadsheetData[r][c];
            input.onchange = () => {
                spreadsheetData[r][c] = input.value;
                saveWithDelay();
            };
            
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

function insertRow() {
    const newRow = new Array(spreadsheetData[0].length).fill('');
    spreadsheetData.push(newRow);
    renderSpreadsheet();
    saveWithDelay();
}

function insertColumn() {
    spreadsheetData.forEach(row => {
        row.push('');
    });
    renderSpreadsheet();
    saveWithDelay();
}

function deleteSelectedRow() {
    if (spreadsheetData.length > 1) {
        spreadsheetData.pop();
        renderSpreadsheet();
        saveWithDelay();
    }
}

function deleteSelectedColumn() {
    if (spreadsheetData[0].length > 1) {
        spreadsheetData.forEach(row => {
            row.pop();
        });
        renderSpreadsheet();
        saveWithDelay();
    }
}

function makeBoldSelection() {
    alert('Fonctionnalité de formatage à implémenter');
}

function changeBackgroundColor() {
    const color = prompt('Couleur (hex):', '#ffffff');
    if (color) {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.style.backgroundColor = color;
        });
    }
}

// ===== SLIDES EDITOR SETUP =====

function setupSlidesEditor(doc) {
    slidesData = doc.content;

    const toolbar = document.getElementById('toolbar');
    toolbar.innerHTML = `
        <div class="toolbar-group">
            <button class="tool-btn" onclick="addSlide()">➕ Ajouter Slide</button>
            <button class="tool-btn" onclick="deleteSlide()">➖ Supprimer</button>
        </div>
        <div class="toolbar-group">
            <button class="tool-btn" onclick="changeSlideBackground()">🎨 Fond</button>
        </div>
        <div class="toolbar-group">
            <button class="tool-btn" onclick="presentationMode()">▶️ Présenter</button>
        </div>
    `;

    const workspace = document.getElementById('workspace');
    workspace.innerHTML = `
        <div class="slides-container">
            <div class="slides-panel" id="slidesPanel"></div>
            <div class="slide-editor"><div class="slide-canvas" id="slideCanvas" contenteditable="true"></div></div>
        </div>
    `;

    renderSlides();
}

function renderSlides() {
    const panel = document.getElementById('slidesPanel');
    panel.innerHTML = '';

    slidesData.forEach((slide, index) => {
        const thumb = document.createElement('div');
        thumb.className = `slide-thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<div style="text-align: center; width: 100%;">
            <div style="font-size: 0.9rem; margin-bottom: 5px;">Slide ${index + 1}</div>
        </div>`;
        thumb.onclick = () => selectSlide(index);
        panel.appendChild(thumb);
    });

    selectSlide(0);
}

function selectSlide(index) {
    if (slidesData[index]) {
        const canvas = document.getElementById('slideCanvas');
        canvas.style.backgroundColor = slidesData[index].background;
        canvas.innerHTML = slidesData[index].content;

        document.querySelectorAll('.slide-thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
}

function addSlide() {
    slidesData.push({ content: '<h1>Nouvelle Slide</h1>', background: '#ffffff' });
    renderSlides();
    saveWithDelay();
}

function deleteSlide() {
    if (slidesData.length > 1) {
        slidesData.pop();
        renderSlides();
        saveWithDelay();
    }
}

function changeSlideBackground() {
    const color = prompt('Couleur (hex):', '#ffffff');
    if (color && slidesData.length > 0) {
        const activeSlide = document.querySelector('.slide-thumbnail.active');
        const index = Array.from(document.querySelectorAll('.slide-thumbnail')).indexOf(activeSlide);
        slidesData[index].background = color;
        selectSlide(index);
        saveWithDelay();
    }
}

function presentationMode() {
    alert('Mode présentation à implémenter');
}

// ===== IMPORT/EXPORT =====

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
        const docName = document.getElementById('docNameInput').value || file.name;
        importFileContent(e.target.result, file.type, file.name, docName);
    };

    if (file.type === 'application/pdf' || file.type === 'text/plain' || file.type === 'text/markdown') {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function importFileContent(content, type, fileName, docName) {
    const doc = new Document(docName, 'text');
    
    // Simple import: convert all to text for now
    if (typeof content === 'string') {
        doc.content = content;
    } else {
        doc.content = '[Fichier binaire importé]';
    }

    const documents = getStoredDocuments();
    
    // Check storage limit
    const currentSize = JSON.stringify(documents).length;
    if (currentSize > CONFIG.STORAGE_LIMIT) {
        showAlert('Stockage plein! Supprimez des documents.', 'error');
        return;
    }

    documents.push(doc);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(documents));

    loadDocuments();
    closeModal('importModal');
    showAlert('Document importé avec succès', 'success');
}

function importDocument() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) {
        showAlert('Sélectionnez un fichier', 'error');
        return;
    }

    handleFileSelect({ target: { files: [file] } });
}

function exportDocument() {
    if (!currentDocument) return;

    const format = document.getElementById('exportFormat').value;
    saveCurrentDocument();

    switch(format) {
        case 'pdf':
            exportAsPDF();
            break;
        case 'docx':
            exportAsDOCX();
            break;
        case 'xlsx':
            exportAsXLSX();
            break;
        case 'txt':
            exportAsTXT();
            break;
        case 'md':
            exportAsMarkdown();
            break;
        case 'csv':
            exportAsCSV();
            break;
    }

    closeModal('exportModal');
    showAlert('Document exporté', 'success');
}

function exportAsTXT() {
    let content = '';
    
    if (currentDocument.type === 'text') {
        content = quillEditor.getText();
    } else if (currentDocument.type === 'sheet') {
        content = spreadsheetData.map(row => row.join('\t')).join('\n');
    } else if (currentDocument.type === 'slides') {
        content = slidesData.map((s, i) => `=== SLIDE ${i + 1} ===\n${s.content}`).join('\n\n');
    }

    downloadFile(content, `${currentDocument.name}.txt`, 'text/plain');
}

function exportAsMarkdown() {
    let content = `# ${currentDocument.name}\n\n`;
    
    if (currentDocument.type === 'text') {
        content += quillEditor.getText();
    }

    downloadFile(content, `${currentDocument.name}.md`, 'text/markdown');
}

function exportAsCSV() {
    let content = '';
    
    if (currentDocument.type === 'sheet') {
        content = spreadsheetData.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }

    downloadFile(content, `${currentDocument.name}.csv`, 'text/csv');
}

function exportAsPDF() {
    showAlert('Export PDF: Nécessite une librairie externe (pdfkit)', 'error');
    // En production, utiliser jsPDF ou similaire
}

function exportAsDOCX() {
    showAlert('Export DOCX: Nécessite une librairie externe (docx)', 'error');
    // En production, utiliser docx ou similaire
}

function exportAsXLSX() {
    showAlert('Export XLSX: Nécessite une librairie externe (xlsx)', 'error');
    // En production, utiliser xlsx ou similaire
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

// ===== UI UTILITIES =====

function showView(view) {
    const views = ['dashboardView', 'editorView'];
    views.forEach(v => document.getElementById(v).classList.add('hidden'));
    
    if (view === 'dashboard') {
        document.getElementById('dashboardView').classList.remove('hidden');
    } else if (view === 'editor') {
        document.getElementById('editorView').classList.remove('hidden');
    }

    // Update sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (view === 'dashboard') {
        document.querySelectorAll('.nav-btn')[0].classList.add('active');
    }
}

function goToDashboard() {
    saveCurrentDocument();
    currentDocument = null;
    showView('dashboard');
    loadDocuments();
}

function openImportModal() {
    document.getElementById('fileInput').value = '';
    document.getElementById('docNameInput').value = '';
    document.getElementById('importModal').classList.add('show');
}

function openExportModal() {
    document.getElementById('exportModal').classList.add('show');
}

function openSettings() {
    document.getElementById('settingsModal').classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const container = document.querySelector('.dashboard-actions') || document.querySelector('.editor-header');
    if (container) {
        container.parentElement.insertBefore(alert, container.nextSibling);
    }

    setTimeout(() => alert.remove(), 3000);
}

function saveWithDelay() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        saveCurrentDocument();
    }, CONFIG.AUTO_SAVE_INTERVAL);
}

function updateDocumentSize() {
    if (!currentDocument) return;

    const data = getStoredDocuments();
    const size = JSON.stringify(data).length;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);
    
    document.getElementById('docSize').textContent = `${sizeInMB} MB utilisés`;
}

function showStorageInfo() {
    const data = getStoredDocuments();
    const size = JSON.stringify(data).length;
    const sizeInMB = (size / (1024 * 1024)).toFixed(2);
    const remaining = ((CONFIG.STORAGE_LIMIT - size) / (1024 * 1024)).toFixed(2);

    alert(`Stockage:\n\nUtilisé: ${sizeInMB} MB\nRestant: ${remaining} MB\nDocuments: ${data.length}`);
}

function setTheme(theme) {
    document.body.style.filter = theme === 'dark' ? 'invert(1)' : 'invert(0)';
}

function clearAllData() {
    if (confirm('ATTENTION! Cela supprimera TOUS vos documents. Cette action est irréversible!')) {
        if (confirm('Êtes-vous absolument sûr?')) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            loadDocuments();
            closeModal('settingsModal');
            showAlert('Tous les documents supprimés', 'success');
        }
    }
}