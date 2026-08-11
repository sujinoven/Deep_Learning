import io
import pytest
import numpy as np
from PIL import Image
from app.utils.image_utils import allowed_file, preprocess_image

def test_allowed_file():
    allowed_exts = {'png', 'jpg', 'jpeg', 'webp'}
    assert allowed_file('test.png', allowed_exts) is True
    assert allowed_file('photo.JPEG', allowed_exts) is True
    assert allowed_file('image.webp', allowed_exts) is True
    assert allowed_file('document.pdf', allowed_exts) is False
    assert allowed_file('script.py', allowed_exts) is False
    assert allowed_file('noextension', allowed_exts) is False
    assert allowed_file('', allowed_exts) is False

def test_preprocess_image_valid():
    # Create a synthetic 100x100 RGB PIL image in memory
    img = Image.new('RGB', (100, 100), color=(255, 128, 64))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    tensor = preprocess_image(buf)
    
    # Assert shape is strictly (1, 32, 32, 3)
    assert tensor.shape == (1, 32, 32, 3)
    assert tensor.dtype == np.float32
    
    # Assert values are normalized between 0.0 and 1.0
    assert np.all(tensor >= 0.0)
    assert np.all(tensor <= 1.0)

def test_preprocess_image_invalid():
    # Provide corrupted bytes
    corrupt_stream = io.BytesIO(b"Not an image file content")
    with pytest.raises(ValueError) as exc_info:
        preprocess_image(corrupt_stream)
    assert "Invalid or corrupted image" in str(exc_info.value)
