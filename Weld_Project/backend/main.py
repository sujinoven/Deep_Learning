import os
import io
import base64
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO

app = FastAPI(title="YOLO Weld Quality Inspection API")

# Enable CORS for local React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows localhost:5173 and all local dev origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants & Class mappings
MODEL_PATH = "runs/detect/weld_detection_project/weld_yolo_training/weights/best.pt"
GOOD_IDS = {1}
DEFECTIVE_IDS = {0, 2}

# Global model instance
model = None
model_load_error = None

try:
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
        print(f"[INFO] Successfully loaded YOLO model from {MODEL_PATH}")
    else:
        model_load_error = f"Model file not found at path: {MODEL_PATH}"
        print(f"[ERROR] {model_load_error}")
except Exception as e:
    model_load_error = str(e)
    print(f"[ERROR] Failed to load model: {e}")


def process_image_bytes(image_bytes: bytes, conf_threshold: float = 0.25):
    """
    Runs YOLO inference on image bytes, annotates image with bounding boxes,
    and calculates structured results.
    """
    if model is None:
        raise HTTPException(
            status_code=500,
            detail=f"YOLO model is not ready. {model_load_error or ''}"
        )

    # Convert bytes to OpenCV image (BGR format)
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image file or corrupted format.")

    # Run inference
    results = model(image, conf=conf_threshold)

    all_detections = []

    for result in results:
        boxes = result.boxes
        for box in boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = model.names.get(class_id, f"Class {class_id}")

            # Green for Good Weld, Red for Bad Weld/Defect
            is_good = class_id in GOOD_IDS
            color = (0, 255, 0) if is_good else (0, 0, 255)

            # Draw bounding box
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)

            # Draw label background + text
            label = f"{class_name} {confidence:.2f}"
            (text_w, text_h), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(image, (x1, y1 - text_h - 10), (x1 + text_w + 6, y1), color, -1)
            cv2.putText(
                image, label, (x1 + 3, y1 - 5),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA
            )

            all_detections.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "is_good": is_good,
                "bbox": {"x1": x1, "y1": y1, "x2": x2, "y2": y2}
            })

    # Determine overall verdict
    defective_dets = [d for d in all_detections if d["class_id"] in DEFECTIVE_IDS]
    good_dets = [d for d in all_detections if d["class_id"] in GOOD_IDS]

    if defective_dets:
        best = max(defective_dets, key=lambda d: d["confidence"])
        overall_result = "BAD WELD"
        overall_confidence = best["confidence"]
    elif good_dets:
        best = max(good_dets, key=lambda d: d["confidence"])
        overall_result = "GOOD WELD"
        overall_confidence = best["confidence"]
    else:
        overall_result = "NO WELD"
        overall_confidence = 0.0

    # Encode annotated image to JPEG base64
    _, buffer = cv2.imencode('.jpg', image)
    annotated_b64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "success": True,
        "overall_result": overall_result,
        "overall_confidence": round(overall_confidence, 4),
        "total_detections": len(all_detections),
        "good_count": len(good_dets),
        "bad_count": len(defective_dets),
        "detections": all_detections,
        "annotated_image": f"data:image/jpeg;base64,{annotated_b64}"
    }


@app.get("/api/health")
def health_check():
    """Health check endpoint confirming backend & model status."""
    return {
        "status": "ready" if model is not None else "error",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH,
        "error": model_load_error,
        "class_names": model.names if model is not None else {}
    }


@app.post("/api/predict")
async def predict_image(
    file: UploadFile = File(...),
    confidence: float = Form(0.25)
):
    """Predict weld status from an uploaded image file."""
    if file.content_type and not file.content_type.startswith("image/") and not (file.filename and file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))):
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Please upload JPG, JPEG, PNG, or WEBP."
        )

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Please upload a valid weld image.")

    return process_image_bytes(contents, conf_threshold=confidence)


@app.post("/api/predict_frame")
async def predict_frame(
    frame_data: dict
):
    """Predict weld status from a base64 encoded webcam frame."""
    b64_str = frame_data.get("image", "")
    confidence = float(frame_data.get("confidence", 0.25))

    if "," in b64_str:
        b64_str = b64_str.split(",")[1]

    try:
        image_bytes = base64.b64decode(b64_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 frame encoding.")

    return process_image_bytes(image_bytes, conf_threshold=confidence)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
