You are a senior Machine Learning Engineer, TensorFlow/Keras Engineer, TensorFlow.js Engineer, Frontend Engineer, UI/UX Designer, and production deployment specialist.

I want you to build a complete, polished, production-quality web application for my MNIST Denoising Autoencoder project.

I have attached my trained Keras model:

denoising.h5

The final website will be hosted on Netlify.

IMPORTANT:
This is an MNIST DENOISING AUTOENCODER application.

It is NOT a digit classification application.

The purpose of the application is:

Original handwritten digit
        ↓
Add Gaussian noise
        ↓
Noisy digit
        ↓
Denoising Autoencoder
        ↓
Reconstructed / Denoised digit

The user must have TWO ways to provide an image:

1. Upload an image
2. Draw a digit directly on a canvas

Both input methods must eventually go through the same preprocessing and inference pipeline.


============================================================
1. FIRST: INSPECT THE ATTACHED MODEL
============================================================

Before implementing the application, inspect the attached:

denoising.h5

Determine the actual:

- Model architecture
- Input shape
- Output shape
- Input data type
- Output data type
- Number of channels
- Layer types
- Activation functions
- Expected image dimensions
- Whether the model is compatible with TensorFlow.js conversion

DO NOT simply assume the architecture.

Use the actual model.

The application must preserve the existing trained model.

DO NOT:

- Retrain the model
- Replace the model
- Modify the model weights
- Invent a different architecture
- Add a classification model
- Claim the model predicts digit classes

If the model cannot be directly converted to TensorFlow.js, clearly identify the issue and provide the correct conversion approach.


============================================================
2. DEPLOYMENT ARCHITECTURE
============================================================

The final website will be hosted on NETLIFY.

Do NOT build the production version around a traditional persistent Flask server.

The preferred architecture is:

Keras H5 model
       ↓
TensorFlow.js conversion
       ↓
model.json + binary weight files
       ↓
Static frontend
       ↓
TensorFlow.js browser inference
       ↓
Netlify


The application should perform inference directly in the browser using TensorFlow.js if the model is compatible.

If conversion requires preprocessing or a conversion command, document it clearly.

Do not pretend that the H5 model itself can simply be loaded by a browser.


============================================================
3. MODEL CONVERSION
============================================================

If compatible, convert:

denoising.h5

to TensorFlow.js format.

Use TensorFlow.js converter tooling.

Expected output:

model/
    model.json
    group1-shard*.bin

Example conversion:

tensorflowjs_converter \
    --input_format=keras \
    denoising.h5 \
    model/

Do not claim successful conversion unless the generated model is actually verified.

After conversion:

Load the model using:

tf.loadLayersModel('./model/model.json')

Load the model ONCE when the application starts.

Do not reload the model for every prediction.


============================================================
4. CORE MACHINE LEARNING PIPELINE
============================================================

The application must follow this conceptual pipeline:

USER INPUT
    ↓
Convert to grayscale
    ↓
Resize to 28 × 28
    ↓
Normalize to 0–1
    ↓
Add Gaussian noise
    ↓
Clip to 0–1
    ↓
Create tensor
    ↓
Model inference
    ↓
Reconstructed image
    ↓
Display result


The expected MNIST-style input should be:

28 × 28 × 1

with batch dimension:

1 × 28 × 28 × 1


============================================================
5. INPUT METHOD #1 — UPLOAD IMAGE
============================================================

Create a premium upload interface.

Title:

"Upload a handwritten digit"

Subtitle:

"Drop an image here or browse your device."

Supported formats:

PNG
JPG
JPEG

The upload area should support:

- Click to upload
- Drag and drop
- Image preview
- Filename
- File size
- Remove image button
- Validation
- Error messages


When the user selects an image:

1. Load image.
2. Convert to grayscale.
3. Resize appropriately.
4. Normalize pixel values.
5. Prepare a 28 × 28 × 1 tensor.
6. Display a preview.
7. Generate noisy preview based on the selected noise level.


============================================================
6. INPUT METHOD #2 — DRAW DIGIT
============================================================

Create a second input mode:

