# MASTER PROMPT — Production-Grade CIFAR-10 Image Classification Flask Web App

Act as a **senior ML engineer, Python/Flask backend engineer, frontend engineer, UI/UX designer, security engineer, and deployment engineer**.

Build a complete, polished, production-grade **CIFAR-10 image classification web application** using:

* Python
* Flask
* TensorFlow/Keras
* Pillow
* NumPy
* HTML5
* CSS3
* Vanilla JavaScript

The application must use my **existing trained CIFAR-10 Dense neural network model**.

Do NOT retrain the model.

Do NOT replace it with a CNN.

Do NOT create a different model.

The objective is to allow a user to upload a CIFAR-10-style image and have the application predict which of the 10 CIFAR-10 classes it belongs to.

---

# 1. EXISTING TRAINED MODEL — SOURCE OF TRUTH

I have trained a CIFAR-10 classification model.

The trained model is saved as:

```text
cifar10_dense_model.h5
```

Use this exact model for inference.

The training notebook uses:

```python
(x_train, y_train), (x_test, y_test) = keras.datasets.cifar10.load_data()
```

The dataset images have dimensions:

```text
32 × 32 × 3
```

They are RGB color images.

The CIFAR-10 classes are exactly:

```python
class_names = [
    "airplane",
    "automobile",
    "bird",
    "cat",
    "deer",
    "dog",
    "frog",
    "horse",
    "ship",
    "truck"
]
```

The class index mapping MUST remain:

```text
0 → airplane
1 → automobile
2 → bird
3 → cat
4 → deer
5 → dog
6 → frog
7 → horse
8 → ship
9 → truck
```

Do not change this mapping.

---

# 2. EXISTING PREPROCESSING

The original model was trained after normalization:

```python
x_train = x_train.astype("float32") / 255.0
x_test = x_test.astype("float32") / 255.0
```

Therefore, uploaded images must follow the same fundamental preprocessing pipeline.

For an uploaded image:

1. Open using Pillow.
2. Convert to RGB.
3. Resize to exactly `32 × 32`.
4. Convert to NumPy array.
5. Convert to `float32`.
6. Divide by `255.0`.
7. Add batch dimension.

Conceptually:

```python
image = Image.open(file).convert("RGB")
image = image.resize((32, 32))
image = np.array(image).astype("float32") / 255.0
image = np.expand_dims(image, axis=0)
```

The resulting tensor should have shape:

```text
(1, 32, 32, 3)
```

Do NOT flatten the image manually in preprocessing because the model already contains the `Flatten` layer.

Do NOT normalize twice.

---

# 3. EXISTING MODEL ARCHITECTURE

The model in my notebook is:

```python
model = Sequential()

model.add(Flatten(input_shape=(32,32,3)))

model.add(Dense(1024, activation="relu"))
model.add(Dropout(0.3))

model.add(Dense(512, activation="relu"))
model.add(Dropout(0.3))

model.add(Dense(256, activation="relu"))

model.add(Dense(10, activation="softmax"))
```

It was compiled using:

```python
model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)
```

It was trained using:

```python
history = model.fit(
    x_train,
    y_train,
    epochs=20,
    batch_size=64,
    validation_data=(x_test, y_test)
)
```

The model was saved using:

```python
model.save("cifar10_dense_model.h5")
```

Do not modify this architecture.

---

# 4. PRIMARY OBJECTIVE

Build a premium web application where users can:

1. Upload an image.
2. Preview the image.
3. Click "Classify Image".
4. Send the image to Flask.
5. Flask preprocesses it correctly.
6. Flask uses the existing `cifar10_dense_model.h5`.
7. Return the predicted CIFAR-10 class.
8. Display the predicted class prominently.
9. Display confidence.
10. Display probabilities for all 10 classes.
11. Show the uploaded image alongside the result.
12. Allow the user to clear the current prediction.
13. Allow another image to be uploaded immediately.
14. Handle invalid files gracefully.
15. Provide loading feedback.
16. Work responsively on desktop, tablet, and mobile.

The application should feel like a **premium AI image classification product**, not a basic student Flask project.

---

# 5. IMPORTANT — DO NOT RETRAIN THE MODEL

Do NOT:

* retrain the model
* replace the model with CNN
* change the model architecture
* download another model
* use transfer learning
* use PyTorch
* use a pretrained ImageNet model
* fabricate predictions
* hard-code predictions
* create fake confidence values

