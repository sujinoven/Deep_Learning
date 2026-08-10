/* ==========================================================================
   MNIST Vision AI — Client-Side Application Logic
   ========================================================================== */

let currentTab = 'upload';
let selectedFile = null;
let isDrawing = false;
let hasDrawn = false;
let canvas, ctx;

document.addEventListener('DOMContentLoaded', () => {
    initHealthCheck();
    initDragAndDrop();
    initCanvas();
    loadHistory();
});

/* --------------------------------------------------------------------------
   1. Server Health Check
   -------------------------------------------------------------------------- */
async function initHealthCheck() {
    const badge = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    try {
        const response = await fetch('/health');
        const data = await response.json();

        if (response.ok && data.model_loaded) {
            badge.className = 'status-badge status-online';
            statusText.textContent = 'Model Online';
        } else {
            badge.className = 'status-badge status-offline';
            statusText.textContent = 'Model Offline';
        }
    } catch (err) {
        badge.className = 'status-badge status-offline';
        statusText.textContent = 'Service Offline';
    }
}

/* --------------------------------------------------------------------------
   2. Tab Switching (Upload vs Canvas)
   -------------------------------------------------------------------------- */
function switchTab(tab) {
    currentTab = tab;

    const btnUpload = document.getElementById('tabUpload');
    const btnDraw = document.getElementById('tabDraw');
    const paneUpload = document.getElementById('uploadPane');
    const paneDraw = document.getElementById('drawPane');

    if (tab === 'upload') {
        btnUpload.classList.add('active');
        btnDraw.classList.remove('active');
        paneUpload.classList.remove('hidden');
        paneDraw.classList.add('hidden');
        updatePredictButtonState();
    } else {
        btnDraw.classList.add('active');
        btnUpload.classList.remove('active');
        paneDraw.classList.remove('hidden');
        paneUpload.classList.add('hidden');
        updatePredictButtonState();
    }
}

/* --------------------------------------------------------------------------
   3. File Upload & Drag and Drop Handling
   -------------------------------------------------------------------------- */
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

function initDragAndDrop() {
    const dropZone = document.getElementById('dropZone');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            processSelectedFile(files[0]);
        }
    });
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
        processSelectedFile(files[0]);
    }
}

function processSelectedFile(file) {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowed.includes(file.type)) {
        showToast('Invalid File Type', 'Please select a PNG, JPG, JPEG, or WEBP image.');
        return;
    }

    if (file.size > maxBytes) {
        showToast('File Too Large', 'Please select an image smaller than 5 MB.');
        return;
    }

    selectedFile = file;

    // Read and render image preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const previewImg = document.getElementById('imagePreview');
        previewImg.src = e.target.result;

        previewImg.onload = () => {
            document.getElementById('metaFileName').textContent = file.name;
            document.getElementById('metaFileSpecs').textContent = `${previewImg.naturalWidth} × ${previewImg.naturalHeight} px • ${(file.size / 1024).toFixed(1)} KB`;

            document.getElementById('dropZonePrompt').classList.add('hidden');
            document.getElementById('imagePreviewContainer').classList.remove('hidden');
            updatePredictButtonState();
        };
    };
    reader.readAsDataURL(file);
}

/* --------------------------------------------------------------------------
   4. Drawing Canvas Implementation
   -------------------------------------------------------------------------- */
function initCanvas() {
    canvas = document.getElementById('digitCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    resetCanvasBackground();

    // Mouse listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch listeners for mobile
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', (e) => {
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });
}

function resetCanvasBackground() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FFFFFF';
    hasDrawn = false;
    updatePredictButtonState();
}

function startDrawing(e) {
    isDrawing = true;
    hasDrawn = true;
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    updatePredictButtonState();
}

function draw(e) {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        ctx.closePath();
        isDrawing = false;
    }
}

function clearCanvas() {
    resetCanvasBackground();
}

/* --------------------------------------------------------------------------
   5. Button State & Validation
   -------------------------------------------------------------------------- */
function updatePredictButtonState() {
    const btn = document.getElementById('predictBtn');
    if (currentTab === 'upload') {
        btn.disabled = !selectedFile;
    } else {
        btn.disabled = !hasDrawn;
    }
}

/* --------------------------------------------------------------------------
   6. Run Prediction API Call
   -------------------------------------------------------------------------- */
