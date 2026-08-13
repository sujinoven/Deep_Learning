/**
 * Image Preprocessing and Noise Generator Pipeline
 * Handles image scaling, grayscale conversion, Box-Muller Gaussian Noise, and Canvas rendering.
 */

const ImageProcessor = (function() {

  /**
   * Box-Muller transform for generating standard Gaussian random numbers N(0, 1)
   */
  function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting (0,1) to (0,1)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * Convert an HTML Image element to a 28x28 Float32Array normalized to [0.0, 1.0]
   * Grayscale conversion formula: 0.299*R + 0.587*G + 0.114*B
   */
  function processUploadedImage(imgElement) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 28;
    offscreenCanvas.height = 28;
    const ctx = offscreenCanvas.getContext('2d');
    
    // Fill background with black first
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 28, 28);
    
    // Draw and scale uploaded image into 28x28 canvas
    ctx.drawImage(imgElement, 0, 0, 28, 28);
    
    const imgData = ctx.getImageData(0, 0, 28, 28);
    const data = imgData.data;
    const mnistArray = new Float32Array(28 * 28);

    // First check average brightness to see if image is dark digit on light background
    let totalLum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalLum += lum;
    }
    const avgLum = totalLum / (28 * 28);
    const shouldInvert = avgLum > 127.5; // If light background, invert to match MNIST (white digit on black background)

    for (let i = 0; i < 28 * 28; i++) {
      const pxIndex = i * 4;
      let lum = 0.299 * data[pxIndex] + 0.587 * data[pxIndex + 1] + 0.114 * data[pxIndex + 2];
      
      if (shouldInvert) {
        lum = 255.0 - lum;
      }
      
      mnistArray[i] = Math.max(0.0, Math.min(1.0, lum / 255.0));
    }

    return mnistArray;
  }

  /**
   * Convert high-res drawing canvas (e.g. 280x280) into 28x28 Float32Array [0.0, 1.0]
   */
  function processDrawingCanvas(srcCanvas) {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 28;
    offscreenCanvas.height = 28;
    const ctx = offscreenCanvas.getContext('2d');
    
    // Smooth downsampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.drawImage(srcCanvas, 0, 0, 28, 28);
    
    const imgData = ctx.getImageData(0, 0, 28, 28);
    const data = imgData.data;
    const mnistArray = new Float32Array(28 * 28);

    for (let i = 0; i < 28 * 28; i++) {
      const pxIndex = i * 4;
      // White drawing on black canvas: take RGB brightness or alpha
      const lum = 0.299 * data[pxIndex] + 0.587 * data[pxIndex + 1] + 0.114 * data[pxIndex + 2];
      mnistArray[i] = Math.max(0.0, Math.min(1.0, lum / 255.0));
    }

    return mnistArray;
  }

  /**
   * Add Gaussian Noise to a clean 28x28 float array and clip to [0.0, 1.0]
   * Formula: noisy = clip(clean + noiseFactor * N(0, 1), 0.0, 1.0)
   */
  function addGaussianNoise(cleanArray, noiseFactor) {
    const noisyArray = new Float32Array(cleanArray.length);
    for (let i = 0; i < cleanArray.length; i++) {
      const noise = gaussianRandom();
      const val = cleanArray[i] + noiseFactor * noise;
      noisyArray[i] = Math.max(0.0, Math.min(1.0, val));
    }
    return noisyArray;
  }

  /**
   * Render a 28x28 Float32Array onto an HTML canvas element
   */
  function renderArrayToCanvas(floatArray, targetCanvas, width = 28, height = 28) {
    targetCanvas.width = width;
    targetCanvas.height = height;
    const ctx = targetCanvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let i = 0; i < floatArray.length; i++) {
      const pxVal = Math.round(Math.max(0.0, Math.min(1.0, floatArray[i])) * 255);
      const pxIndex = i * 4;
      data[pxIndex] = pxVal;     // R
      data[pxIndex + 1] = pxVal; // G
      data[pxIndex + 2] = pxVal; // B
      data[pxIndex + 3] = 255;   // Alpha
    }

    ctx.putImageData(imgData, 0, 0);
  }

  /**
   * Calculate Mean Squared Error (MSE) between Clean and Denoised arrays
   */
  function calculateMSE(cleanArray, denoisedArray) {
    if (!cleanArray || !denoisedArray || cleanArray.length !== denoisedArray.length) {
      return 0;
    }
    let sumSqDiff = 0;
    for (let i = 0; i < cleanArray.length; i++) {
      const diff = cleanArray[i] - denoisedArray[i];
      sumSqDiff += diff * diff;
    }
    return sumSqDiff / cleanArray.length;
  }

  return {
    processUploadedImage,
    processDrawingCanvas,
    addGaussianNoise,
    renderArrayToCanvas,
    calculateMSE
  };
})();
