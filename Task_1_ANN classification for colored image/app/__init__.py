import logging
from flask import Flask
from config import Config
from app.services.prediction_service import PredictionService

def create_app(config_object=Config):
    """
    Application factory for CIFAR-10 classification web app.
    """
    app = Flask(__name__)
    app.config.from_object(config_object)

    # Configure logging format
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
    )
    logger = logging.getLogger(__name__)
    logger.info("Initializing CIFAR-10 Vision Web Application...")

    # Load ML Model into memory at startup
    model_path = app.config.get('MODEL_PATH')
    prediction_service = PredictionService(model_path)
    loaded = prediction_service.load_model()
    if loaded:
        logger.info("Model loaded successfully into PredictionService.")
    else:
        logger.warning(f"Model could not be loaded from '{model_path}'. Check if file exists.")

    # Register blueprints
    from app.routes.prediction_routes import prediction_bp
    app.register_blueprint(prediction_bp)

    return app