Every prediction must come from:

```text
cifar10_dense_model.h5
```

If the model file is available in the workspace, preserve it.

If it is not available, create the expected directory:

```text
models/
```

and clearly require the actual file to be placed at:

```text
models/cifar10_dense_model.h5
```

Do not generate a replacement model.

---

# 6. PRODUCTION-GRADE FOLDER STRUCTURE

Use an application-factory architecture.

Create:

```text
cifar10-image-classifier/
│
├── app/
│   ├── __init__.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   └── prediction_routes.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   └── prediction_service.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   └── image_utils.py
│   │
│   ├── templates/
│   │   └── index.html
│   │
│   └── static/
│       ├── css/
│       │   └── style.css
│       │
│       ├── js/
│       │   └── app.js
│       │
│       └── assets/
│
├── models/
│   └── cifar10_dense_model.h5
│
├── tests/
│   ├── __init__.py
│   ├── test_routes.py
│   ├── test_prediction_service.py
│   └── test_image_utils.py
│
├── config.py
├── run.py
├── wsgi.py
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

Do not put the entire application into one `app.py`.

Keep backend responsibilities separated.

---

# 7. FLASK APPLICATION FACTORY

Implement:

```python
create_app()
```

inside:

```text
app/__init__.py
```

The application must be configurable using environment variables.

Use a clean initialization process.

The application should load the ML model through the prediction service.

---

# 8. ROUTES

Create:

```text
app/routes/prediction_routes.py
```

Implement:

```text
GET /
POST /api/predict
GET /health
```

### `/`

Render the main UI.

### `/api/predict`

Accept an uploaded image and return JSON.

### `/health`

Return application/model health information.

---

# 9. PREDICTION SERVICE

Create:

```text
app/services/prediction_service.py
```

The prediction service must:

1. Load the model once.
2. Store it in memory.
3. Avoid loading the `.h5` file for every request.
4. Perform prediction.
5. Convert the softmax output into probabilities.
6. Find the highest probability class.
7. Convert class index into human-readable class name.
8. Return prediction information.

Use:

```python
from tensorflow.keras.models import load_model
```

or the compatible Keras API.

The service should expose something conceptually like:

```python
predict(image)
```

Return:

```json
{
    "success": true,
    "class_id": 3,
    "class_name": "cat",
    "confidence": 87.42,
    "probabilities": {
        "airplane": 0.01,
        "automobile": 0.02,
        "bird": 0.03,
        "cat": 0.8742,
        "deer": 0.01,
        "dog": 0.02,
        "frog": 0.01,
        "horse": 0.01,
        "ship": 0.01,
        "truck": 0.008
    }
}
```

The values above are illustrative only.

Never hard-code them.

---

# 10. CONFIDENCE

Confidence must come directly from the softmax output.

Conceptually:

```python
prediction = model.predict(image)
predicted_class = np.argmax(prediction[0])
confidence = prediction[0][predicted_class]
```

Convert confidence to a percentage for the frontend.

Example:

```text
87.42%
```

Do not fabricate confidence.

---

# 11. PROBABILITY DISTRIBUTION

Return probabilities for all 10 classes.

The frontend must display:

```text
Airplane
Automobile
Bird
Cat
Deer
Dog
Frog
Horse
Ship
Truck
```

with percentage values.

Sort them for display if useful, but preserve the original class identity.

The predicted class should be visually highlighted.

---

# 12. IMAGE PREPROCESSING SERVICE

Create:

```text
app/utils/image_utils.py
```

Implement a function responsible for uploaded-image preprocessing.

Requirements:

```text
Input
↓
Pillow
↓
RGB conversion
↓
32×32 resize
↓
NumPy
↓
float32
↓
/255.0
↓
batch dimension
↓
(1,32,32,3)
```

Do not perform unnecessary image transformations.

The application should preserve the original image's visual content as much as possible before resizing.

---

# 13. IMPORTANT — CIFAR-10 IMAGE EXPECTATION

CIFAR-10 consists of small `32×32` RGB images.

The application should clearly communicate this to users.

Add a small informational note:

```text
Best results come from clear images similar to CIFAR-10's small RGB image format.
```

Do not promise that arbitrary real-world photographs will classify accurately.

This is particularly important because the model is a Dense-only CIFAR-10 model rather than a CNN.

---

# 14. PREMIUM UI/UX

Create a visually impressive interface.

The design should feel like:

```text
Premium AI SaaS
+
Computer Vision Laboratory
+
Modern Developer Product
```

Do NOT make it look like:

* basic Bootstrap
* generic admin dashboard
* school assignment
* plain HTML form

Use a dark premium interface with:

* glassmorphism
* subtle gradients
* elegant cards
* soft shadows
* subtle glow
* strong typography
* smooth transitions
* restrained animation
* excellent spacing

---

# 15. COLOR SYSTEM

Use CSS variables.

Suggested palette:

```css
--bg-primary: #070A12;
--bg-secondary: #0D1220;

