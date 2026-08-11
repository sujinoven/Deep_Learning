# MASTER PROMPT — Production-Grade MNIST Digit Recognition Flask Web App

Act as a **senior full-stack engineer, ML engineer, UI/UX designer, and production deployment engineer**.

Build a complete, polished, production-grade **MNIST handwritten digit recognition web application** using **Flask + TensorFlow/Keras + HTML/CSS/JavaScript**.

The application must use my existing trained MNIST model and must NOT retrain or replace the model unless absolutely necessary.

---

# 1. EXISTING ML MODEL — IMPORTANT

I have an existing trained Keras model called:

`digits_intel.h5`

Use this model for inference.

The model was trained on the standard Keras MNIST dataset.

The training pipeline in my notebook is:

```python
(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()
```

Images are:

```text
28 × 28 pixels
grayscale
pixel values 0–255
```

The training preprocessing was:

```python
x_train = x_train / 255.0
x_test = x_test / 255.0
```

The model architecture is:

```python
model = Sequential()

model.add(Flatten())

model.add(Dense(units=100, activation="relu"))

model.add(Dense(units=30, activation="relu"))

model.add(Dense(units=10, activation="softmax"))
```

The model was compiled with:

```python
model.compile(
    optimizer="rmsprop",
    loss="sparse_categorical_crossentropy"
)
```

The model was trained for:

```text
batch_size = 32
epochs = 10
validation_data = (x_test, y_test)
```

The trained model was saved as:

```python
model.save("digits_intel.h5")
```

The existing inference logic is conceptually:

```python
def predict_image(image):
    image = image / 255.0
    image = np.expand_dims(image, axis=0)
    prediction = digits_brain.predict(image)
    return np.argmax(prediction)
```

Therefore, preserve this preprocessing behavior.

---

# 2. PRIMARY OBJECTIVE

Build a beautiful web application where a user can:

1. Upload an image containing a handwritten digit.
2. Preview the uploaded image.
3. Click a "Predict Digit" button.
4. Send the image to Flask.
5. Flask preprocesses the image exactly as required by the existing model.
6. The trained `digits_intel.h5` model predicts the digit.
7. Display the predicted digit prominently.
8. Display prediction confidence.
9. Display a visual probability distribution for digits 0–9.
10. Allow the user to clear/reset the current prediction.
11. Allow another image to be uploaded immediately.
12. Handle invalid files gracefully.
13. Provide a polished loading state while prediction is running.
14. Work beautifully on desktop, tablet, and mobile.

Do not build a toy/demo-looking interface.

The final application should look like a **premium AI/ML SaaS product**.

---

# 3. IMPORTANT — DO NOT CHANGE THE MODEL

Do NOT:

* retrain the model
* change the neural network architecture
* replace the model with CNN
* download another model
* use a different ML framework
* fabricate prediction results
* hard-code predictions
* create a fake AI interface

The actual `digits_intel.h5` model must be loaded and used for every prediction.

If the model file is not currently available in the project, create the correct expected location:

```text
models/digits_intel.h5
```

and clearly document that the actual trained model file must be placed there.

Do not silently create a replacement model.

---

# 4. PRODUCTION-GRADE PROJECT STRUCTURE

Use a clean Flask application structure similar to:

```text
mnist-digit-recognizer/
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
│       └── js/
│           └── app.js
│
├── models/
│   └── digits_intel.h5
│
├── tests/
│   ├── __init__.py
│   ├── test_routes.py
│   ├── test_prediction_service.py
│   └── test_image_utils.py
│
├── uploads/
│   └── .gitkeep
│
├── .env.example
├── .gitignore
├── config.py
├── requirements.txt
├── run.py
├── README.md
└── wsgi.py
```

Keep responsibilities separated.

Do not put the entire application into one `app.py` file.

---

# 5. FLASK ARCHITECTURE

Use Flask with an application factory pattern.

Implement:

```python
create_app()
```

Use environment-based configuration.

Have separate responsibilities for:

### Routes

Handle:

* homepage
* prediction API
* health check

Suggested endpoints:

```text
GET  /
POST /api/predict
GET  /health
```

---

# 6. MODEL SERVICE

Create:

```text
app/services/prediction_service.py
```

The service should:

1. Load the Keras model once when the application starts.
2. Avoid loading the `.h5` model for every request.
3. Provide a clean prediction method.
4. Return:

   * predicted digit
   * confidence
   * probabilities for digits 0–9

Example conceptual response:

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

Do not expose unnecessary model internals.

---

# 7. IMAGE PREPROCESSING

