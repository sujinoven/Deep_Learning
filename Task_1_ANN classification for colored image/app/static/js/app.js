/**
 * CIFAR Vision — Frontend Application Controller
 * Handles drag-and-drop, image previewing, classification API interaction,
 * probability bar rendering, history management, and health checks.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const previewFilename = document.getElementById('preview-filename');
    const previewDimensions = document.getElementById('preview-dimensions');
    const previewSize = document.getElementById('preview-size');
    
    const classifyBtn = document.getElementById('classify-btn');
    const clearBtn = document.getElementById('clear-btn');
    const errorAlert = document.getElementById('error-alert');
    const errorMessage = document.getElementById('error-message');

    const resultPlaceholder = document.getElementById('result-placeholder');
    const loadingState = document.getElementById('loading-state');
    const resultContent = document.getElementById('result-content');

    const predictedIconContainer = document.getElementById('predicted-icon-container');
    const predictedClassName = document.getElementById('predicted-class-name');
    const predictedClassId = document.getElementById('predicted-class-id');
    const confidencePercentage = document.getElementById('confidence-percentage');
    const confidenceGauge = document.querySelector('.confidence-gauge');
    const probabilityBars = document.getElementById('probability-bars');

    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');

    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    let currentFile = null;

    // CIFAR-10 SVG Icon Repository
    const CLASS_ICONS = {
        airplane: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.6-.1-1.2.1-1.5.6l-.9.9c-.4.4-.3 1.1.2 1.4l5.3 3.6-3 3-2.1-.7c-.4-.1-.8 0-1.1.3l-.7.7c-.3.3-.3.8 0 1.1l2.5 2.5c.3.3.8.3 1.1 0l.7-.7c.3-.3.4-.7.3-1.1l-.7-2.1 3-3 3.6 5.3c.3.5 1 .6 1.4.2l.9-.9c.5-.3.7-.9.6-1.5z"/></svg>`,
        automobile: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`,
        bird: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 7A4 4 0 1 1 8 7A4 4 0 0 1 16 7Z"/><path d="M12 11c-4 0-7 3-7 7h14c0-4-3-7-7-7Z"/><path d="M16 4l4 2-4 2"/></svg>`,
        cat: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5c-4 0-7.5 2-7.5 7 0 4.5 3 8 7.5 8s7.5-3.5 7.5-8c0-5-3.5-7-7.5-7Z"/><path d="M4.5 9.5 2 4l5.5 2.5"/><path d="M19.5 9.5 22 4l-5.5 2.5"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="M12 15v1"/></svg>`,
        deer: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3v4l3 2"/><path d="M17 3v4l-3 2"/><circle cx="12" cy="14" r="5"/><path d="M12 19v3"/></svg>`,
        dog: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .05.439.6.8 1 .8h2"/><path d="M14 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.05.439-.6.8-1 .8h-2"/><circle cx="12" cy="14" r="6"/><circle cx="9.5" cy="12.5" r="1"/><circle cx="14.5" cy="12.5" r="1"/><path d="M12 15.5v1"/></svg>`,
        frog: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><path d="M4 14c0 4.4 3.6 8 8 8s8-3.6 8-8c0-2.5-1.2-4.7-3-6.1"/><path d="M9 16c1.5 1 4.5 1 6 0"/></svg>`,
        horse: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 13a4 4 0 0 0-4-4H8.8L5 4H2v3h1.8l2.7 4.5L5 20h3l1.5-4h4.5l1.5 4h3l-2-7Z"/></svg>`,
        ship: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.5 0 2.5 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9 1.5 5.4 3.38 6"/><path d="M12 10V4l4 2-4 2"/></svg>`,
        truck: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`
    };

    // Check Backend Model Health
    async function checkHealth() {
        try {
            const res = await fetch('/health');
            const data = await res.json();
            if (res.ok && data.model_loaded) {
                statusBadge.className = 'status-badge status-ready';
                statusText.textContent = '● Model Ready';
            } else {
                statusBadge.className = 'status-badge status-error';
                statusText.textContent = '● Model Offline';
            }
        } catch (e) {
            statusBadge.className = 'status-badge status-error';
            statusText.textContent = '● Server Offline';
        }
    }
    checkHealth();
    setInterval(checkHealth, 30000);

    // Initialize LocalStorage History
    loadHistory();

    // Event Listeners for File Selection
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleSelectedFile(e.target.files[0]);
        }
    });

    // Drag and Drop Events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-over');
        });
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt.files && dt.files[0]) {
            handleSelectedFile(dt.files[0]);
        }
    });

    // Handle File Preview & Validation
    function handleSelectedFile(file) {
        hideError();

        // Validate File Type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(file.type) && !['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
            showError('Please upload a valid PNG, JPG, JPEG, or WEBP image.');
            return;
        }

        // Validate File Size (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError('Image file is too large. Please select an image smaller than 5 MB.');
            return;
        }

        currentFile = file;

        // Render Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;

            // Load natural dimensions
            const img = new Image();
            img.onload = () => {
                previewDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;
            };
            img.src = e.target.result;

            previewFilename.textContent = file.name;
            previewSize.textContent = formatBytes(file.size);

            dropzone.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            clearBtn.classList.remove('hidden');
            classifyBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    // Classify Image API Call
    classifyBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        showLoading();
        hideError();

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.success) {
                renderResult(data);
                saveToHistory(data.class_name, data.confidence);
            } else {
                showError(data.error || 'Classification failed. Please try another image.');
                resetResultState();
            }
        } catch (err) {
            showError('Network or server error occurred. Please try again.');
            resetResultState();
        } finally {
            hideLoading();
        }
    });

    // Render Prediction Output & Probabilities
    function renderResult(data) {
        resultPlaceholder.classList.add('hidden');
        resultContent.classList.remove('hidden');

        // Set Class Name & ID
        predictedClassName.textContent = data.class_name;
        predictedClassId.textContent = `Class Index: ${data.class_id}`;

        // Set Icon SVG
        const iconSvg = CLASS_ICONS[data.class_name.toLowerCase()] || CLASS_ICONS['cat'];
        predictedIconContainer.innerHTML = iconSvg;

        // Set Confidence Meter
        const conf = data.confidence.toFixed(2);
        confidencePercentage.textContent = `${conf}%`;
        confidenceGauge.style.background = `conic-gradient(var(--cyan-light) 0deg ${conf * 3.6}deg, var(--surface) ${conf * 3.6}deg 360deg)`;

        // Render All 10 Class Probability Bars
        probabilityBars.innerHTML = '';
        
        // Sort entries by probability descending
        const sortedEntries = Object.entries(data.probabilities).sort((a, b) => b[1] - a[1]);

        sortedEntries.forEach(([clsName, pct]) => {
            const isTop = clsName.toLowerCase() === data.class_name.toLowerCase();
            const row = document.createElement('div');
            row.className = `prob-row ${isTop ? 'top-prediction' : ''}`;

            row.innerHTML = `
                <span class="prob-label">${clsName}</span>
                <div class="prob-track">
                    <div class="prob-fill" style="width: ${Math.max(pct, 1)}%;"></div>
                </div>
                <span class="prob-value">${pct.toFixed(2)}%</span>
            `;
            probabilityBars.appendChild(row);
        });
    }

    // Clear / Reset Action Handler
    clearBtn.addEventListener('click', clearAll);

    function clearAll() {
        currentFile = null;
        fileInput.value = '';
        imagePreview.src = '';
        previewFilename.textContent = '';
        previewDimensions.textContent = '-- × --';
        previewSize.textContent = '-- KB';

        previewContainer.classList.add('hidden');
        dropzone.classList.remove('hidden');
        clearBtn.classList.add('hidden');
        classifyBtn.disabled = true;

        hideError();
        resetResultState();
    }

    function resetResultState() {
        resultContent.classList.add('hidden');
        loadingState.classList.add('hidden');
        resultPlaceholder.classList.remove('hidden');
    }

    function showLoading() {
        resultPlaceholder.classList.add('hidden');
        resultContent.classList.add('hidden');
        loadingState.classList.remove('hidden');
        classifyBtn.disabled = true;
    }

    function hideLoading() {
        loadingState.classList.add('hidden');
        classifyBtn.disabled = false;
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorAlert.classList.remove('hidden');
    }

    function hideError() {
        errorAlert.classList.add('hidden');
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Client-side LocalStorage History
    function saveToHistory(className, conf) {
        let history = JSON.parse(localStorage.getItem('cifar_history') || '[]');
        history.unshift({ className, conf, timestamp: new Date().toLocaleTimeString() });
        if (history.length > 5) history = history.slice(0, 5);
        localStorage.setItem('cifar_history', JSON.stringify(history));
        loadHistory();
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('cifar_history') || '[]');
        if (history.length === 0) {
            historySection.classList.add('hidden');
            return;
        }

        historySection.classList.remove('hidden');
        historyList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <span class="history-item-class">${item.className}</span>
                <span class="history-item-conf">${item.conf.toFixed(2)}%</span>
            `;
            historyList.appendChild(div);
        });
    }

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('cifar_history');
        loadHistory();
    });
});
