import io
from PIL import Image, UnidentifiedImageError
import numpy as np

def allowed_file(filename: str, allowed_extensions: set) -> bool:
    """
    Check if a file has an allowed image extension.
    """
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in allowed_extensions

def preprocess_image(file_stream) -> np.ndarray:
    """
    Preprocess an uploaded image file stream into a format expected by the CIFAR-10 model.
    
    Steps:
    1. Open using Pillow.
    2. Convert to RGB.
    3. Resize to 32x32.
    4. Convert to NumPy array float32.
    5. Divide by 255.0.
    6. Add batch dimension -> (1, 32, 32, 3).
    
    Returns:
        np.ndarray with shape (1, 32, 32, 3) and dtype float32.
    
    Raises:
        ValueError: If file is not a valid or readable image.
    """
    try:
        if hasattr(file_stream, 'read'):
            file_bytes = file_stream.read()
            image = Image.open(io.BytesIO(file_bytes))
        elif isinstance(file_stream, bytes):
            image = Image.open(io.BytesIO(file_stream))
        elif isinstance(file_stream, Image.Image):
            image = file_stream
        else:
            raise ValueError("Unsupported input format for image preprocessing.")

        # Ensure image is in RGB mode
        image = image.convert("RGB")
        
        # Resize image to 32x32 using bilinear/bicubic resampling
        image = image.resize((32, 32), Image.Resampling.BILINEAR)
        
        # Convert to numpy array float32
        img_array = np.array(image, dtype=np.float32)
        
        # Normalize to [0.0, 1.0]
        img_array = img_array / 255.0
        
        # Add batch dimension
        tensor = np.expand_dims(img_array, axis=0)
        
        return tensor

    except (UnidentifiedImageError, OSError, TypeError) as e:
        raise ValueError(f"Invalid or corrupted image file: {str(e)}")
