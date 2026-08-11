import os
import logging
import numpy as np
from pathlib import Path
import tensorflow as tf

logger = logging.getLogger(__name__)

CLASS_NAMES = [
    "airplane",
    "automobile",
    "bird",
    "cat",
    "deer",
    "dog",
    "frog",
    "horse",
    "ship",
    "truck"
]

class PredictionService:
    """
    Singleton service for loading the CIFAR-10 model once and executing predictions.
    """
    _instance = None

    def __new__(cls, model_path: str = None):
        if cls._instance is None:
            cls._instance = super(PredictionService, cls).__new__(cls)
            cls._instance.model = None
            cls._instance.is_loaded = False
            cls._instance.model_path = model_path
        return cls._instance

    def load_model(self, model_path: str = None) -> bool:
        """
        Load Keras model from disk once into memory.
        """
        if model_path:
            self.model_path = model_path
        
        if not self.model_path:
            logger.error("Model path was not specified.")
            self.is_loaded = False
            return False

        path_obj = Path(self.model_path)
        if not path_obj.exists():
            logger.error(f"CIFAR-10 model not found at specified path: {self.model_path}")
            self.is_loaded = False
            return False

        try:
            logger.info(f"Loading CIFAR-10 model from {self.model_path}...")
            # Suppress unnecessary TF output during load
            self.model = tf.keras.models.load_model(str(path_obj))
            self.is_loaded = True
            logger.info("CIFAR-10 Dense neural network model successfully loaded into memory.")
            return True
        except Exception as e:
            logger.error(f"Failed to load CIFAR-10 model: {str(e)}", exc_info=True)
            self.model = None
            self.is_loaded = False
            return False

    def predict(self, tensor: np.ndarray) -> dict:
        """
        Run inference on preprocessed image tensor (shape: (1, 32, 32, 3)).
        
        Returns:
            dict with success, class_id, class_name, confidence, and probabilities.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("CIFAR-10 model is not loaded in memory.")

        if tensor.shape != (1, 32, 32, 3):
            raise ValueError(f"Expected input tensor shape (1, 32, 32, 3), got {tensor.shape}")

        # Execute model prediction
        predictions = self.model.predict(tensor, verbose=0)
        probs_raw = predictions[0]

        predicted_class_id = int(np.argmax(probs_raw))
        predicted_class_name = CLASS_NAMES[predicted_class_id]
        raw_confidence = float(probs_raw[predicted_class_id])
        confidence_pct = round(raw_confidence * 100.0, 2)

        # Build full 10-class probability dictionary with percentage values rounded to 2 decimal places
        probabilities = {}
        for idx, class_name in enumerate(CLASS_NAMES):
            pct_val = round(float(probs_raw[idx]) * 100.0, 2)
            probabilities[class_name] = pct_val

        return {
            "success": True,
            "class_id": predicted_class_id,
            "class_name": predicted_class_name,
            "confidence": confidence_pct,
            "probabilities": probabilities
        }