"Draw Digit"

The user should be able to draw a handwritten digit directly in the browser.

Create a premium HTML5 Canvas.

Canvas:

- Square
- Responsive
- Dark background
- White/light brush
- Smooth strokes
- Rounded brush
- Touch support
- Mouse support
- Stylus support
- Pointer events
- No accidental scrolling while drawing


Canvas visual size:

Approximately:

280 × 280 px

or another responsive square size.

The underlying model representation must eventually become:

28 × 28 × 1


============================================================
7. INPUT MODE SWITCHER
============================================================

At the top of the main workspace, create a premium segmented control:

┌────────────────────────┬────────────────────────┐
│  📤 Upload Image       │  ✏️ Draw Digit         │
└────────────────────────┴────────────────────────┘

Default:

Upload Image

Clicking:

Draw Digit

should switch to the drawing interface.

Clicking:

Upload Image

should switch back to upload mode.

Make the selected mode visually obvious.


============================================================
8. DRAWING EXPERIENCE
============================================================

Drawing section:

Title:

"Draw your digit"

Subtitle:

"Use your mouse, trackpad, stylus, or finger."

Canvas.

Below canvas:

Brush Size

slider:

5px → 30px

Default:

15px

Buttons:

Clear Canvas
Undo

The canvas should feel premium.

Use:

- Smooth stroke interpolation
- Rounded line caps
- Rounded line joins
- Anti-aliasing
- Pointer events
- Pointer capture

Do not create jagged or disconnected strokes.


============================================================
9. DRAWING PREPROCESSING
============================================================

Create:

js/image-processing.js

The drawing pipeline must be:

Canvas
    ↓
Extract drawing
    ↓
Crop useful content if appropriate
    ↓
Resize to 28 × 28
    ↓
Convert grayscale
    ↓
Normalize to 0–1
    ↓
Optional orientation/inversion based on actual MNIST preprocessing
    ↓
Tensor shape:
1 × 28 × 28 × 1


IMPORTANT:

Inspect the actual model/training preprocessing before deciding whether the image needs inversion.

Do not blindly invert all images.

The preprocessing must match the training data as closely as possible.


============================================================
10. MNIST MODEL INPUT PREVIEW
============================================================

After the user draws a digit, show:

"Your Drawing"

and:

"Model Input"

The Model Input should display the actual processed 28 × 28 representation that will be sent to the neural network.

This helps users understand how their large canvas drawing becomes an MNIST-style image.


============================================================
11. GAUSSIAN NOISE
============================================================

The application must include a noise control.

Title:

"Noise Intensity"

Slider:

0.00 ─────────────── 0.60

Default:

0.30

Display:

"Gaussian noise: 0.30"

Helper text:

"Higher values introduce more corruption before reconstruction."


The conceptual noise process is:

noisy_image =
    original_image +
    noise_level × GaussianNoise

Then:

clip values to 0–1


Use the actual training preprocessing as the source of truth when implementing this behavior.


============================================================
12. LIVE NOISE PREVIEW
============================================================

When the noise slider changes:

Take the current processed input.

Generate Gaussian noise.

Add it to the image.

Clip to 0–1.

Display the noisy image.

Do NOT run the neural network on every slider movement.

The slider should only update the noisy preview.

Run model inference only when the user presses:

"Run Denoiser"


============================================================
13. MAIN ACTION
============================================================

Create a large premium CTA:

"Run Denoiser"

This button should work for BOTH:

Upload Image

and:

Draw Digit


When clicked:

1. Validate current input.
2. Preprocess image.
3. Create noisy input.
4. Convert to tensor.
5. Verify tensor shape.
6. Run model prediction.
7. Process model output.
8. Convert output into a displayable image.
9. Display results.


============================================================
14. LOADING STATE
============================================================

When inference starts:

Disable the Run Denoiser button.

Show an elegant loading animation.

Text:

"Running neural reconstruction..."

You can visually show:

Preparing image
↓
Encoding
↓
Reconstructing

But do NOT fake actual model progress percentages.

This should simply be an animated loading state.

After completion:

"Reconstruction Complete"


