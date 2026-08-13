/**
 * User Interface & App Controller
 * Manages tabs, file uploads, noise slider interaction, previews, loading states, result cards, and toasts.
 */

const UIController = (function() {
  let activeTab = 'upload'; // 'upload' | 'draw'
  let noiseLevel = 0.30;
  
  let currentCleanArray = null; // Float32Array 28x28
  let currentNoisyArray = null; // Float32Array 28x28
  let currentDenoisedArray = null; // Float32Array 28x28
  let uploadedImageElement = null;

  // DOM Elements
  const DOM = {};

  function cacheDOM() {
    DOM.tabUpload = document.getElementById('tab-upload-btn');
    DOM.tabDraw = document.getElementById('tab-draw-btn');
    DOM.contentUpload = document.getElementById('tab-content-upload');
    DOM.contentDraw = document.getElementById('tab-content-draw');

    DOM.dropzone = document.getElementById('file-dropzone');
    DOM.fileInput = document.getElementById('file-input');
    DOM.uploadPreviewContainer = document.getElementById('upload-preview-container');
    DOM.uploadImg = document.getElementById('upload-img-preview');
    DOM.fileName = document.getElementById('file-name');
    DOM.fileSize = document.getElementById('file-size');
    DOM.removeFileBtn = document.getElementById('remove-file-btn');

    DOM.canvasPlaceholder = document.getElementById('canvas-placeholder');
    DOM.brushSlider = document.getElementById('brush-size-slider');
    DOM.brushVal = document.getElementById('brush-size-val');
    DOM.clearCanvasBtn = document.getElementById('clear-canvas-btn');
    DOM.undoBtn = document.getElementById('undo-btn');

    DOM.noiseSlider = document.getElementById('noise-slider');
    DOM.noiseVal = document.getElementById('noise-val');
    
    DOM.modelInputCanvas = document.getElementById('model-input-canvas');
    DOM.noisyPreviewCanvas = document.getElementById('noisy-preview-canvas');

    DOM.runBtn = document.getElementById('run-denoiser-btn');
    DOM.clearAllBtn = document.getElementById('clear-all-btn');

    DOM.loadingState = document.getElementById('loading-state');
    DOM.resultsSection = document.getElementById('results-section');
    DOM.resultsEmpty = document.getElementById('results-empty');

    DOM.resOriginalCanvas = document.getElementById('res-original-canvas');
    DOM.resNoisyCanvas = document.getElementById('res-noisy-canvas');
    DOM.resDenoisedCanvas = document.getElementById('res-denoised-canvas');

    DOM.resOriginalLabel = document.getElementById('res-original-label');
    DOM.mseMetric = document.getElementById('mse-metric');

    // Before/After comparison
    DOM.compOriginalCanvas = document.getElementById('comp-original-canvas');
    DOM.compDenoisedCanvas = document.getElementById('comp-denoised-canvas');
    DOM.compOverlay = document.getElementById('comp-overlay');
    DOM.compSliderHandle = document.getElementById('comp-slider-handle');

    DOM.modelStatusBadge = document.getElementById('model-status-badge');
    DOM.modelStatusText = document.getElementById('model-status-text');
  }

  function init() {
    cacheDOM();
    bindEvents();
  }

  function bindEvents() {
    // Tab switching
    DOM.tabUpload.addEventListener('click', () => switchTab('upload'));
    DOM.tabDraw.addEventListener('click', () => switchTab('draw'));

    // Upload zone events
    DOM.dropzone.addEventListener('click', () => DOM.fileInput.click());
    DOM.fileInput.addEventListener('change', handleFileSelect);

    DOM.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      DOM.dropzone.classList.add('dragover');
    });

    DOM.dropzone.addEventListener('dragleave', () => {
      DOM.dropzone.classList.remove('dragover');
    });

    DOM.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      DOM.dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processSelectedFile(e.dataTransfer.files[0]);
      }
    });

    DOM.removeFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetUpload();
    });

    // Brush slider
    DOM.brushSlider.addEventListener('input', (e) => {
      const size = parseInt(e.target.value, 10);
      DOM.brushVal.textContent = `${size}px`;
      DrawingCanvas.setBrushSize(size);
    });

    DOM.clearCanvasBtn.addEventListener('click', () => {
      DrawingCanvas.clearCanvas(true);
    });

    DOM.undoBtn.addEventListener('click', () => {
      DrawingCanvas.undo();
    });

    // Noise slider real-time update
    DOM.noiseSlider.addEventListener('input', (e) => {
      noiseLevel = parseFloat(e.target.value);
      DOM.noiseVal.textContent = noiseLevel.toFixed(2);
      updateNoisyPreview();
    });

    // Global clear button
    DOM.clearAllBtn.addEventListener('click', clearAll);

    // Interactive Comparison Slider
    initComparisonSlider();
  }

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'upload') {
      DOM.tabUpload.classList.add('active');
      DOM.tabDraw.classList.remove('active');
      DOM.contentUpload.classList.add('active');
      DOM.contentDraw.classList.remove('active');
    } else {
      DOM.tabDraw.classList.add('active');
      DOM.tabUpload.classList.remove('active');
      DOM.contentDraw.classList.add('active');
      DOM.contentUpload.classList.remove('active');
    }
    updateInputPreviews();
  }

  function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  }

  function processSelectedFile(file) {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      showToast('Unsupported format! Please upload a PNG, JPG, or JPEG image.', 'error');
      return;
    }

    // Max 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file too large! Maximum allowed size is 10MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        uploadedImageElement = img;
        DOM.uploadImg.src = e.target.result;
        DOM.fileName.textContent = file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name;
        DOM.fileSize.textContent = formatBytes(file.size);

        DOM.dropzone.style.display = 'none';
        DOM.uploadPreviewContainer.style.display = 'flex';

        updateInputPreviews();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function resetUpload() {
    DOM.fileInput.value = '';
    uploadedImageElement = null;
    DOM.uploadImg.src = '';
    DOM.dropzone.style.display = 'flex';
    DOM.uploadPreviewContainer.style.display = 'none';
    currentCleanArray = null;
    updateInputPreviews();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function handleDrawingChange(state) {
    if (DOM.canvasPlaceholder) {
      DOM.canvasPlaceholder.style.opacity = state.empty ? '1' : '0';
    }
    updateInputPreviews();
  }

  /**
   * Update original 28x28 Model Input preview canvas
   */
  function updateInputPreviews() {
    if (activeTab === 'upload') {
      if (uploadedImageElement) {
        currentCleanArray = ImageProcessor.processUploadedImage(uploadedImageElement);
      } else {
        currentCleanArray = null;
      }
    } else {
      if (!DrawingCanvas.isEmpty()) {
        const canvasEl = DrawingCanvas.getCanvasElement();
        currentCleanArray = ImageProcessor.processDrawingCanvas(canvasEl);
      } else {
        currentCleanArray = null;
      }
    }

    if (currentCleanArray) {
      ImageProcessor.renderArrayToCanvas(currentCleanArray, DOM.modelInputCanvas);
      updateNoisyPreview();
    } else {
      clearPreviewCanvas(DOM.modelInputCanvas);
      clearPreviewCanvas(DOM.noisyPreviewCanvas);
      currentNoisyArray = null;
    }
  }

  /**
   * Real-time Gaussian Noise Preview update
   */
  function updateNoisyPreview() {
    if (!currentCleanArray) return;
    currentNoisyArray = ImageProcessor.addGaussianNoise(currentCleanArray, noiseLevel);
    ImageProcessor.renderArrayToCanvas(currentNoisyArray, DOM.noisyPreviewCanvas);
  }

  function clearPreviewCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function showLoading(show) {
    if (show) {
      DOM.loadingState.classList.add('active');
      DOM.runBtn.disabled = true;
    } else {
      DOM.loadingState.classList.remove('active');
      DOM.runBtn.disabled = false;
    }
  }

  function renderResults(denoisedArray) {
    currentDenoisedArray = denoisedArray;

    DOM.resultsEmpty.style.display = 'none';
    DOM.resultsSection.style.display = 'block';

    // Label for Card 1
    DOM.resOriginalLabel.textContent = activeTab === 'draw' ? 'YOUR DRAWING' : 'ORIGINAL INPUT';

    // Render 3 result cards
    ImageProcessor.renderArrayToCanvas(currentCleanArray, DOM.resOriginalCanvas);
    ImageProcessor.renderArrayToCanvas(currentNoisyArray, DOM.resNoisyCanvas);
    ImageProcessor.renderArrayToCanvas(currentDenoisedArray, DOM.resDenoisedCanvas);

    // Calculate Reconstruction MSE
    const mse = ImageProcessor.calculateMSE(currentCleanArray, currentDenoisedArray);
    DOM.mseMetric.textContent = `Reconstruction MSE: ${mse.toFixed(5)}`;

    // Render Before/After slider
    ImageProcessor.renderArrayToCanvas(currentCleanArray, DOM.compOriginalCanvas);
    ImageProcessor.renderArrayToCanvas(currentDenoisedArray, DOM.compDenoisedCanvas);

    // Smooth scroll to results
    DOM.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initComparisonSlider() {
    let isDragging = false;

    function setSliderPos(x) {
      const container = DOM.compOverlay.parentElement;
      const rect = container.getBoundingClientRect();
      let offsetX = x - rect.left;
      offsetX = Math.max(0, Math.min(rect.width, offsetX));
      const percentage = (offsetX / rect.width) * 100;
      
      DOM.compOverlay.style.width = `${percentage}%`;
      DOM.compSliderHandle.style.left = `${percentage}%`;
    }

    DOM.compSliderHandle.addEventListener('pointerdown', (e) => {
      isDragging = true;
      DOM.compSliderHandle.setPointerCapture(e.pointerId);
    });

    DOM.compSliderHandle.addEventListener('pointermove', (e) => {
      if (isDragging) setSliderPos(e.clientX);
    });

    DOM.compSliderHandle.addEventListener('pointerup', (e) => {
      if (isDragging) {
        isDragging = false;
        try { DOM.compSliderHandle.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    });
  }

  function updateModelStatus(status) {
    if (!DOM.modelStatusBadge) return;
    DOM.modelStatusBadge.className = `model-status-badge ${status.state}`;
    DOM.modelStatusText.textContent = status.text;
    DOM.runBtn.disabled = status.state !== 'ready';
  }

  function clearAll() {
    resetUpload();
    DrawingCanvas.clearCanvas(true);
    
    noiseLevel = 0.30;
    DOM.noiseSlider.value = 0.30;
    DOM.noiseVal.textContent = '0.30';

    DOM.brushSlider.value = 15;
    DOM.brushVal.textContent = '15px';
    DrawingCanvas.setBrushSize(15);

    currentCleanArray = null;
    currentNoisyArray = null;
    currentDenoisedArray = null;

    clearPreviewCanvas(DOM.modelInputCanvas);
    clearPreviewCanvas(DOM.noisyPreviewCanvas);

    DOM.resultsSection.style.display = 'none';
    DOM.resultsEmpty.style.display = 'block';

    showToast('Application reset to initial state.', 'info');
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  return {
    init,
    updateModelStatus,
    handleDrawingChange,
    getCurrentCleanArray: () => currentCleanArray,
    getCurrentNoisyArray: () => currentNoisyArray,
    getActiveTab: () => activeTab,
    showLoading,
    renderResults,
    showToast
  };
})();
