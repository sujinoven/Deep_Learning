/**
 * TensorFlow.js Model Manager for MNIST Denoising Autoencoder
 * Model path: ./model/model.json
 */

const ModelManager = (function() {
  let model = null;
  let isReady = false;
  let isLoading = false;

  /**
   * Load the TensorFlow.js model from model.json
   */
  async function loadModel(statusCallback) {
    if (isReady && model) return model;
    if (isLoading) return null;

    isLoading = true;
    if (statusCallback) statusCallback({ state: 'loading', text: 'Loading AI model...' });

    try {
      // Check if tf is defined
      if (typeof tf === 'undefined') {
        throw new Error('TensorFlow.js library is not loaded. Please check your internet connection or script tag.');
      }

      // Determine model path relative to window location
      const modelUrl = new URL('model/model.json', window.location.href).href;
      console.log('Loading TensorFlow.js model from:', modelUrl);

      // Load Layers Model
      model = await tf.loadLayersModel(modelUrl);
      
      // Warm up model with dummy tensor to avoid initial latency
      tf.tidy(() => {
        const dummyInput = tf.zeros([1, 28, 28, 1]);
        model.predict(dummyInput);
      });

      isReady = true;
      isLoading = false;
      
      console.log('AI Model loaded successfully!');
      if (statusCallback) statusCallback({ state: 'ready', text: 'AI model ready' });
      return model;
    } catch (err) {
      console.error('Failed to load TensorFlow.js model:', err);
      isLoading = false;
      isReady = false;
      if (statusCallback) statusCallback({ 
        state: 'error', 
        text: 'Unable to load AI model. Ensure local server is running.' 
      });
      return null;
    }
  }

  /**
   * Run inference on a 28x28 normalized float32 array or tensor
   * @param {Float32Array|Array} inputData - Length 784 array or 2D/3D matrix (28x28)
   * @returns {Promise<Float32Array>} Reconstructed 28x28 pixel values [0.0 - 1.0]
   */
  async function predict(inputData) {
    if (!isReady || !model) {
      throw new Error('Model is not initialized or ready yet.');
    }

    return tf.tidy(() => {
      // Ensure input tensor is shape [1, 28, 28, 1]
      let inputTensor;
      if (inputData instanceof tf.Tensor) {
        inputTensor = inputData.reshape([1, 28, 28, 1]);
      } else if (Array.isArray(inputData) || inputData instanceof Float32Array) {
        inputTensor = tf.tensor4d(inputData, [1, 28, 28, 1], 'float32');
      } else {
        throw new Error('Invalid input format for model prediction.');
      }

      // Run prediction through Keras model
      const outputTensor = model.predict(inputTensor);
      
      // Extract data synchronously within tf.tidy
      const outputData = outputTensor.dataSync();
      return new Float32Array(outputData);
    });
  }

  return {
    loadModel,
    predict,
    isLoaded: () => isReady
  };
})();