============================================================
15. RESULT SECTION
============================================================

Create a beautiful results section.

Title:

"Reconstruction Results"

Display three large cards:

CARD 1:

ORIGINAL

Description:

"Your original handwritten digit."


CARD 2:

NOISY INPUT

Description:

"Gaussian noise applied before inference."


CARD 3:

DENOISED OUTPUT

Description:

"Reconstructed by the autoencoder."


Desktop:

3 columns.

Mobile:

1 column.


============================================================
16. DRAWING RESULTS
============================================================

For Draw Digit mode:

┌──────────────────┬──────────────────┬──────────────────┐
│ YOUR DRAWING     │ NOISY INPUT      │ DENOISED OUTPUT  │
│                  │                  │                  │
│       7          │     noisy 7      │        7         │
│                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘


For Upload Image mode:

┌──────────────────┬──────────────────┬──────────────────┐
│ ORIGINAL         │ NOISY INPUT      │ DENOISED OUTPUT  │
│                  │                  │                  │
│ uploaded digit   │ corrupted digit  │ clean result     │
│                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘


Do NOT display:

"Predicted: 7"

because this application is not a classification model.


============================================================
17. IMAGE RENDERING
============================================================

MNIST images are only 28 × 28.

When displaying them larger:

Use:

image-rendering: pixelated;

where appropriate.

Preserve aspect ratio.

Do not distort the image.

The displayed image can be large while the underlying data remains 28 × 28.


============================================================
18. BEFORE / AFTER COMPARISON
============================================================

Create a premium:

"Before vs After"

section.

Show:

Original

vs

Denoised


Optionally implement an interactive comparison slider.

If implementing the slider:

- Make it responsive
- Make it touch-friendly
- Keep it lightweight
- Do not introduce unnecessary dependencies


============================================================
19. CLEAR EVERYTHING
============================================================

Create a prominent:

"Clear"

button.

When clicked:

- Clear uploaded image
- Clear drawing
- Clear model input preview
- Clear noisy image
- Clear denoised output
- Reset noise to 0.30
- Reset brush size
- Reset filename
- Clear errors
- Hide results
- Reset UI to initial state

No full page refresh should be required.


============================================================
20. DRAWING CLEAR BUTTON
============================================================

Inside Draw Digit mode, provide:

"Clear Canvas"

This should only clear the drawing canvas.

It should not necessarily reset the entire application.

Global:

"Clear"

should reset everything.


============================================================
21. PREMIUM UI/UX DESIGN
============================================================

The application should look like a premium AI product.

Do NOT make it look like:

- A basic college HTML project
- Bootstrap default UI
- A generic form
- An old-fashioned ML demo


Design direction:

Dark premium interface.

Base:

Deep navy / charcoal.

Accent:

Indigo
Violet
Subtle cyan

Use:

- Gradient accents
- Glassmorphism cards
- Soft shadows
- Rounded corners
- Subtle borders
- Premium typography
- Clean whitespace
- Smooth hover states
- Micro-interactions


Avoid excessive neon.


============================================================
22. HERO SECTION
============================================================

Create:

Small badge:

"MNIST • DENOISING AUTOENCODER"

Headline:

"Clean the Noise.
Reveal the Digit."

Subtitle:

"Upload or draw a handwritten digit and watch a neural network reconstruct a cleaner version from noisy input."

Primary CTA:

"Start Denoising"

Secondary CTA:

"How It Works"


Include a subtle visual:

ORIGINAL
   ↓
NOISY
   ↓
DENOISED


============================================================
23. MAIN WORKSPACE
============================================================

The main workspace should be the center of the website.

Structure:

INPUT METHOD

[ Upload Image ] [ Draw Digit ]


INPUT AREA

Upload interface
OR
Drawing canvas


NOISE CONTROL

Noise slider


ACTION

Run Denoiser


RESULTS

Original / Noisy / Denoised


This should feel like an interactive AI laboratory.


============================================================
24. MODEL INSIGHTS
============================================================

Create a section:

"Model Insights"

Show only information that can be verified from the actual model.

Possible fields:

Model:
MNIST Denoising Autoencoder

Input:
28 × 28 × 1

Task:
Image Reconstruction

Noise:
Gaussian

Framework:
TensorFlow / Keras

Browser inference:
TensorFlow.js


If exact architecture/layer information is available from inspecting the H5 model, display it.

Do not invent values.


============================================================
25. HOW IT WORKS
============================================================

Create a beautiful four-step explanation.

01 — INPUT

"Upload an image or draw a digit."

02 — CORRUPT

"Controlled Gaussian noise is added to the digit."

03 — ENCODE

"The encoder compresses the visual information into a learned representation."

04 — RECONSTRUCT

"The decoder reconstructs a cleaner version of the digit."


Use icons and subtle animations.


============================================================
26. AUTOENCODER ARCHITECTURE VISUAL
============================================================

Create a visual architecture diagram.

Use:

INPUT
28 × 28 × 1

↓

ENCODER

↓

COMPRESSED REPRESENTATION

↓

DECODER

↓

OUTPUT
28 × 28 × 1


If exact layer dimensions are verified from the H5 model, display them.

Otherwise, do not invent layer dimensions.


============================================================
27. FOOTER
============================================================

Footer:

"MNIST Denoising Autoencoder"

Small text:

"An interactive demonstration of image reconstruction with deep learning."

Links can include:

How It Works
Model
GitHub

Do not add fake links.


============================================================
28. RESPONSIVE DESIGN
============================================================

The website must work perfectly on:

Desktop
Laptop
Tablet
Mobile


Desktop:

Wide dashboard.

Tablet:

Adaptive grid.

Mobile:

Single column.

Drawing canvas must remain square.

Upload cards must fit the screen.

Results should stack vertically.

No horizontal scrolling.


============================================================
29. ACCESSIBILITY
============================================================

Implement:

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Visible focus states
- Alt text
- Accessible buttons
- Proper form labels
- Good contrast
- Reduced motion support


Do not rely only on color.


============================================================
30. JAVASCRIPT ARCHITECTURE
============================================================

Use clean modular JavaScript.

Create:

js/
    app.js
    model.js
    image-processing.js
    drawing.js
    ui.js


model.js:

- Load TensorFlow.js
- Load model
- Keep model in memory
- Run prediction
- Handle model errors


image-processing.js:

- Load image
- Convert grayscale
- Resize
- Normalize
- Crop
- Tensor creation
- Tensor-to-image conversion
- Gaussian noise
- Clipping


drawing.js:

- Canvas initialization
- Pointer drawing
- Touch drawing
- Brush size
- Clear
- Undo


ui.js:

- Tab switching
- Upload UI
- Preview
- Loading state
- Result rendering
- Error messages
- Clear/reset


app.js:

- Application initialization
- Event listeners
- Connect all components


============================================================
31. TENSOR MANAGEMENT
============================================================

This is important for TensorFlow.js.

Avoid memory leaks.

Use:

tf.tidy()

where appropriate.

Dispose intermediate tensors using:

tensor.dispose()

Do not continuously accumulate tensors during:

- Slider changes
- Drawing
- Prediction


============================================================
32. MODEL LOADING
============================================================

When the page loads:

Show:

"Loading AI model..."

After successful loading:

"AI model ready"

Before model is ready:

Disable:

Run Denoiser

If model loading fails:

Show:

"Unable to load the AI model. Please check the model files."


Do not expose raw technical stack traces.


============================================================
33. ERROR HANDLING
============================================================

Handle:

- No image
- Invalid image
- Unsupported format
- Corrupt image
- Empty canvas
- Model loading failure
- Tensor shape mismatch
- Prediction failure
- Missing model files
- Large upload


Friendly examples:

"Please upload an image first."

"Please draw a digit before running the denoiser."

"We couldn't process this image. Please try another one."

"The AI model could not be loaded."


Never show raw errors to normal users.


============================================================
34. FILE VALIDATION
============================================================

Accept:

PNG
JPG
JPEG


Validate:

- File extension
- MIME type where practical
- File size

Set a reasonable maximum upload size.