--surface: rgba(255,255,255,0.06);
--surface-hover: rgba(255,255,255,0.09);

--border: rgba(255,255,255,0.10);

--primary: #7C3AED;
--primary-light: #8B5CF6;

--cyan: #06B6D4;
--cyan-light: #22D3EE;

--text-primary: #F8FAFC;
--text-secondary: #CBD5E1;
--text-muted: #64748B;

--success: #22C55E;
--error: #EF4444;
```

Use gradients sparingly.

Do not make the entire UI neon.

---

# 16. HEADER

Create a premium navigation/header.

Brand:

```text
CIFAR Vision
```

Subtitle:

```text
Image Classification AI
```

Add a status indicator:

```text
● Model Ready
```

The status should be based on actual backend health where possible.

Do not falsely claim the model is ready if loading failed.

---

# 17. HERO SECTION

Use a strong headline:

```text
See what the model sees.
```

Supporting text:

```text
Upload an image and let our trained neural network classify it across the 10 CIFAR-10 categories.
```

Add subtle visual elements suggesting computer vision/AI.

Avoid unnecessary stock imagery.

---

# 18. MAIN APP CARD

Create a large central classification workspace.

Initial state:

```text
┌─────────────────────────────────────────────┐
│                                             │
│              Upload an image                │
│                                             │
│       Drag & drop your image here           │
│              or                              │
│           [ Choose Image ]                  │
│                                             │
│     PNG · JPG · JPEG · WEBP                 │
│                                             │
└─────────────────────────────────────────────┘
```

Make the upload area visually sophisticated.

---

# 19. DRAG AND DROP

Support:

* click to select
* drag image
* drop image

When dragging:

```text
Drop image to classify
```

Show visual feedback.

Do not break normal file selection.

---

# 20. IMAGE PREVIEW

After selecting an image:

Show a preview card containing:

```text
Image Preview
```

Display:

* uploaded image
* filename
* file size
* dimensions

Do not distort the preview.

Use an object-fit strategy appropriate for the image.

---

# 21. ACTION BUTTONS

Primary button:

```text
✦ Classify Image
```

Secondary button:

```text
↻ Clear
```

The primary button should have strong visual emphasis.

The clear button should remain visible after an image has been selected.

---

# 22. LOADING STATE

When classification starts:

Disable the classification button.

Show:

```text
Analyzing image...
```

with a tasteful animated spinner.

Do not create an artificial delay.

Return to the normal state as soon as the backend responds.

---

# 23. RESULT DESIGN

After prediction, display a premium result card.

Example:

```text
Prediction

CAT

87.42% confidence
```

The class name should be very prominent.

Also display the class ID subtly:

```text
Class 3
```

Do not make the class ID more prominent than the human-readable prediction.

---

# 24. CLASS ICONS / VISUAL IDENTITY

Give each CIFAR-10 category a subtle visual identity.

Possible concepts:

```text
airplane → aircraft icon
automobile → car icon
bird → bird icon
cat → cat icon
deer → deer icon
dog → dog icon
frog → frog icon
horse → horse icon
ship → ship icon
truck → truck icon
```

Use a consistent icon library only if it does not create unnecessary dependencies.

Keep the visual treatment elegant.

---

# 25. CONFIDENCE VISUALIZATION

Display:

```text
Confidence
87.42%
```

Use a circular progress indicator or horizontal progress bar.

Animate it when the result appears.

The value must come from the model.

---

# 26. ALL CLASS PROBABILITIES

Create a section:

```text
Model Confidence
```

Show all 10 classes.

Example structure:

```text
Cat          ████████████████████  87.42%
Dog          ███                    5.21%
Bird         ██                     3.41%
Frog         █                      1.82%
...
```

Use CSS bars rather than adding a large chart library unless necessary.

Highlight the predicted class.

---

# 27. CLEAR FUNCTIONALITY

The user specifically requires the ability to clear the previous search/prediction.

Implement:

```text
Clear
```

When clicked:

* clear image preview
* clear selected file
* reset `<input type="file">`
* hide prediction
* hide confidence
* hide probability distribution
* clear error messages
* reset loading state
* return to upload screen

Do NOT reload the entire browser page.

The user should immediately be able to select another image.

---

# 28. OPTIONAL RECENT PREDICTIONS

Optionally implement a small client-side history:

```text
Recent Classifications

