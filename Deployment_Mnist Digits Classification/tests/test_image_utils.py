import io
import pytest
import numpy as np
from PIL import Image
from app.utils.image_utils import allowed_file, preprocess_image

def test_allowed_file():
    assert allowed_file("test.png") == True
    assert allowed_file("test.jpg") == True
    assert allowed_file("test.JPEG") == True
    assert allowed_file("test.webp") == True
    assert allowed_file("test.txt") == False
    assert allowed_file("test") == False

def test_preprocess_image():
    # Create a 100x100 RGB image
    img = Image.new('RGB', (100, 100), color='white')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_bytes = img_byte_arr.getvalue()

    tensor = preprocess_image(img_bytes)

    # Output shape must be (1, 28, 28)
    assert tensor.shape == (1, 28, 28)
    # Output values must be in [0.0, 1.0]
    assert tensor.min() >= 0.0
    assert tensor.max() <= 1.0
