import io
import pytest
from PIL import Image
from app import create_app
from config import TestingConfig

@pytest.fixture
def client():
    app = create_app(TestingConfig)
    with app.test_client() as client:
        yield client

def test_index_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'MNIST Vision' in response.data

def test_health_check_route(client):
    response = client.get('/health')
    assert response.status_code in [200, 503]
    json_data = response.get_json()
    assert 'status' in json_data
    assert 'model_loaded' in json_data

def test_predict_route_with_image(client):
    # Create test PNG image
    img = Image.new('L', (28, 28), color=255)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)

    data = {
        'image': (img_bytes, 'digit_test.png')
    }

    response = client.post('/api/predict', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] == True
    assert 'prediction' in json_data
    assert 'confidence' in json_data
    assert 'probabilities' in json_data