Create:

```text
app/utils/image_utils.py
```

Implement robust preprocessing.

The uploaded image must:

1. Be opened with Pillow.
2. Be converted to grayscale.
3. Be resized to `28 × 28`.
4. Be converted into a NumPy array.
5. Be normalized to `[0, 1]`.
6. Have the correct batch dimension added.

Equivalent behavior:

```python
image = Image.open(file).convert("L")
image = image.resize((28, 28))
image = np.array(image)
image = image / 255.0
image = np.expand_dims(image, axis=0)
```

Do not accidentally normalize twice.

---

# 8. IMAGE ORIENTATION / MNIST COMPATIBILITY

MNIST images are generally white digits on a dark background.

The application should intelligently handle common uploaded handwritten digit images.

Implement preprocessing that is robust to:

* JPG
* JPEG
* PNG
* WEBP

At minimum, validate that the uploaded image can be converted to grayscale and resized.

If you implement automatic inversion/background handling, make it conservative and explain the behavior in the README.

Do not make aggressive transformations that could reduce prediction accuracy.

---

# 9. FILE UPLOAD SECURITY

Implement production-style upload validation.

Allowed extensions:

```text
.png
.jpg
.jpeg
.webp
```

Validate:

* file exists
* filename exists
* extension
* MIME/content where practical
* reasonable file size
* image can actually be opened by Pillow

Configure a maximum upload size.

Example:

```python
MAX_CONTENT_LENGTH = 5 * 1024 * 1024
```

Never trust the client-provided filename.

Use secure filename handling.

Do not permanently store user uploads unless necessary.

Prefer processing in memory.

---

# 10. FRONTEND — PREMIUM UI/UX

The UI must look modern, elegant, premium, and polished.

Do NOT create a basic Bootstrap-looking page.

Use a sophisticated AI SaaS visual language.

Design direction:

* dark premium background
* subtle gradients
* glassmorphism cards
* soft borders
* elegant shadows
* tasteful glow effects
* strong typography hierarchy
* generous whitespace
* smooth transitions
* minimal but expressive animations

Suggested palette:

```text
Background:
#080B14
#0D1220

Primary:
#7C3AED
#8B5CF6

Secondary:
#06B6D4

Accent:
#22D3EE

Text:
#F8FAFC
#CBD5E1

Muted:
#64748B

Success:
#22C55E

Danger:
#EF4444
```

Use CSS variables so colors are easy to customize.

Avoid excessive neon effects.

The result should feel like:

"AI laboratory + premium developer SaaS dashboard"

rather than a school project.

---

# 11. PAGE LAYOUT

Create a single polished dashboard-style page.

### Header

Include:

```text
MNIST Vision
Digit Recognition AI
```

Add a small status indicator:

```text
● Model Online
```

Do not claim the model is online unless the backend is actually healthy.

Use the `/health` endpoint to determine the state where practical.

---

# 12. HERO SECTION

Large heading:

```text
Recognize handwritten digits
with AI.
```

Supporting text:

```text
Upload a handwritten digit and let the trained neural network identify it instantly.
```

Include a subtle AI/ML visual element.

Do not use unnecessary stock images.

---

# 13. MAIN PREDICTION CARD

Create a large central card.

Layout:

```text
┌───────────────────────────────────────────────┐
│                                               │
│          Upload your digit                   │
│                                               │
│     Drag & drop or choose an image           │
│                                               │
│             [ Upload Image ]                  │
│                                               │
│      Supported: PNG, JPG, JPEG, WEBP         │
│                                               │
└───────────────────────────────────────────────┘
```

After upload, replace the empty state with an image preview.

Show:

```text
Selected image
filename
dimensions
file size
```

Keep the interface uncluttered.

---

# 14. DRAG AND DROP

Implement drag-and-drop support.

Users should be able to:

* click upload area
* drag image over upload area
* drop image

Add visual feedback when dragging.

Example state:

```text
Release to upload
```

Do not require drag-and-drop; normal file selection must always work.

---

# 15. IMAGE PREVIEW

Before prediction, show a clean preview.

Because MNIST is grayscale, visually present the uploaded image inside a premium framed container.

Use:

```text
[ image preview ]
```

with a subtle checkerboard/grid or neural-network-inspired visual treatment if appropriate.

Do not distort the image preview.

---

# 16. PREDICT BUTTON

Show a prominent primary CTA:

```text
✦ Predict Digit
```

Button states:

Normal:

```text
Predict Digit
```

Loading:

```text
Analyzing...
```

Success:

```text
Prediction Complete
```

