from ultralytics import YOLO
import cv2
import json
 
# Dataset class mapping:
#   0 -> Bad Weld   (defective)
#   1 -> Good Weld  (good)
#   2 -> Defect     (defective)
GOOD_IDS      = {1}
DEFECTIVE_IDS = {0, 2}
 
model = YOLO("runs/detect/weld_detection_project/weld_yolo_training/weights/best.pt")
 
image = cv2.imread("datasets/train/images/Screenshot-2022-12-05-224419_jpeg_jpg.rf.ac7299e9ac22ee98ac56b65b590e0360.jpg")
if image is None:
    raise FileNotFoundError("sample_weld.jpg not found in project root.")
 
results = model(image)
 
# Collect every detection so we can decide the overall verdict
all_detections = []
 
for result in results:
    boxes = result.boxes
    for box in boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        class_name = model.names[class_id]
 
        # Green for good, Red for defective
        color = (0, 255, 0) if class_id in GOOD_IDS else (0, 0, 255)
 
        cv2.rectangle(image, (x1, y1), (x2, y2), color, 3)
        label = f"{class_name} {confidence:.2f}"
        cv2.putText(image, label, (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
 
        all_detections.append({
            "class_id":   class_id,
            "class_name": class_name,
            "confidence": confidence,
        })
 
# ---- Decide overall verdict (binary) ----
defective_dets = [d for d in all_detections if d["class_id"] in DEFECTIVE_IDS]
good_dets      = [d for d in all_detections if d["class_id"] in GOOD_IDS]
 
if defective_dets:
    best = max(defective_dets, key=lambda d: d["confidence"])
    verdict, verdict_conf = "defective", best["confidence"]
elif good_dets:
    best = max(good_dets, key=lambda d: d["confidence"])
    verdict, verdict_conf = "good", best["confidence"]
else:
    verdict, verdict_conf = "unknown", 0.0
 
# ---- Save prediction as JSON ----
output = {"class": verdict, "confidence": round(verdict_conf, 4)}
with open("prediction.json", "w") as f:
    json.dump(output, f, indent=4)
 
print("Verdict:", verdict, "| Confidence:", round(verdict_conf, 4))
 
cv2.imshow("Weld Detection", image)
cv2.waitKey(0)
cv2.destroyAllWindows()
