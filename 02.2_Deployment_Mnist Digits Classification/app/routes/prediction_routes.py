import base64
from flask import Blueprint, render_template, request, jsonify, current_app
from app.services.prediction_service import prediction_service
from app.utils.image_utils import allowed_file, preprocess_image

api_bp = Blueprint('api', __name__)

@api_bp.route('/', methods=['GET'])
def index():
    """Renders the main dashboard page."""
    return render_template('index.html')

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server and model state."""
    model_loaded = prediction_service.is_loaded
    return jsonify({
        "status": "online" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "service": "MNIST Vision AI"
    }), 200 if model_loaded else 503

@api_bp.route('/api/predict', methods=['POST'])
def predict():
    """
    Prediction API endpoint. Accepts file upload or base64 canvas drawing.
    """
    if not prediction_service.is_loaded:
        return jsonify({
            "success": False,
            "error": "AI model unavailable",
            "message": "The prediction model is currently not loaded. Please ensure digits_intel.h5 exists."
        }), 503

    image_bytes = None
    
    # 1. Check if request has file upload ('image' or 'file')
    if 'image' in request.files or 'file' in request.files:
        file = request.files.get('image') or request.files.get('file')
        if not file or file.filename == '':
            return jsonify({
                "success": False,
                "error": "Invalid file",
                "message": "No file was selected for upload."
            }), 400
            
        if not allowed_file(file.filename):
            return jsonify({
                "success": False,
                "error": "Invalid image format",
                "message": "Please upload a PNG, JPG, JPEG, or WEBP image."
            }), 400
            
        image_bytes = file.read()
        
    # 2. Check if request has JSON payload with base64 image_data (drawing canvas)
    elif request.is_json and request.json.get('image_data'):
        try:
            data_url = request.json.get('image_data')
            if ',' in data_url:
                header, encoded = data_url.split(',', 1)
            else:
                encoded = data_url
            image_bytes = base64.b64decode(encoded)
        except Exception as e:
            return jsonify({
                "success": False,
                "error": "Invalid canvas data",
                "message": f"Could not decode drawing canvas image data: {str(e)}"
            }), 400
    else:
        return jsonify({
            "success": False,
            "error": "Missing image input",
            "message": "Please provide an image file or canvas drawing data."
        }), 400

    # 3. Preprocess image & run inference
    try:
        image_tensor = preprocess_image(image_bytes)
        result = prediction_service.predict(image_tensor)
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({
            "success": False,
            "error": "Image processing error",
            "message": str(ve)
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Prediction failure",
            "message": "Something went wrong while analyzing the image."
        }), 500
