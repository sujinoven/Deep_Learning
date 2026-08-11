import os
import numpy as np

class PredictionService:
    def __init__(self, model_path=None):
        self.model = None
        self.model_path = model_path
        self.is_loaded = False
        if model_path:
            self.load_model(model_path)

    def load_model(self, model_path):
        """Loads the trained Keras model into memory once."""
        self.model_path = model_path
        if not os.path.exists(model_path):
            print(f"Warning: Model file not found at '{model_path}'")
            self.is_loaded = False
            return False
            
        try:
            # Use keras.models.load_model or tf.keras.models.load_model
            import keras
            self.model = keras.models.load_model(model_path)
            self.is_loaded = True
            print(f"PredictionService: Successfully loaded model from '{model_path}'")
            return True
        except Exception as e:
            print(f"PredictionService: Error loading model: {e}")
            self.is_loaded = False
            return False

    def predict(self, image_tensor):
        """
        Runs model inference on preprocessed image tensor (shape: 1, 28, 28).
        Returns prediction result dictionary.
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model is not loaded. Ensure digits_intel.h5 exists in the models directory.")
            
        # Perform prediction
        preds = self.model.predict(image_tensor, verbose=0)[0]
        
        predicted_digit = int(np.argmax(preds))
        confidence = float(preds[predicted_digit] * 100.0)
        
        # Build probability map for digits 0-9
        probabilities = {str(digit): round(float(prob), 6) for digit, prob in enumerate(preds)}
        
        return {
            "success": True,
            "prediction": predicted_digit,
            "confidence": round(confidence, 2),
            "probabilities": probabilities
        }

# Global service instance singleton
prediction_service = PredictionService()