Cat       87.42%
Dog       76.31%
Ship      69.20%
```

If implemented:

* use browser localStorage
* do not create a database
* do not store uploaded images
* allow clearing history

Keep this feature visually secondary.

---

# 29. FILE VALIDATION

Accept:

```text
PNG
JPG
JPEG
WEBP
```

Reject:

* PDF
* SVG
* executable files
* arbitrary file types

Validate both extension and actual image readability.

Use a maximum upload size such as:

```text
5 MB
```

Do not trust the client-provided MIME type alone.

---

# 30. SECURITY

Implement:

* file size limits
* safe image decoding
* secure filename handling
* extension validation
* MIME/content validation where practical
* no arbitrary file execution
* no user-controlled model path
* no stack traces returned to frontend
* environment variables for secrets
* appropriate HTTP error codes

Prefer processing uploaded images in memory.

Do not permanently store user uploads unless absolutely necessary.

---

# 31. API RESPONSE

Successful:

```json
{
    "success": true,
    "class_id": 3,
    "class_name": "cat",
    "confidence": 87.42,
    "probabilities": {
        "airplane": 1.2,
        "automobile": 2.3,
        "bird": 3.1,
        "cat": 87.42,
        "deer": 0.8,
        "dog": 2.1,
        "frog": 0.9,
        "horse": 0.7,
        "ship": 0.6,
        "truck": 1.0
    }
}
```

The exact values must come from the model.

Failure:

```json
{
    "success": false,
    "error": "Unable to classify this image."
}
```

Never expose Python stack traces.

---

# 32. JAVASCRIPT

Create:

```text
app/static/js/app.js
```

Keep frontend logic modular.

Implement functions similar to:

```javascript
handleFileSelection()
handleDrop()
previewImage()
classifyImage()
displayResult()
displayProbabilities()
clearPrediction()
showLoading()
hideLoading()
showError()
```

Use `fetch()` to call:

```text
POST /api/predict
```

Use `FormData` for the uploaded image.

Do not place the main application logic inside HTML.

---

# 33. ACCESSIBILITY

Implement:

* semantic HTML
* accessible file input
* keyboard navigation
* visible focus states
* accessible buttons
* meaningful alt text
* sufficient color contrast
* `aria-live` for prediction results
* screen-reader-friendly status messages

Do not rely only on color to communicate success/error.

---

# 34. RESPONSIVE DESIGN

The application must work on:

### Desktop

Premium centered dashboard.

### Tablet

Adapt card widths and spacing.

### Mobile

Single-column layout.

Ensure:

* no horizontal scrolling
* large touch targets
* readable text
* responsive image preview
* probability bars remain readable
* buttons remain usable
* prediction remains visually prominent

---

# 35. HEALTH ENDPOINT

Create:

```text
GET /health
```

Return:

```json
{
    "status": "healthy",
    "model_loaded": true
}
```

If the model failed:

```json
{
    "status": "unhealthy",
    "model_loaded": false
}
```

The frontend can use this to determine whether the model is ready.

---

# 36. MODEL PATH

Do NOT depend on the current working directory.

Use a robust project-relative path.

Conceptually:

```python
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "cifar10_dense_model.h5"
```

Adjust the exact path based on the project structure.

At startup, check:

```text
Does models/cifar10_dense_model.h5 exist?
```

If not, produce a clear backend error:

```text
CIFAR-10 model not found.

