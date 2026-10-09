# Deep Learning — Learning and Projects

A collection of hands-on deep learning notebooks and computer vision applications documenting my learning journey.

This repository covers neural networks, image classification, transfer learning, autoencoders, and object detection using TensorFlow, Keras, PyTorch, OpenCV, and YOLO.

## Repository Guide

Folder names below match the existing repository.

| Folder                                                       | Contents                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| `01_Numpy for DL`                                            | NumPy fundamentals, array properties, and operations                |
| `02_Minst_Digits_Classification_GrayScale`                   | MNIST handwritten digit classification using a dense neural network |
| `02_1.Task_1_ANN classification for colored image`           | CIFAR-10 classification notebook and Flask application              |
| `02.2_Deployment_Mnist Digits Classification`                | MNIST Flask application, training script, saved model, and tests    |
| `03_ANN_For_Regression`                                      | ANN regression using Boston housing data                            |
| `04_External Dataset ANN Classification`                     | Binary classification using a diabetes dataset                      |
| `05_ANN_Hyperparameter Tuning`                               | ANN tuning with SciKeras, GridSearchCV, and K-fold validation       |
| `06_CNN_Image Classification`                                | Custom CNN, early stopping, and model checkpoints                   |
| `07_CNN_Transfer Learning_Script_using_Tensorflow_and Keras` | Transfer learning examples with VGG16, ResNet50, and MobileNetV2    |
| `08_CNN_Transfer_Learning_Script_using_Pytorch`              | Transfer learning using PyTorch and torchvision                     |
| `09_CNN_Architectures`                                       | LeNet-5 and AlexNet architecture examples                           |
| `10_AutoEncoders`                                            | MNIST denoising autoencoder and TensorFlow\.js browser application  |
| `11_OpenCV_CrashCourse`                                      | Image processing and webcam exercises                               |
| `12_YOLO_CrashCourse`                                        | Webcam object detection using YOLOv8                                |
| `Weld_Project`                                               | YOLO weld inspection with FastAPI and React                         |

## Featured Applications

### MNIST Digit Recognition

A Flask application that predicts handwritten digits from uploaded images or a drawing canvas.

- TensorFlow/Keras model for digits 0–9
- Image preprocessing and prediction services
- Class probability display
- Training script and pytest tests

[View project](./02.2_Deployment_Mnist%20Digits%20Classification/README.md)

### CIFAR-10 Image Classification

A Flask application that classifies uploaded images into ten CIFAR-10 categories using a dense artificial neural network.

- RGB image preprocessing to 32 × 32 pixels
- Saved Keras model
- Predicted class and probability display
- Preprocessing, service, and route tests

[View project](./02_1.Task_1_ANN%20classification%20for%20colored%20image/README.md)

### Image Denoising Autoencoder

A convolutional autoencoder experiment for reconstructing handwritten digits from noisy images.

- MNIST training notebook
- Drawing and image upload interface
- Adjustable noise controls
- Browser inference using TensorFlow\.js

[View project](./10_AutoEncoders/README.md)

### Weld Quality Inspection

A YOLO-based computer vision project for detecting good welds, bad welds, and defects.

- Image and webcam inference
- Annotated bounding boxes and confidence scores
- FastAPI backend and React/Vite frontend
- Saved model weights and training/validation artifacts

[View project](./Weld_Project/README.md)

## Technology Stack

| Area                  | Technologies                            |
| --------------------- | --------------------------------------- |
| Deep learning         | TensorFlow, Keras, PyTorch, torchvision |
| Browser inference     | TensorFlow\.js                          |
| Computer vision       | OpenCV, Pillow, Ultralytics YOLO        |
| Data processing       | NumPy, pandas                           |
| Evaluation and tuning | scikit-learn, SciKeras                  |
| Visualization         | Matplotlib                              |
| Applications          | Flask, FastAPI, React, Vite             |
| Development           | Jupyter Notebook, pytest                |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/sujinoven/Deep_Learning.git
cd Deep_Learning
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Use separate environments when projects require different dependency versions. The repository does not have a single root-level requirements file covering all examples.

### 3. Open the notebooks

Install a starting environment for the TensorFlow/Keras notebooks:

```bash
python -m pip install notebook tensorflow numpy pandas matplotlib scikit-learn pillow
jupyter notebook
```

Install additional libraries for the relevant topics:

```bash
# ANN hyperparameter tuning
python -m pip install scikeras

# PyTorch transfer learning
python -m pip install torch torchvision

# OpenCV and YOLO
python -m pip install opencv-python ultralytics
```

GPU configuration depends on your operating system, hardware, and framework installation.

Open a notebook, review its imports and dataset paths, and run its cells in order. Some practice cells may require corrections or reordering.

## Running the Applications

The commands below assume you start from the repository root.

### MNIST Flask Application

```bash
cd "02.2_Deployment_Mnist Digits Classification"
python -m pip install -r requirements.txt
python run.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

The saved model is included at `models/digits_intel.h5`. To regenerate it:

```bash
python train_model.py
```

### CIFAR-10 Flask Application

```bash
cd "02_1.Task_1_ANN classification for colored image"
python -m pip install -r requirements.txt
python run.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

Both Flask applications use port 5000 by default. Run them separately or configure a different `PORT`.

### Autoencoder Browser Application

```bash
cd "10_AutoEncoders"
python -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

Serve the application over HTTP so the browser can load its model files.

### Weld Inspection Application

Start the backend:

```bash
cd "Weld_Project"
python -m pip install -r requirements.txt
python -m pip install fastapi uvicorn python-multipart pillow
python -m uvicorn backend.main:app --reload --port 8000
```

The additional installation command supplies API dependencies missing from the project's current `requirements.txt`.

In a second terminal, navigate to `Weld_Project/frontend`:

```bash
npm install
npm run dev
```

Node.js and npm are required. Open the URL printed by Vite, normally [http://localhost:5173](http://localhost:5173).

Run the backend from `Weld_Project` because its model path is relative to that directory:

```text
runs/detect/weld_detection_project/weld_yolo_training/weights/best.pt
```

The autoencoder server and weld backend both use port 8000 in these examples; run them separately.

## Datasets and Models

- MNIST, CIFAR-10, Boston housing, and pretrained weights may download on first use.
- The diabetes notebooks include their CSV datasets.
- CNN and transfer learning notebooks contain machine-specific Windows or Google Drive paths. Update these paths and class counts for your data.
- Several projects include saved model files. Loading them may require compatible framework versions.
- Webcam examples require a camera and appropriate permissions.

## Testing

The MNIST and CIFAR-10 Flask applications include pytest tests. Run this command from the relevant application folder:

```bash
python -m pytest
```

The weld project also includes saved training and validation results. These document individual experiments and do not establish performance on new data.

## Suggested Learning Order

1. NumPy foundations
2. ANN classification and regression
3. Hyperparameter tuning
4. CNN image classification and architectures
5. Transfer learning
6. Denoising autoencoders
7. OpenCV and YOLO
8. Application examples and weld inspection

## Project Status

This repository contains learning exercises and application prototypes. A fresh end-to-end run of every notebook and application has not been verified. Some examples may need dependency updates, path changes, or code adjustments.

## Author

Maintained by [SUJINOVEN](https://github.com/sujinoven) as part of an ongoing deep learning learning journey.
