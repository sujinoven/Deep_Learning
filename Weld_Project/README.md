# AI Weld Quality Inspection — Localhost Web Application

An industrial-grade AI web application for automated **Weld Quality Inspection** powered by Ultralytics YOLO object detection. It classifies welds into **GOOD WELD** and **BAD WELD / DEFECTIVE** with bounding boxes, confidence scores, real-time statistics, inspection history, and support for both image upload and live webcam inspection modes.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (FastAPI)

From the project root directory, run:

```bash
python -m uvicorn backend.main:app --reload --port 8000
```

The backend server will run at: **`http://localhost:8000`**
- Health Check: `http://localhost:8000/api/health`
- Prediction Endpoint: `http://localhost:8000/api/predict`
- Frame Prediction Endpoint: `http://localhost:8000/api/predict_frame`

### 2. Start the Frontend Dashboard (React + Vite)

Open a new terminal window, navigate to the `frontend` folder, and start the development server:

```bash
cd frontend
npm run dev
```

The frontend application will run at: **`http://localhost:5173`**

---

## 🛠️ Project Architecture

```text
Weld_Project/
├── backend/
│   └── main.py              # FastAPI server & YOLO model inference engine
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # React Industrial Dashboard UI
│   │   ├── index.css        # Industrial dark design system & UI tokens
│   │   └── main.jsx         # React DOM root entry
│   ├── package.json
│   └── index.html
├── runs/
│   └── detect/
│       └── weld_detection_project/
│           └── weld_yolo_training/
│               └── weights/
│                   └── best.pt  # Trained Ultralytics YOLO weights
├── data.yaml                # YOLO dataset configuration
├── inference.py             # Existing CLI inference script
├── webcam.py                # Existing OpenCV webcam script
├── requirements.txt         # Python dependencies
└── README.md                # Documentation & instructions
```

---

## 📊 YOLO Model Classification

- **Class ID 1 (`Good Weld`)**: Classified as **`GOOD WELD`** (Green Bounding Box).
- **Class ID 0 (`Bad Weld`) & Class ID 2 (`Defect`)**: Classified as **`BAD WELD / DEFECTIVE`** (Red Bounding Box).

---

## ✨ Features

- 🟢 **Model Health Indicator**: Real-time connection status check (`/api/health`).
- 📁 **Image Upload Mode**: Drag-and-drop or file upload (JPG, PNG, WEBP) with annotated bounding boxes and classification breakdown.
- 📷 **Webcam Mode**: Live webcam stream detection with browser camera permission management and explicit resource cleanup on stop.
- 🎚️ **Confidence Threshold Slider**: Dynamic confidence filter (10% - 100%) updating detection results in real time.
- 📈 **Statistics Dashboard**: Total inspections counter, good weld tally, bad weld tally, and average confidence tracking.
- 📜 **Inspection Log History**: Persistent inspection history log table showing timestamps, verdict, and feature count.