Expected:
models/cifar10_dense_model.h5
```

This is important because the application must not fail with an obscure `FileNotFoundError`.

---

# 37. MODEL LOADING

Load the model once during application startup.

Do NOT do this inside every request:

```python
model = load_model(...)
```

Instead, load it once and reuse it.

The application should be efficient enough for normal Flask deployment.

---

# 38. CONFIGURATION

Create:

```text
config.py
```

Support configuration such as:

```text
SECRET_KEY
MODEL_PATH
MAX_CONTENT_LENGTH
FLASK_ENV
```

Create:

```text
.env.example
```

Example:

```text
SECRET_KEY=change-this-in-production
MODEL_PATH=models/cifar10_dense_model.h5
MAX_CONTENT_LENGTH=5242880
```

Do not commit `.env`.

---

# 39. REQUIREMENTS

Create a clean:

```text
requirements.txt
```

Include only required dependencies.

Likely dependencies:

```text
Flask
tensorflow
keras
numpy
Pillow
gunicorn
python-dotenv
pytest
```

Avoid unnecessary dependencies.

---

# 40. LOGGING

Implement useful backend logging.

Log:

* application startup
* model loading success
* model loading failure
* prediction requests
* prediction success
* prediction errors

Do NOT log:

* raw uploaded images
* unnecessary request data
* sensitive user information

---

# 41. TESTING

Create tests for:

### Homepage

```text
GET /
```

Expected:

```text
HTTP 200
```

### Health

```text
GET /health
```

Expected model status.

### Image preprocessing

Verify:

```text
RGB
32×32
float32
normalized
batch shape = (1,32,32,3)
```

### Prediction

Verify:

```text
class_id between 0 and 9
class_name is valid
confidence is between 0 and 100
10 probabilities returned
```

### Invalid image

Return appropriate error.

### Unsupported extension

Reject it.

Mock the model where appropriate so unit tests don't need to run full inference every time.

---

# 42. README

Create a professional README.

Include:

## Project Overview

Explain that this is a CIFAR-10 image classifier using a trained Dense neural network.

## Dataset

Explain:

```text
60,000 images
50,000 training
10,000 testing
32×32 RGB
10 classes
```

## Classes

Document:

```text
0 airplane
1 automobile
2 bird
3 cat
4 deer
5 dog
6 frog
7 horse
8 ship
9 truck
```

## Model Architecture

Document:

```text
Input: 32×32×3

Flatten
↓
Dense 1024 ReLU
↓
Dropout 0.3
↓
Dense 512 ReLU
↓
Dropout 0.3
↓
Dense 256 ReLU
↓
Dense 10 Softmax
```

## Preprocessing

Document:

```text
RGB
↓
32×32
↓
float32
↓
divide by 255
↓
batch dimension
```

## Installation

Provide Windows-friendly setup:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install:

```bash
pip install -r requirements.txt
```

Run:

```bash
python run.py
```

Open:

```text
http://127.0.0.1:5000
```

---

# 43. PRODUCTION DEPLOYMENT

Create:

```text
wsgi.py
```

Conceptually:

```python
from app import create_app

app = create_app()
```

Document Gunicorn:

```bash
gunicorn wsgi:app
```

Do not recommend Flask's development server as the production server.

Explain that deployment should use an appropriate production WSGI server.

---

# 44. GITIGNORE

Create:

```text
.gitignore
```

Include:

```text
venv/
.venv/
__pycache__/
*.pyc
.env
.pytest_cache/
uploads/
.DS_Store
```

Do not accidentally ignore:

```text
models/cifar10_dense_model.h5
```

unless the project specifically uses external model storage.

---

# 45. ERROR HANDLING UX

Create polished error messages.

### Invalid image

```text
Invalid image

Please upload a valid PNG, JPG, JPEG, or WEBP image.
```

### File too large

```text
Image too large

Please upload an image smaller than 5 MB.
```

### Model unavailable

```text
Model unavailable

The classification model could not be loaded.
```

### Prediction failure

```text
Classification failed

