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
    assert b"CIFAR Vision" in response.data
    assert b"See what the model sees" in response.data

def test_health_route(client):
    response = client.get('/health')
    assert response.status_code in (200, 503)
    data = response.get_json()
    assert 'status' in data
    assert 'model_loaded' in data

def test_predict_route_missing_file(client):
    response = client.post('/api/predict', data={})
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert "No image file" in data['error']

def test_predict_route_invalid_extension(client):
    data = {
        'file': (io.BytesIO(b"dummy text"), 'test.txt')
    }
    response = client.post('/api/predict', data=data, content_type='multipart/form-data')
    assert response.status_code == 400
    res_data = response.get_json()
    assert res_data['success'] is False
    assert "Invalid image format" in res_data['error']

def test_predict_route_valid_image(client):
    # Create valid PIL image in memory
    img = Image.new('RGB', (32, 32), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)

    data = {
        'file': (buf, 'sample_cat.png')
    }
    response = client.post('/api/predict', data=data, content_type='multipart/form-data')
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['success'] is True
    assert 'class_name' in res_data
    assert 'confidence' in res_data
    assert len(res_data['probabilities']) == 10
