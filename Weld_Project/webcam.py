import cv2
from ultralytics import YOLO
 
# Dataset class mapping:
#   0 -> Bad Weld   (defective)
#   1 -> Good Weld  (good)
#   2 -> Defect     (defective)
GOOD_IDS      = {1}
DEFECTIVE_IDS = {0, 2}
 
model = YOLO("runs/detect/weld_detection_project/weld_yolo_training/weights/best.pt")
 
video = cv2.VideoCapture(0)
 
while True:
    success, frame = video.read()
 
    if success == True:
        results = model(frame)
 
        frame_has_defect = False
        frame_has_good   = False
 
        for result in results:
            boxes = result.boxes
            for box in boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = model.names[class_id]
 
                if class_id in DEFECTIVE_IDS:
                    frame_has_defect = True
                    color = (0, 0, 255)   # red
                else:
                    frame_has_good = True
                    color = (0, 255, 0)   # green
 
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
                label = f"{class_name} {confidence:.2f}"
                cv2.putText(frame, label, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
 
        # Overall verdict banner
        if frame_has_defect:
            verdict, vcolor = "DEFECTIVE", (0, 0, 255)
        elif frame_has_good:
            verdict, vcolor = "GOOD", (0, 255, 0)
        else:
            verdict, vcolor = "NO WELD", (200, 200, 200)
 
        cv2.putText(frame, f"Verdict: {verdict}", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, vcolor, 2)
 
        cv2.imshow("YOLO Weld Detection", frame)
 
        key = cv2.waitKey(1)
        if key == 113 or key == 81:    # 'q' or 'Q'
            break
    else:
        print("Video Stopped")
        break
 
video.release()
cv2.destroyAllWindows()
