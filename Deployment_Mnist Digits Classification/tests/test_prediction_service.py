import os
import pytest
import numpy as np
from app.services.prediction_service import PredictionService

def test_prediction_service_load_and_predict():
    model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models', 'digits_intel.h5'))
    assert os.path.exists(model_path), "Model file digits_intel.h5 must exist before running prediction service test"

    service = PredictionService(model_path)
    assert service.is_loaded == True

    # Dummy tensor shape (1, 28, 28)
    dummy_input = np.zeros((1, 28, 28), dtype=np.float32)
    result = service.predict(dummy_input)

    assert result['success'] == True
    assert 0 <= result['prediction'] <= 9
    assert 0.0 <= result['confidence'] <= 100.0
    assert len(result['probabilities']) == 10
