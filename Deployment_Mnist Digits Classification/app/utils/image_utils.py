import io
import numpy as np
from PIL import Image

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    """Check if file extension is allowed."""
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS

def preprocess_image(image_bytes, invert_if_bright=True):
    """
    Preprocess image for MNIST Keras model.
    1. Opens image from bytes (or PIL Image)
    2. Converts to Grayscale ('L')
    3. Resizes to 28x28
    4. Auto-inverts if background is bright (black stroke on white paper -> white stroke on black)
    5. Normalizes pixel values to [0, 1]
    6. Adds batch dimension -> shape (1, 28, 28)
    """
    try:
        if isinstance(image_bytes, bytes) or hasattr(image_bytes, 'read'):
            if hasattr(image_bytes, 'read'):
                image_bytes = image_bytes.read()
            img = Image.open(io.BytesIO(image_bytes))
        elif isinstance(image_bytes, Image.Image):
            img = image_bytes
        else:
            raise ValueError("Unsupported image input type")
        
        # Convert to grayscale
        img = img.convert('L')
        
        # Resize to 28x28 pixels
        img = img.resize((28, 28), Image.Resampling.BILINEAR)
        
        img_array = np.array(img, dtype=np.float32)
        
        # Smart background inversion:
        # Standard MNIST digits are white (high values) on dark background (low values).
        # Handwritten inputs on white paper or light canvases have high average intensity (>127).
        if invert_if_bright and np.mean(img_array) > 127:
            img_array = 255.0 - img_array
            
        # Normalize to [0.0, 1.0]
        img_array = img_array / 255.0
        
        # Ensure shape (1, 28, 28)
        img_tensor = np.expand_dims(img_array, axis=0)
        
        return img_tensor
    except Exception as e:
        raise ValueError(f"Failed to process image: {str(e)}")
