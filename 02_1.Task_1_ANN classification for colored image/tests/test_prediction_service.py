import pytest
import numpy as np
from pathlib import Path
from app.services.prediction_service import PredictionService, CLASS_NAMES

def test_prediction_service_singleton_and_model_load():
    base_dir = Path(__file__).resolve().parent.parent
    model_path = base_dir / 'models' / 'cifar10_dense_model.h5'
    
    service = PredictionService(str(model_path))
    loaded = service.load_model()
    
    assert loaded is True
    assert service.is_loaded is True
    assert service.model is not None

def test_prediction_service_inference():
    base_dir = Path(__file__).resolve().parent.parent
    model_path = base_dir / 'models' / 'cifar10_dense_model.h5'
    
    service = PredictionService(str(model_path))
    if not service.is_loaded:
        service.load_model()

    # Create dummy tensor shape (1, 32, 32, 3)
    dummy_tensor = np.zeros((1, 32, 32, 3), dtype=np.float32)
    result = service.predict(dummy_tensor)

    assert result['success'] is True
    assert 0 <= result['class_id'] <= 9
    assert result['class_name'] in CLASS_NAMES
    assert 0.0 <= result['confidence'] <= 100.0
    assert len(result['probabilities']) == 10

    for name in CLASS_NAMES:
        assert name in result['probabilities']
        assert 0.0 <= result['probabilities'][name] <= 100.0

def test_prediction_invalid_shape():
    base_dir = Path(__file__).resolve().parent.parent
    model_path = base_dir / 'models' / 'cifar10_dense_model.h5'
    
    service = PredictionService(str(model_path))
    if not service.is_loaded:
        service.load_model()

    invalid_tensor = np.zeros((1, 64, 64, 3), dtype=np.float32)
    with pytest.raises(ValueError):
        service.predict(invalid_tensor)
