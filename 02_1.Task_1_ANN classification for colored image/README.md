# CIFAR Vision — Production CIFAR-10 Image Classification Web Application

A production-grade web application built with **Python**, **Flask**, **TensorFlow/Keras**, **Pillow**, **NumPy**, **HTML5**, **CSS3**, and **Vanilla JavaScript** to perform real-time image classification using a pre-trained **Dense (ANN) Neural Network** model.

![CIFAR Vision Interface](app/static/assets/app_preview.png)

---

## 📌 Project Overview

This application serves as an interactive computer vision platform allowing users to upload arbitrary images, automatically preprocesses them according to the CIFAR-10 training standard, runs inference against the `cifar10_dense_model.h5` neural network, and visualizes prediction results with class confidence gauges and probability distribution charts across all 10 CIFAR-10 categories.

---

## 📊 Dataset Specification

The application classifies images across the standard **CIFAR-10** benchmark dataset:
- **Total Images:** 60,000 RGB color images
- **Training Set:** 50,000 images
- **Test Set:** 10,000 images
- **Resolution:** 32 × 32 pixels × 3 color channels (RGB)
- **Categories:** 10 mutually exclusive classes

### Class Mapping Index
```text
Index 0 ──► Airplane
Index 1 ──► Automobile
Index 2 ──► Bird
Index 3 ──► Cat
Index 4 ──► Deer
Index 5 ──► Dog
Index 6 ──► Frog
Index 7 ──► Horse
Index 8 ──► Ship
Index 9 ──► Truck
```

---

## 🧠 Neural Network Model Architecture

The inference engine utilizes the trained multi-layer Dense neural network saved in `models/cifar10_dense_model.h5`:

```text
Input Tensor: (1, 32, 32, 3) = 3072 features
    │
    ▼
Flatten Layer ──────────► (3072,)
    │
    ▼
Dense Layer 1 ──────────► 1024 neurons (Activation: ReLU)
    │
    ▼
Dropout Layer 1 ────────► Rate: 0.3
    │
    ▼
Dense Layer 2 ──────────► 512 neurons (Activation: ReLU)
    │
    ▼
Dropout Layer 2 ────────► Rate: 0.3
    │
    ▼
Dense Layer 3 ──────────► 256 neurons (Activation: ReLU)
    │
    ▼
Output Dense Layer ─────► 10 neurons (Activation: Softmax)
```

- **Loss Function:** `sparse_categorical_crossentropy`
- **Optimizer:** `adam`

---

## ⚙️ Image Preprocessing Pipeline

Every uploaded image undergoes the following deterministic transformation pipeline before model evaluation:

```text
Uploaded Image File (PNG, JPG, JPEG, WEBP)
    │
    ▼
Pillow Image Decode
    │
    ▼
Convert to RGB Mode (Ensure 3 Channels)
    │
    ▼
Resize to 32 × 32 Pixels (Bilinear Interpolation)
    │
    ▼
Convert to NumPy Array (dtype: float32)
    │
    ▼
Pixel Normalization (/ 255.0 → Range [0.0, 1.0])
    │
    ▼
Expand Batch Dimension ──► Final Tensor Shape: (1, 32, 32, 3)
```

> [!NOTE]
> **Model Accuracy Note:** The underlying model is a fully-connected Artificial Neural Network (ANN) trained on small 32×32 images. Best results are obtained when uploading centered images with simple backgrounds, similar to standard CIFAR-10 samples.

---

## 📁 Project Structure

```text
Task_1_ANN classification for colored image/
├── app/
│   ├── __init__.py               # Application Factory create_app()
│   ├── routes/
│   │   ├── __init__.py
│   │   └── prediction_routes.py  # Endpoints: /, /api/predict, /health
│   ├── services/
│   │   ├── __init__.py
│   │   └── prediction_service.py # Model loading & inference engine
│   ├── utils/
│   │   ├── __init__.py
│   │   └── image_utils.py        # Image validation & preprocessing
│   ├── templates/
│   │   └── index.html            # Main dark glassmorphism interface
│   └── static/
│       ├── css/
│       │   └── style.css         # Modern styling & micro-animations
│       └── js/
│           └── app.js            # Vanilla JS Drag-and-drop & API handler
├── models/
│   └── cifar10_dense_model.h5    # Pre-trained model binary
├── tests/
│   ├── __init__.py
│   ├── test_image_utils.py       # Preprocessing unit tests
│   ├── test_prediction_service.py# Service unit tests
│   └── test_routes.py            # API & UI integration tests
├── config.py                     # Configuration settings
├── run.py                        # Development server entry point
├── wsgi.py                       # WSGI server entry point
├── requirements.txt              # Required dependencies
├── .env.example                  # Environment variables template
├── .gitignore                    # Git exclusion rules
└── README.md                     # Comprehensive documentation
```

---

## 🚀 Getting Started & Installation

### Prerequisites
- Python 3.9+
- pip package manager

### 1. Environment Setup

Clone or open the repository directory in your terminal:

```bash
cd "Task_1_ANN classification for colored image"
```

Create a virtual environment:

#### Windows:
```cmd
python -m venv venv
venv\Scripts\activate
```

#### macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 💻 Running the Application

### Development Server

Run the Flask application using `run.py`:

```bash
python run.py
```

Open your browser and navigate to:
```text
http://127.0.0.1:5000
```

### Running Automated Tests

Run pytest to verify the preprocessing pipeline, model loading, and API endpoints:

```bash
pytest
```

---

## 🏭 Production Deployment

For production deployments, execute using a WSGI server like **Gunicorn**:

```bash
gunicorn wsgi:app --bind 0.0.0.0:8000 --workers 4
```

---

## 🔒 Security & Optimization Features

- **In-Memory Image Processing:** Uploaded images are processed directly in memory without being stored on disk.
- **File Validation:** Strict MIME and file extension checking (`PNG`, `JPG`, `JPEG`, `WEBP`) with a 5 MB payload limit.
- **Model Caching:** Model is loaded once at application startup into memory to prevent per-request disk read latency.
- **Sanitized Errors:** Internal exceptions are logged securely without exposing stack traces to clients.
