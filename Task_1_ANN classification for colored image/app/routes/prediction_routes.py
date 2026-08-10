import logging
from flask import Blueprint, render_template, request, jsonify, current_app
from werkzeug.exceptions import RequestEntityTooLarge

from app.utils.image_utils import allowed_file, preprocess_image
from app.services.prediction_service import PredictionService

logger = logging.getLogger(__name__)

prediction_bp = Blueprint('prediction', __name__)

@prediction_bp.route('/', methods=['GET'])
def index():
    """Render main application UI."""
    return render_template('index.html')

@prediction_bp.route('/health', methods=['GET'])
def health():
    """Return model health status."""
    service = PredictionService()
    is_ready = service.is_loaded and service.model is not None
    status = "healthy" if is_ready else "unhealthy"
    status_code = 200 if is_ready else 503
    return jsonify({
        "status": status,
        "model_loaded": is_ready
    }), status_code

@prediction_bp.route('/api/predict', methods=['POST'])
def predict():
    """Accept uploaded image file and return CIFAR-10 prediction probabilities."""
    service = PredictionService()
    if not service.is_loaded or service.model is None:
        logger.error("Prediction attempted while model was unavailable.")
        return jsonify({
            "success": False,
            "error": "The classification model could not be loaded. Please ensure models/cifar10_dense_model.h5 exists."
        }), 503

    # Support 'file' or 'image' field key
    file = request.files.get('file') or request.files.get('image')

    if not file or file.filename == '':
        return jsonify({
            "success": False,
            "error": "No image file was uploaded. Please select an image."
        }), 400

    allowed_exts = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'webp'})
    if not allowed_file(file.filename, allowed_exts):
        return jsonify({
            "success": False,
            "error": f"Invalid image format. Supported extensions: {', '.join(allowed_exts).upper()}"
        }), 400

    try:
        # Preprocess uploaded file
        image_tensor = preprocess_image(file)
        
        # Execute model prediction
        result = service.predict(image_tensor)
        logger.info(f"Prediction successful: filename='{file.filename}', predicted='{result['class_name']}', confidence={result['confidence']}%")
        return jsonify(result), 200

    except ValueError as ve:
        logger.warning(f"Image preprocessing validation error: {str(ve)}")
        return jsonify({
            "success": False,
            "error": f"Unable to process image: {str(ve)}"
        }), 400
    except Exception as e:
        logger.error(f"Prediction server error: {str(e)}", exc_info=True)
        return jsonify({
            "success": False,
            "error": "We couldn't analyze this image. Please try another image."
        }), 500

@prediction_bp.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    return jsonify({
        "success": False,
        "error": "Image file too large. Please upload an image smaller than 5 MB."
    }), 413