Disable the button while prediction is running.

---

# 17. LOADING EXPERIENCE

When the prediction request is running:

* disable Predict button
* show animated spinner
* show subtle progress-style animation
* prevent duplicate requests

Use a polished microinteraction.

Do not fake a long loading process.

The animation should disappear immediately when the API responds.

---

# 18. RESULT SECTION

After successful prediction, reveal a premium result panel.

Example:

```text
Prediction

        7

Confidence
98.42%
```

The predicted digit should be extremely prominent.

Use an oversized digit:

```text
7
```

with a subtle gradient/glow treatment.

---

# 19. CONFIDENCE DISPLAY

Show confidence as:

```text
98.42% confidence
```

Also display a visual progress/ring/bar.

The confidence must come from the model's softmax output:

```python
confidence = probabilities[predicted_digit]
```

Do not fabricate confidence.

---

# 20. PROBABILITY DISTRIBUTION

Display all 10 classes:

```text
0  ███
1  ██
2  █
3  ████
4  █
5  ██
6  █
7  █████████████████
8  █
9  ██
```

Use an elegant horizontal bar chart.

Labels:

```text
0
1
2
3
4
5
6
7
8
9
```

The predicted digit should be visually emphasized.

Show percentages with two decimal places.

Example:

```text
7     98.42%
```

Do not use a chart library unless necessary. A clean CSS bar chart is preferred.

---

# 21. CLEAR / RESET FUNCTIONALITY

The user specifically needs an option to clear the previous search/prediction.

Implement:

```text
↻ Clear
```

or:

```text
Clear Prediction
```

When clicked:

* clear selected file
* clear image preview
* clear prediction
* clear confidence
* clear probability bars
* reset file input
* hide result section
* return UI to upload state

The user must be able to immediately upload another image.

Do not reload the entire page.

Use JavaScript state management for this.

---

# 22. PREDICTION HISTORY

If practical, include a lightweight client-side recent prediction history.

For example:

```text
Recent Predictions

7    98.42%
3    96.12%
5    91.34%
```

Keep it optional and lightweight.

Store only in browser memory/localStorage if implemented.

Do not create a database just for this feature.

Include a clear-history action if history is implemented.

Do not send personal information anywhere.

---

# 23. ERROR HANDLING

Create polished error states.

Possible errors:

### Invalid file

```text
Invalid image
Please upload a PNG, JPG, JPEG, or WEBP image.
```

### File too large

```text
Image too large
Please upload an image smaller than 5 MB.
```

### Prediction failure

```text
Prediction unavailable
Something went wrong while analyzing the image.
Please try again.
```

### Model unavailable

```text
AI model unavailable
The prediction service is currently unavailable.
```

Never expose Python stack traces to the browser.

Log technical errors server-side.

---

# 24. API DESIGN

Use JSON for `/api/predict`.

Successful response:

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

Error response:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Use appropriate HTTP status codes.

---

# 25. FRONTEND JAVASCRIPT

Create:

```text
app/static/js/app.js
```

Use clean modular JavaScript.

Implement functions such as:

```javascript
handleFileSelection()
handleDrop()
previewImage()
predictDigit()
displayPrediction()
displayProbabilities()
clearPrediction()
showLoading()
hideLoading()
showError()
```

Do not place large amounts of JavaScript inline in HTML.

Use `fetch()` to communicate with Flask.

---

# 26. ACCESSIBILITY

Implement good accessibility:

* semantic HTML
* labels for file input
* keyboard-accessible upload
* keyboard-accessible buttons
* visible focus states
* sufficient color contrast
* `aria-live` for prediction results
* meaningful alt text
* do not rely solely on color to communicate state

The application should be usable without a mouse.

---

# 27. RESPONSIVE DESIGN

The UI must work on:

### Desktop

Wide two-column or centered layout.

### Tablet

Comfortable stacked layout.

### Mobile

Single-column layout.

Ensure:

* no horizontal scrolling
* buttons are touch-friendly
* upload zone scales correctly
* prediction digit remains visually prominent
* probability bars remain readable

Use CSS media queries.

---

# 28. PERFORMANCE

Optimize the application.

Important:

* Load model once.
* Don't reload model for every prediction.
* Process images in memory when possible.
* Don't unnecessarily save uploaded images.
* Keep frontend assets lightweight.
* Don't introduce large dependencies without reason.

---

# 29. HEALTH CHECK

Create:

```text
GET /health
```

Return something like:

```json
{
    "status": "healthy",
    "model_loaded": true
}
```

If the model is not loaded:

