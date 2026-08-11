import os
from flask import Flask, jsonify
from config import Config
from app.services.prediction_service import prediction_service

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure uploads and models folders exist
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)
    os.makedirs(os.path.dirname(app.config.get('MODEL_PATH', 'models/digits_intel.h5')), exist_ok=True)

    # Load trained model into prediction service singleton
    model_path = app.config.get('MODEL_PATH')
    prediction_service.load_model(model_path)

    # Register blueprints
    from app.routes.prediction_routes import api_bp
    app.register_blueprint(api_bp)

    # Global Error Handlers
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            "success": False,
            "error": "Image too large",
            "message": "Please upload an image smaller than 5 MB."
        }), 413

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": "Resource not found",
            "message": "The requested endpoint does not exist."
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred on the server."
        }), 500

    return app
