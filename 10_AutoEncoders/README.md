# MNIST Denoising Autoencoder Web Application

An interactive, production-quality web application for demonstrating deep learning image reconstruction using a pre-trained **MNIST Denoising Autoencoder**. Powered by **TensorFlow.js**, model inference is performed 100% locally in the browser with zero backend latency.

---

## 🌟 Overview

The application takes a handwritten digit input (either uploaded as an image or drawn directly on a high-DPI HTML5 canvas), applies controlled Gaussian noise $N(0, \sigma^2)$, and feeds the corrupted input into a convolutional denoising autoencoder. The trained neural network filters out noise artifacts and reconstructs a clean 28×28 digit.

---

## 🧠 What is a Denoising Autoencoder?

A Denoising Autoencoder is an unsupervised neural network architecture trained to recover clean input data from intentionally corrupted versions. It consists of two components:

1. **Encoder ($f_{\theta}$)**: Compresses the 28×28×1 corrupted input image down to a compact bottleneck feature map (7×7×8 = 392 latent dimensions).
2. **Decoder ($g_{\phi}$)**: Expands the latent representation back into a 28×28×1 reconstructed image using deconvolution/upsampling layers and a Sigmoid activation.

Instead of predicting digit class labels (e.g. `7`), the network outputs a pixel-level image reconstruction that suppresses random noise.

---

## 📐 Machine Learning Pipeline

```
USER INPUT (Upload or Draw Canvas)
       ↓
Grayscale Conversion & Auto Inversion (White stroke on Black background)
       ↓
Resize to 28 × 28
       ↓
Normalize pixel intensities [0.0, 1.0]
       ↓
Add Gaussian Noise: noisy = clip(clean + σ · N(0, 1), 0.0, 1.0)
       ↓
Create 4D Tensor: (1, 28, 28, 1)
       ↓
TensorFlow.js Model Inference (tf.loadLayersModel)
       ↓
Reconstructed Float32 Array [0.0, 1.0]
       ↓
Render 3 Result Cards & Before/After Comparison
```

---

## 🔬 Model Architecture & Verification

Verified directly from the trained Keras model (`denoising.h5`):

| Layer | Type | Output Shape | Parameters |
| :--- | :--- | :--- | :--- |
| `conv2d_30` | Conv2D (32 filters, 3x3, ReLU) | `(None, 28, 28, 32)` | 320 |
| `max_pooling2d_11` | MaxPooling2D (2x2) | `(None, 14, 14, 32)` | 0 |
| `conv2d_31` | Conv2D (8 filters, 3x3, ReLU) | `(None, 14, 14, 8)` | 2,312 |
| `max_pooling2d_12` | MaxPooling2D (2x2) | `(None, 7, 7, 8)` | 0 |
| **Bottleneck** | `conv2d_32` (8 filters, 3x3, ReLU) | `(None, 7, 7, 8)` | 584 |
| `up_sampling2d_10` | UpSampling2D (2x2) | `(None, 14, 14, 8)` | 0 |
| `conv2d_33` | Conv2D (8 filters, 3x3, ReLU) | `(None, 14, 14, 8)` | 584 |
| `up_sampling2d_11` | UpSampling2D (2x2) | `(None, 28, 28, 8)` | 0 |
| `conv2d_34` | Conv2D (32 filters, 3x3, ReLU) | `(None, 28, 28, 32)` | 2,336 |
| `conv2d_35` | Conv2D (1 filter, 3x3, Sigmoid) | `(None, 28, 28, 1)` | 289 |

- **Total Trainable Parameters**: 6,425 (25.1 KB)

---

## 🔄 Model Conversion (H5 to TensorFlow.js)

The original Keras model `denoising.h5` was converted into browser-compatible JSON and binary shard format using TensorFlow Keras exporters:

```bash
# Generated outputs in model/ directory
model/
├── model.json              # Model topology, layer config, and weight manifest
└── group1-shard1of1.bin    # Float32 binary weight shard (25.7 KB)
```

In JavaScript, the model is loaded asynchronously once when the application boots:
```javascript
const model = await tf.loadLayersModel('./model/model.json');
```

---

## 🚀 Running Locally

To avoid CORS restrictions when loading binary weight files over HTTP:

### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

### Option 2: Node.js Serve
```bash
npx serve .
```

---

## 🌐 Deploying to Netlify

The application is 100% static and ready for instant Netlify deployment:

### Method 1: Netlify Drag and Drop
1. Go to [app.netlify.com](https://app.netlify.com).
2. Drag and drop the root project folder directly into Netlify.

### Method 2: GitHub Repository Connection
1. Push this workspace to your GitHub repository.
2. Connect the repository in Netlify.
3. Build command: *(Leave empty)*
4. Publish directory: `.`

The included `netlify.toml` automatically handles CORS headers and HTTP caching rules for `.bin` weight shard files.

---

## 📁 Project Structure

```
.
├── index.html                  # HTML5 structure with Hero, Workspace, Results, & Model Insights
├── netlify.toml                # Netlify deployment configuration & header rules
├── package.json                # Project scripts and metadata
├── README.md                   # Technical documentation
├── denoising.h5                # Original pre-trained Keras model
├── prompt.md                   # Functional specification
├── model/
│   ├── model.json              # TF.js model topology & weight manifest
│   └── group1-shard1of1.bin    # Binary weight shard (25.7 KB)
├── css/
│   └── style.css               # Glassmorphic dark theme design system
└── js/
    ├── app.js                  # Main application orchestrator
    ├── model.js                # TensorFlow.js loader & inference wrapper
    ├── image-processing.js     # Image scaling, grayscale, Box-Muller Gaussian noise, & MSE calculation
    ├── drawing.js              # High-DPI canvas pointer drawing engine with undo history
    └── ui.js                   # UI state manager, sliders, previews, & result cards
```

---

## 🛠️ Troubleshooting

- **Model fails to load**: Make sure you are running a local web server (`http://localhost:8000`) instead of opening `index.html` via `file://` scheme due to browser CORS security rules.
- **Blurry preview**: The app uses `image-rendering: pixelated;` to preserve crisp 28×28 pixel boundaries when upscaling images for UI display.