```json
{
    "status": "unhealthy",
    "model_loaded": false
}
```

Use this endpoint for deployment diagnostics.

---

# 30. CONFIGURATION

Create:

```text
config.py
```

Support:

```text
SECRET_KEY
MAX_CONTENT_LENGTH
MODEL_PATH
FLASK_ENV
```

The model path should default to:

```text
models/digits_intel.h5
```

Use `pathlib.Path` rather than fragile relative string paths wherever practical.

---

# 31. REQUIREMENTS

Create a clean `requirements.txt`.

Include only dependencies actually required, such as:

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

Do not blindly add unnecessary packages.

Pin versions only when there is a clear compatibility reason.

---

# 32. LOGGING

Implement sensible server logging.

Log:

* application startup
* model loading success/failure
* prediction requests
* prediction success
* prediction errors

Do NOT log:

* raw uploaded images
* sensitive user information
* unnecessary request contents

---

# 33. TESTING

Create tests.

At minimum test:

### Health endpoint

```text
GET /health
```

### Homepage

```text
GET /
```

### Image preprocessing

Verify:

```text
28 × 28
grayscale
normalized values
batch dimension
```

### Prediction service

Verify that a valid image produces:

```text
prediction 0–9
confidence 0–1
10 probability values
```

### Invalid upload

Verify appropriate error response.

### Unsupported extension

Verify rejection.

Do not require external network access for tests.

Mock model inference where appropriate.

---

# 34. README

Create a professional README containing:

## Project Overview

Explain what the application does.

## Model

Explain that the application uses the existing:

```text
digits_intel.h5
```

model.

Document its architecture:

```text
Flatten
↓
Dense(100, ReLU)
↓
Dense(30, ReLU)
↓
Dense(10, Softmax)
```

## Preprocessing

Document:

```text
Grayscale
↓
Resize 28×28
↓
Convert to NumPy
↓
Divide by 255
↓
Add batch dimension
```

## Installation

Provide Windows-friendly instructions.

Example:

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

Then:

```text
http://127.0.0.1:5000
```

## Production

Explain how to run with Gunicorn on Linux:

```bash
gunicorn "app:create_app()"
```

If Windows development is used, clearly explain that Gunicorn is generally deployed on Linux/WSL/cloud rather than native Windows.

---

# 35. DEPLOYMENT READINESS

Make the application suitable for deployment.

Support:

```text
gunicorn
```

Create:

```text
wsgi.py
```

Example conceptual structure:

```python
from app import create_app

app = create_app()
```

Do not use Flask's development server as the recommended production server.

---

# 36. ENVIRONMENT FILE

Create:

```text
.env.example
```

Example:

```text
SECRET_KEY=change-this-in-production
MODEL_PATH=models/digits_intel.h5
MAX_CONTENT_LENGTH=5242880
```

Do not commit `.env`.

---

# 37. GITIGNORE

Create a proper `.gitignore`.

Include:

```text
venv/
.venv/
__pycache__/
*.pyc
.env
.pytest_cache/
uploads/*
.DS_Store
```

Do not ignore the model file unless there is a specific reason.

If the model is too large for normal Git hosting, explain alternatives in README rather than silently ignoring it.

---

# 38. SECURITY

Implement basic production security practices:

* secure upload handling
* file size limits
* allowed extensions
* safe image decoding
* no arbitrary file execution
* no user-controlled model paths
* no stack traces returned to users
* environment variables for secrets
* sensible HTTP error handling

Do not store uploaded images unnecessarily.

---

# 39. UI MICROINTERACTIONS

Add subtle polished interactions:

* upload card hover
* drag-over animation
* button hover
* button press
* result reveal animation
* confidence bar animation
* probability bar animation
* clear/reset transition
* loading spinner

Animations should be fast and tasteful.

Avoid distracting animation.

---

# 40. VISUAL DESIGN DETAILS

Use:

* rounded cards
* 1px subtle borders
* backdrop blur where supported
* layered shadows
* gradient typography for key headings
* subtle radial background gradients
* elegant iconography
* responsive spacing

Avoid:

* excessive emojis
* cartoon graphics
* generic Bootstrap styling
* clutter
* huge amounts of text
* excessive gradients
* overly bright neon colors

The design should look credible in a professional portfolio.

---

# 41. OPTIONAL BRANDING

Use:

```text
MNIST Vision
```

Primary tagline:

```text
Handwritten Digit Intelligence
```

Secondary tagline:

```text
Powered by a trained neural network
```

Include a small footer:

```text
MNIST Vision · Neural Digit Recognition
```

