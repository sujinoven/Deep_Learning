import time
from ultralytics import YOLO
import cv2
 
model = YOLO("runs/detect/weld_detection_project/weld_yolo_training/weights/best.pt")          # or the full runs/... path
 
image = cv2.imread("runs/detect/weld_detection_project/weld_yolo_training/train_batch1.jpg")
 
start = time.time()
results = model(image)
end = time.time()
 
latency = end - start
print("Inference Time:", latency, "seconds")