async function runPrediction() {
    const btn = document.getElementById('predictBtn');
    const btnText = document.getElementById('btnText');
    const btnSpinner = document.getElementById('btnSpinner');

    // Set Loading state
    btn.disabled = true;
    btnText.textContent = 'Analyzing...';
    btnSpinner.classList.remove('hidden');

    try {
        let response;

        if (currentTab === 'upload') {
            if (!selectedFile) return;
            const formData = new FormData();
            formData.append('image', selectedFile);

            response = await fetch('/api/predict', {
                method: 'POST',
                body: formData
            });
        } else {
            if (!hasDrawn) return;
            const dataUrl = canvas.toDataURL('image/png');

            response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_data: dataUrl })
            });
        }

        const data = await response.json();

        if (response.ok && data.success) {
            renderResults(data);
            saveToHistory(data.prediction, data.confidence);
            document.getElementById('resetBtn').style.display = 'inline-flex';
        } else {
            showToast(data.error || 'Prediction Error', data.message || 'Failed to predict image.');
        }
    } catch (err) {
        showToast('Connection Error', 'Could not communicate with the prediction server.');
    } finally {
        btnSpinner.classList.add('hidden');
        btnText.textContent = '✦ Predict Digit';
        updatePredictButtonState();
    }
}

/* --------------------------------------------------------------------------
   7. Render Prediction & Probability Chart Results
   -------------------------------------------------------------------------- */
function renderResults(data) {
    document.getElementById('emptyResultState').classList.add('hidden');
    document.getElementById('activeResultState').classList.remove('hidden');

    // Oversized predicted digit
    document.getElementById('predictedDigit').textContent = data.prediction;

    // Confidence metric
    const confVal = data.confidence.toFixed(2);
    document.getElementById('confidenceValue').textContent = `${confVal}%`;
    document.getElementById('confidenceBarFill').style.width = `${confVal}%`;

    // Probability Bars (0 - 9)
    const probContainer = document.getElementById('probabilityBars');
    probContainer.innerHTML = '';

    for (let digit = 0; digit <= 9; digit++) {
        const prob = data.probabilities[digit.toString()] || 0;
        const percent = (prob * 100).toFixed(2);
        const isPredicted = (digit === data.prediction);

        const row = document.createElement('div');
        row.className = `prob-row ${isPredicted ? 'active' : ''}`;
        row.innerHTML = `
            <span class="prob-digit">${digit}</span>
            <div class="prob-bar-container">
                <div class="prob-bar-fill" style="width: ${percent}%;"></div>
            </div>
            <span class="prob-percent">${percent}%</span>
        `;
        probContainer.appendChild(row);
    }
}

/* --------------------------------------------------------------------------
   8. Clear & Reset State
   -------------------------------------------------------------------------- */
function resetAllState() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('dropZonePrompt').classList.remove('hidden');
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    document.getElementById('imagePreview').src = '';

    if (canvas) {
        resetCanvasBackground();
    }

    document.getElementById('activeResultState').classList.add('hidden');
    document.getElementById('emptyResultState').classList.remove('hidden');
    document.getElementById('resetBtn').style.display = 'none';

    updatePredictButtonState();
}

/* --------------------------------------------------------------------------
   9. Recent History (localStorage)
   -------------------------------------------------------------------------- */
function saveToHistory(prediction, confidence) {
    let history = JSON.parse(localStorage.getItem('mnist_history') || '[]');
    const newItem = {
        digit: prediction,
        confidence: confidence.toFixed(1),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    history.unshift(newItem);
    history = history.slice(0, 6); // keep 6 items max

    localStorage.setItem('mnist_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem('mnist_history') || '[]');
    const historySection = document.getElementById('historySection');
    const historyGrid = document.getElementById('historyGrid');

    if (!historySection || !historyGrid) return;

    if (history.length === 0) {
        historySection.classList.add('hidden');
        return;
    }

    historySection.classList.remove('hidden');
    historyGrid.innerHTML = '';

    history.forEach(item => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div class="history-digit">${item.digit}</div>
            <div class="history-info">
                <span class="history-conf">${item.confidence}%</span>
                <span class="history-time">${item.time}</span>
            </div>
        `;
        historyGrid.appendChild(card);
    });
}

function clearHistory() {
    localStorage.removeItem('mnist_history');
    loadHistory();
}

/* --------------------------------------------------------------------------
   10. Toast Notification Helpers
   -------------------------------------------------------------------------- */
function showToast(title, message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        hideToast();
    }, 5000);
}

function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}
