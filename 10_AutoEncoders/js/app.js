/**
 * App Main Entry Point
 * Coordinates DrawingCanvas, UIController, and ModelManager.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI Controller
  UIController.init();

  // Initialize Drawing Canvas
  DrawingCanvas.init('drawing-canvas', { width: 280, height: 280 });
  DrawingCanvas.setOnChange((state) => {
    UIController.handleDrawingChange(state);
  });

  // Load TensorFlow.js AI Model
  ModelManager.loadModel((status) => {
    UIController.updateModelStatus(status);
  });

  // Bind main CTA button "Run Denoiser"
  const runBtn = document.getElementById('run-denoiser-btn');
  if (runBtn) {
    runBtn.addEventListener('click', handleRunDenoiser);
  }
});

/**
 * Handle Run Denoiser action
 */
async function handleRunDenoiser() {
  const cleanArray = UIController.getCurrentCleanArray();
  const noisyArray = UIController.getCurrentNoisyArray();

  if (!cleanArray || !noisyArray) {
    const activeTab = UIController.getActiveTab();
    if (activeTab === 'upload') {
      UIController.showToast('Please upload a handwritten digit image first.', 'error');
    } else {
      UIController.showToast('Please draw a digit on the canvas before running the denoiser.', 'error');
    }
    return;
  }

  if (!ModelManager.isLoaded()) {
    UIController.showToast('The AI model is still loading. Please wait a moment.', 'error');
    return;
  }

  UIController.showLoading(true);

  try {
    // Run prediction using pre-trained Denoising Autoencoder model
    const denoisedArray = await ModelManager.predict(noisyArray);
    
    // Render outputs to UI
    UIController.renderResults(denoisedArray);
    UIController.showToast('Neural reconstruction completed!', 'info');
  } catch (err) {
    console.error('Inference error:', err);
    UIController.showToast('An error occurred during neural reconstruction. Please try again.', 'error');
  } finally {
    UIController.showLoading(false);
  }
}
