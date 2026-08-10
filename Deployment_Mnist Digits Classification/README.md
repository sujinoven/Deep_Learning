# MNIST Vision — Production-Grade Digit Recognition AI Web Application

MNIST Vision is a production-ready handwritten digit classification web application built with **Flask**, **TensorFlow/Keras**, and a modern **AI SaaS UI (HTML5, Vanilla CSS, JS)**. It loads a trained deep neural network model (`digits_intel.h5`) to predict handwritten digits (0–9) with full confidence metrics and horizontal probability distribution breakdown.

---

## 🌟 Key Features

- **Trained Deep Learning Inference**: Loads trained Keras model (`models/digits_intel.h5`) once at application startup.
- **Dual Input Modes**:
  - **File Upload & Drag-and-Drop**: Upload PNG, JPG, JPEG, or WEBP digit images (up to 5 MB).
  - **Interactive Drawing Canvas**: Draw handwritten digits directly on screen with mouse or touch.
- **Smart Background Auto-Inversion**: Automatically detects light backgrounds (e.g. black pen on white paper) and inverts pixel values to match standard white-on-dark MNIST dataset format.
- **Interactive UI & Visual Analytics**:
  - Oversized glowing predicted digit display.
  - Confidence percentage meter.
  - Complete 10-class horizontal probability distribution chart.
  - Real-time client-side prediction history log (saved in localStorage).
  - Reset & Clear state management without full page reload.
- **Application Factory Pattern**: Clean modular Flask architecture with separated configuration, services, utilities, routes, and tests.

---

## 📂 Project Architecture

```text
mnist-digit-recognizer/
│
├── app/
│   ├── __init__.py                # Flask Application Factory (create_app)
│   │
│   ├── routes/                    # Route Controllers & API Endpoints
│   │   ├── __init__.py
│   │   └── prediction_routes.py
│   │
│   ├── services/                  # Business Logic & Model Inference
│   │   ├── __init__.py
│   │   └── prediction_service.py
│   │
│   ├── utils/                     # Utility Functions & Preprocessing
│   │   ├── __init__.py
│   │   └── image_utils.py
│   │
│   ├── templates/
│   │   └── index.html             # Main Dashboard HTML Template
│   │
│   └── static/
│       ├── css/
│       │   └── style.css          # Premium Dark AI SaaS CSS Design System
│       └── js/
│           └── app.js             # Drag-and-drop, Canvas, API fetch logic
│
├── models/
│   └── digits_intel.h5            # Saved Keras Trained Model
│
├── tests/                         # Pytest Automated Test Suite
│   ├── __init__.py
│   ├── test_routes.py
│   ├── test_prediction_service.py
│   └── test_image_utils.py
│
├── uploads/                       # Temporary Upload Storage Directory
│   └── .gitkeep
│
├── .env.example                   # Environment Variables Template
├── config.py                      # Development, Testing, Production Configs
├── requirements.txt               # Python Dependencies
├── train_model.py                 # Script to train & save digits_intel.h5
├── run.py                         # Development Server Entry Point
├── wsgi.py                        # Production WSGI Entry Point
└── README.md                      # Project Documentation
```

---

## 🧠 Model Specifications

The application uses the exact model architecture specified in the notebook:

```python
Sequential([
    Flatten(input_shape=(28, 28)),
    Dense(units=100, activation="relu"),
    Dense(units=30, activation="relu"),
    Dense(units=10, activation="softmax")
])
```

- **Optimizer**: RMSprop
- **Loss Function**: `sparse_categorical_crossentropy`
- **Training Preprocessing**: Images scaled to `[0.0, 1.0]` (`x / 255.0`).
- **Inference Preprocessing**: Image converted to grayscale (`'L'`), resized to `28x28`, auto-inverted if background is bright (mean > 127), normalized (`/ 255.0`), and expanded to batch shape `(1, 28, 28)`.

---

## 🚀 Quick Start Guide

### 1. Installation

Install required dependencies:

```bash
pip install -r requirements.txt
```

### 2. Generate/Train Model (If needed)

To train or re-generate `models/digits_intel.h5` based on standard MNIST dataset:

```bash
python train_model.py
```

### 3. Run Development Server

Start the Flask server locally:

```bash
python run.py
```

Open your browser and navigate to:
**`http://127.0.0.1:5000`**

### 4. Run Production WSGI Server

To run via WSGI entry point:

```bash
python wsgi.py
```

---

## 🧪 Automated Testing

Run unit & integration tests using `pytest`:

```bash
pytest
```

---

## 📡 API Reference

### 1. Health Check Endpoint
- **URL**: `/health`
- **Method**: `GET`
- **Response**:
```json
{
  "status": "online",
  "model_loaded": true,
  "service": "MNIST Vision AI"
}
```

### 2. Prediction Endpoint
- **URL**: `/api/predict`
- **Method**: `POST`
- **Payload (File Upload)**: `multipart/form-data` with form field `image` or `file`.
- **Payload (Canvas Drawing)**: `application/json` with body `{"image_data": "data:image/png;base64,..."}`.
- **Response**:
```json
{
  "success": true,
  "prediction": 7,
  "confidence": 98.42,
  "probabilities": {
    "0": 0.001,
    "1": 0.002,
    "2": 0.003,
    "3": 0.004,
    "4": 0.001,
    "5": 0.002,
    "6": 0.003,
    "7": 0.9842,
    "8": 0.001,
    "9": 0.0018
  }
}
```
