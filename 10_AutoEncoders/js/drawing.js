/**
 * High-Precision Canvas Drawing Controller
 * Handles pointer events, high-DPI scaling, smooth strokes, undo history, brush sizing, and clear canvas.
 */

const DrawingCanvas = (function() {
  let canvas = null;
  let ctx = null;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let brushSize = 15;
  let hasStrokes = false;
  
  const historyStack = [];
  const maxHistory = 20;

  let onChangeCallback = null;

  function init(canvasId, options = {}) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    // Handle high DPI display
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = (options.width || rect.width || 280) * dpr;
    canvas.height = (options.height || rect.height || 280) * dpr;
    
    ctx.scale(dpr, dpr);
    
    // Set initial black background
    clearCanvas(false);

    // Event listeners for Pointer Events (mouse, touch, stylus)
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    // Save initial blank state
    saveState();
  }

  function saveState() {
    if (!ctx || !canvas) return;
    if (historyStack.length >= maxHistory) {
      historyStack.shift();
    }
    historyStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handlePointerDown(e) {
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    
    isDrawing = true;
    const pos = getCanvasCoords(e);
    lastX = pos.x;
    lastY = pos.y;

    // Draw single dot on tap
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    hasStrokes = true;
    if (onChangeCallback) onChangeCallback({ empty: false });
  }

  function handlePointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const pos = getCanvasCoords(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;
  }

  function handlePointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if pointer capture release fails
    }
    saveState();
    if (onChangeCallback) onChangeCallback({ empty: false });
  }

  function clearCanvas(triggerCallback = true) {
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    hasStrokes = false;
    historyStack.length = 0;
    saveState();

    if (triggerCallback && onChangeCallback) {
      onChangeCallback({ empty: true });
    }
  }

  function undo() {
    if (historyStack.length <= 1) {
      clearCanvas(true);
      return;
    }
    
    historyStack.pop(); // Remove current state
    const previousState = historyStack[historyStack.length - 1];
    ctx.putImageData(previousState, 0, 0);

    // Check if canvas is completely black
    const data = previousState.data;
    let nonBlackPx = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] > 10 || data[i + 1] > 10 || data[i + 2] > 10) {
        nonBlackPx++;
        break;
      }
    }
    hasStrokes = nonBlackPx > 0;

    if (onChangeCallback) onChangeCallback({ empty: !hasStrokes });
  }

  function setBrushSize(size) {
    brushSize = Math.max(5, Math.min(30, size));
  }

  function setOnChange(callback) {
    onChangeCallback = callback;
  }

  return {
    init,
    clearCanvas,
    undo,
    setBrushSize,
    setOnChange,
    getCanvasElement: () => canvas,
    isEmpty: () => !hasStrokes
  };
})();