We couldn't analyze this image. Please try another image.
```

Keep technical details in server logs, not in the UI.

---

# 46. UI ANIMATIONS

Use tasteful microinteractions:

* upload area hover
* drag-over state
* button hover
* button press
* image preview reveal
* result card reveal
* confidence animation
* probability bar animation
* clear/reset transition
* loading spinner

Keep animations fast and professional.

Do not over-animate the interface.

---

# 47. FINAL PAGE STRUCTURE

The final page should roughly follow:

```text
┌──────────────────────────────────────────────────────┐
│ CIFAR Vision                         ● Model Ready   │
├──────────────────────────────────────────────────────┤
│                                                      │
│              See what the model sees.                │
│        Upload an image and classify it with AI.      │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────┐   ┌─────────────────────┐ │
│  │                      │   │                     │ │
│  │    IMAGE UPLOAD      │   │     PREDICTION      │ │
│  │                      │   │                     │ │
│  │   Drag & Drop        │   │       CAT           │ │
│  │                      │   │                     │ │
│  │  [Choose Image]      │   │     87.42%          │ │
│  │                      │   │                     │ │
│  └──────────────────────┘   └─────────────────────┘ │
│                                                      │
│             [ ✦ Classify Image ]  [ ↻ Clear ]       │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│                 MODEL CONFIDENCE                     │
│                                                      │
│ Cat        ████████████████████  87.42%              │
│ Dog        ███                    5.21%              │
│ Bird       ██                     3.41%              │
│ ...                                                  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

Adapt the exact layout to produce the best UX.

---

# 48. IMPORTANT — MODEL ACCURACY DISCLOSURE

Do not display claims such as:

```text
99% accurate
State-of-the-art
Production-grade accuracy
```

unless those claims are actually supported by measured evaluation results.

The model is a Dense CIFAR-10 classifier trained from the notebook.

Make the UI confident and polished without making unsupported ML performance claims.

---

# 49. IMPORTANT — EXTERNAL IMAGES

Do not rely on external image URLs for the core UI.

The application should function without an internet connection after dependencies are installed.

Do not use external stock photos as part of the interface.

---

# 50. FINAL VALIDATION

Before declaring the application complete, actually verify:

[ ] Flask application starts.

[ ] Application factory works.

[ ] Model file is found.

[ ] Model loads successfully.

[ ] Model is loaded only once.

[ ] `/health` works.

[ ] Homepage works.

[ ] Image upload works.

[ ] Drag-and-drop works.

[ ] PNG works.

[ ] JPG works.

[ ] JPEG works.

[ ] WEBP works where supported.

[ ] Image converts to RGB.

[ ] Image resizes to 32×32.

[ ] Image is normalized by 255.

[ ] Correct batch dimension is created.

[ ] Actual trained model performs inference.

[ ] Class index maps correctly to CIFAR-10 names.

[ ] Confidence comes from softmax output.

[ ] All 10 class probabilities are displayed.

[ ] Prediction result is visually prominent.

[ ] Clear button resets the application without page reload.

[ ] User can immediately upload another image.

[ ] Invalid files are handled.

[ ] Oversized files are handled.

[ ] Backend errors are handled safely.

[ ] No stack traces are exposed to users.

[ ] Responsive design works.

[ ] Accessibility basics work.

[ ] Tests are included.

[ ] README is complete.

[ ] `.env.example` exists.

[ ] `.gitignore` exists.

[ ] `wsgi.py` exists.

[ ] Production deployment instructions exist.

---

# 51. ANTIGRAVITY EXECUTION MODE

Do not merely explain how to build this application.

Actually create and implement the complete project in the workspace.

Follow this sequence:

1. Inspect the workspace.
2. Locate `cifar10_dense_model.h5`.
3. Preserve the existing model.
4. Create the production-grade folder structure.
5. Implement Flask application factory.
6. Implement configuration.
7. Implement model service.
8. Implement image preprocessing.
9. Implement prediction API.
10. Implement health endpoint.
11. Implement HTML.
12. Implement premium CSS.
13. Implement JavaScript.
14. Implement upload/drag-and-drop.
15. Implement prediction results.
16. Implement probability visualization.
17. Implement Clear functionality.
18. Implement error handling.
19. Implement tests.
20. Implement README.
21. Implement WSGI deployment support.
22. Run the tests.
23. Start the application.
24. Test an actual image prediction.
25. Fix any errors discovered.
26. Perform a final UI/UX and production-readiness review.

Do not stop after generating files.

Validate the application end-to-end.

---

# FINAL QUALITY BAR

The final application must combine:

**Existing trained CIFAR-10 model**
+
**Correct preprocessing**
+
**Correct class mapping**
+
**Real model inference**
+
**Premium UI/UX**
+
**Clean Flask architecture**
+
**Security**
+
**Responsive design**
+
**Testing**
+
**Production deployment readiness**

The result should look and behave like a professional **AI Computer Vision SaaS application**, while remaining faithful to my existing CIFAR-10 Dense model.
