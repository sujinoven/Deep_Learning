import os

train_labels_path = r"datasets/train/labels"

# Dataset class mapping (from data.yaml):
#   0 -> Bad Weld   (defective)
#   1 -> Good Weld  (good)
#   2 -> Defect     (defective)
GOOD_IDS      = {1}
DEFECTIVE_IDS = {0, 2}

class_count = {
    "good":      0,
    "defective": 0,
}

for file in os.listdir(train_labels_path):
    if not file.endswith(".txt"):
        continue

    file_path = os.path.join(train_labels_path, file)

    with open(file_path, 'r') as f:
        lines = f.readlines()

        for line in lines:
            line = line.strip()
            if not line:
                continue
            class_id = int(line.split()[0])

            if class_id in GOOD_IDS:
                class_count["good"] += 1
            elif class_id in DEFECTIVE_IDS:
                class_count["defective"] += 1

print("GOOD Weld Count      :", class_count["good"])
print("DEFECTIVE Weld Count :", class_count["defective"])