Do not claim production accuracy numbers unless they are actually measured from the model.

---

# 42. IMPORTANT MODEL ERROR PREVENTION

The application must avoid the common mistake where the `.h5` model exists but Flask cannot find it.

Resolve the model path relative to the project root.

Do NOT depend on the current working directory.

For example, conceptually:

```python
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "digits_intel.h5"
```

Make the path robust when running from:

* IDE
* terminal
* VS Code
* PyCharm
* Docker
* Gunicorn

At application startup, explicitly check whether the model exists.

If it does not exist, produce a clear startup error explaining:

```text
Expected model:
models/digits_intel.h5
```

---

# 43. MODEL LOADING COMPATIBILITY

The existing model is in legacy HDF5 format:

```text
digits_intel.h5
```

Use Keras/TensorFlow loading appropriately.

For example:

```python
from tensorflow.keras.models import load_model
```

or the compatible Keras API available in the installed environment.

Do not convert the model unless necessary.

If loading fails because of a TensorFlow/Keras version compatibility issue, provide a clear error message and document the compatible environment.

---

# 44. USER EXPERIENCE FLOW

The complete user journey should be:

```text
Open website
      ↓
See premium MNIST Vision interface
      ↓
Upload handwritten digit
      ↓
Preview image
      ↓
Click "Predict Digit"
      ↓
Loading state
      ↓
Flask receives image
      ↓
Pillow preprocessing
      ↓
28×28 grayscale
      ↓
Normalize /255
      ↓
Keras model inference
      ↓
Get softmax probabilities
      ↓
Determine argmax digit
      ↓
Return JSON
      ↓
Animated result display
      ↓
Show predicted digit
      ↓
Show confidence
      ↓
Show probability distribution
      ↓
User clicks Clear
      ↓
Return to upload state
```

---

# 45. FINAL QUALITY BAR

Before considering the project complete, verify all of the following:

[ ] Application starts successfully.

[ ] Flask application factory works.

[ ] `digits_intel.h5` loads exactly once.

[ ] Model path is robust.

[ ] Upload works.

[ ] Drag/drop works.

[ ] Image preview works.

[ ] PNG works.

[ ] JPG/JPEG works.

[ ] WEBP works where Pillow supports it.

[ ] Image is converted to grayscale.

[ ] Image is resized to 28×28.

[ ] Image is normalized using `/255.0`.

[ ] Batch dimension is added.

[ ] Model prediction uses the actual trained model.

[ ] Predicted digit is 0–9.

[ ] Confidence is derived from softmax output.

[ ] All 10 probabilities are returned.

[ ] Probability visualization works.

[ ] Clear button works without page reload.

[ ] User can immediately upload another image.

[ ] Invalid files show friendly errors.

[ ] Oversized files are rejected.

[ ] Backend errors do not expose stack traces.

[ ] Health endpoint works.

[ ] Responsive mobile layout works.

[ ] Accessibility basics are implemented.

[ ] Tests are included.

[ ] README is complete.

[ ] `.env.example` exists.

[ ] `.gitignore` exists.

[ ] Production WSGI entry point exists.

[ ] Gunicorn deployment instructions exist.

---

# 46. ANTIGRAVITY EXECUTION INSTRUCTIONS

Do not merely generate a conceptual answer.

Actually create the complete project files.

Work systematically:

1. Inspect the existing project/workspace.
2. Locate `digits_intel.h5` if available.
3. Preserve it.
4. Create the production folder structure.
5. Implement Flask backend.
6. Implement model service.
7. Implement preprocessing service.
8. Implement API routes.
9. Implement frontend.
10. Implement CSS.
11. Implement JavaScript.
12. Implement tests.
13. Implement configuration.
14. Implement README.
15. Run the application/tests where possible.
16. Fix errors.
17. Verify model loading.
18. Verify an actual image prediction.
19. Verify the Clear functionality.
20. Verify responsive behavior.

Do not stop after generating the files.

Perform a complete validation pass.

If something in the existing workspace conflicts with these requirements, inspect it first and preserve useful existing work rather than blindly overwriting it.

---

# 47. IMPORTANT FINAL INSTRUCTION

The final result should feel like a **real production-quality AI web application**, not a classroom Flask demo.

Prioritize:

**Correct ML inference**
+
**Clean architecture**
+
**Premium UI/UX**
+
**Security**
+
**Responsive design**
+
**Deployment readiness**
+
**Maintainability**

Use the existing `digits_intel.h5` model and its established MNIST preprocessing pipeline as the source of truth.