Do not trust filenames.


============================================================
35. PROJECT STRUCTURE
============================================================

Use a clean production-quality structure:

mnist-denoising-autoencoder/
│
├── index.html
├── README.md
├── package.json
├── netlify.toml
├── .gitignore
│
├── model/
│   ├── model.json
│   └── group1-shard*.bin
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── model.js
│   ├── image-processing.js
│   ├── drawing.js
│   └── ui.js
│
└── assets/
    ├── icons/
    └── images/


If TensorFlow.js conversion creates a different number of weight shard files, preserve the generated structure.


============================================================
36. NETLIFY CONFIGURATION
============================================================

Create:

netlify.toml

Configure the application for Netlify.

Use relative paths.

Do not hardcode:

C:\Users\...
localhost
127.0.0.1


The production website must be able to load:

model/model.json

and:

model/*.bin


Ensure the model files are included in deployment.


============================================================
37. PACKAGE.JSON
============================================================

Keep dependencies minimal.

If a package.json is required for development tooling, include only necessary packages.

Do not introduce React or a large framework unless there is a strong technical reason.


============================================================
38. README
============================================================

Create a detailed README.

Include:

Project overview

What is a denoising autoencoder?

Machine learning pipeline

How Gaussian noise is used

How the model is loaded

How H5 is converted to TensorFlow.js

How to run locally

How to deploy to Netlify

Folder structure

Troubleshooting

Browser inference explanation


============================================================
39. LOCAL DEVELOPMENT
============================================================

The application must be runnable locally.

Do not rely on opening index.html directly with file:// because browser model loading/CORS can cause problems.

Use a local development server.

Explain how to start it.

For example:

python -m http.server 8000

Then:

http://localhost:8000


============================================================
40. NETLIFY DEPLOYMENT
============================================================

The final application should be deployable by:

- Connecting GitHub repository to Netlify
OR
- Netlify CLI
OR
- Dragging the static project into Netlify if appropriate


The README must explain the deployment steps clearly.


============================================================
41. NO FLASK IN PRODUCTION
============================================================

Do not use Flask for the final Netlify-hosted application.

The original ML model may have been created with Python/Keras, but the deployed application should use:

TensorFlow.js

for browser inference if possible.


If TensorFlow.js conversion is impossible:

Do not create a fake solution.

Clearly explain that a separate backend such as:

Flask
FastAPI
Cloud Run
Render
Railway
AWS
etc.

would be required.

But still build the frontend in a way that can later communicate with an API.


============================================================
42. IMPORTANT: NO DIGIT CLASSIFICATION
============================================================

This application should NOT claim:

"Prediction: 7"

because the model is a denoising autoencoder.

The output is an image reconstruction.

Use terminology:

Original
Noisy Input
Denoised Output
Reconstruction


NOT:

Predicted Class
Classification
Accuracy of digit prediction


============================================================
43. OPTIONAL VISUAL METRICS
============================================================

If useful, calculate simple image reconstruction metrics such as:

MSE

between:

original image

and:

denoised image

Only include this if it is correctly implemented.

Label it:

"Reconstruction MSE"

Do not call it classification accuracy.


============================================================
44. IMAGE COMPARISON
============================================================

For every inference, show:

Original image

Noisy input

Denoised output

Optionally show:

Reconstruction MSE


Make the comparison visually clear.


============================================================
45. EMPTY STATE
============================================================

Before the user provides an image, show a beautiful empty state.

Example:

"Your neural canvas is ready."

"Upload an image or draw a digit to begin."

Use a subtle visual illustration.


============================================================
46. DRAWING EMPTY STATE
============================================================

When Draw Digit is selected:

Canvas should initially show:

"Draw a digit here"

This should disappear once drawing starts.

Do not permanently render text into the actual model input.


============================================================
47. DRAWING PERFORMANCE
============================================================

Do not send every canvas stroke to the model.

Drawing should only update the visual canvas.

Preprocessing should happen when needed.

Model inference happens only when:

"Run Denoiser"

is clicked.


============================================================
48. NOISE RANDOMNESS
============================================================

Every time the user changes noise or runs a new denoising operation, generate appropriate Gaussian noise.

Make the noise level configurable.

Default:

0.30


============================================================
49. STATE MANAGEMENT
============================================================

Maintain application state for:

- Current input method
- Uploaded file
- Original image
- Processed 28×28 image
- Current noise level
- Noisy image
- Model status
- Denoised output
- Loading status
- Errors


Keep the state logic clean and understandable.


============================================================
50. FINAL VISUAL FLOW
============================================================

The final website should feel like this:

                NEURAL DENOISER

          Clean the Noise.
          Reveal the Digit.

        MNIST Denoising Autoencoder


       ┌─────────────────────────┐
       │ Upload Image │ Draw Digit│
       └─────────────────────────┘


        INPUT WORKSPACE

     Upload a digit
            OR
       Draw a digit


       Noise Intensity

      0.00 ───●──── 0.60

          Gaussian noise: 0.30


        [ RUN DENOISER ]


       RECONSTRUCTION RESULTS


     ORIGINAL    NOISY     DENOISED

       [IMG]      [IMG]       [IMG]


         BEFORE vs AFTER


       HOW IT WORKS

       INPUT
         ↓
       NOISE
         ↓
       ENCODE
         ↓
       LATENT SPACE
         ↓
       DECODE
         ↓
       RECONSTRUCT


         MODEL INSIGHTS


============================================================
51. QUALITY BAR
============================================================

This should look like a real AI product.

It must be:

- Beautiful
- Responsive
- Fast
- Accessible
- Technically correct
- Easy to understand
- Portfolio-quality
- Interview-demo-quality
- Netlify-ready


Do not generate a simple template.

Do not generate placeholder buttons.

Do not generate fake inference.

Do not generate fake model metrics.

Do not create a fake classification feature.

Actually connect the UI to the trained model.


============================================================
52. FINAL ACCEPTANCE TEST
============================================================

Before declaring the application complete, test the following:

MODEL:

[ ] H5 model inspected
[ ] Input shape verified
[ ] Output shape verified
[ ] TensorFlow.js conversion verified
[ ] model.json generated
[ ] weight files generated
[ ] Browser can load model


UPLOAD:

[ ] Upload PNG
[ ] Upload JPG
[ ] Preview image
[ ] Resize to expected model dimensions
[ ] Convert grayscale
[ ] Normalize correctly
[ ] Add noise
[ ] Run inference


DRAW:

[ ] Draw with mouse
[ ] Draw with touch
[ ] Draw with stylus/pointer
[ ] Change brush size
[ ] Clear canvas
[ ] Convert drawing to model input
[ ] Correct 28×28 preprocessing
[ ] Add noise
[ ] Run inference


RESULTS:

[ ] Original displayed
[ ] Noisy image displayed
[ ] Denoised output displayed
[ ] Comparison works
[ ] Optional MSE works correctly


UI:

[ ] Premium design
[ ] Responsive
[ ] Mobile friendly
[ ] Accessible
[ ] Smooth animations
[ ] Loading state
[ ] Error state
[ ] Empty state


CLEAR:

[ ] Clear upload
[ ] Clear drawing
[ ] Clear results
[ ] Reset noise
[ ] Reset application state


DEPLOYMENT:

[ ] Netlify configuration
[ ] Relative paths
[ ] Model files included
[ ] No localhost dependencies
[ ] No Python runtime dependency
[ ] Production deployment instructions


============================================================
53. MOST IMPORTANT FINAL INSTRUCTION
============================================================

Do not stop after creating the UI.

Implement the complete working application.

Inspect the actual attached denoising.h5 model first.

Use the real trained model.

Implement BOTH:

1. Upload Image
2. Draw Digit

Both must use the same denoising pipeline.

The user should be able to:

UPLOAD
   OR
DRAW

then:

ADD NOISE

then:

RUN DENOISER

then see:

ORIGINAL → NOISY → DENOISED

The final application should be a polished, visually impressive MNIST Denoising Autoencoder demonstration suitable for a machine-learning portfolio, project presentation, and interview.