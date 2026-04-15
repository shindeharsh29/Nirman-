import os
from PIL import Image
import imagehash
from ultralytics import YOLO
import json

# Load YOLO model. Using small generic model if custom isn't provided.
# When deployed, replace yolov8n.pt with custom trained weights like 'damage_detection.pt'
MODEL_PATH = "yolov8n.pt"

try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    print(f"Error loading YOLO model: {e}")
    model = None

def compute_image_hash(image_path: str) -> str:
    """Computes perceptual hash of an image for duplicate detection"""
    try:
        img = Image.open(image_path)
        hash_val = imagehash.phash(img)
        return str(hash_val)
    except Exception as e:
        print(f"Error computing image hash: {e}")
        return ""

def is_duplicate_hash(new_hash: str, db_hashes: list[str], threshold: int = 5) -> bool:
    """Checks if new_hash is very similar to any db_hashes"""
    if not new_hash:
        return False
    new_h = imagehash.hex_to_hash(new_hash)
    for h in db_hashes:
        try:
            db_h = imagehash.hex_to_hash(h)
            if new_h - db_h < threshold:
                return True
        except:
            continue
    return False

def run_damage_detection(image_path: str):
    """Runs YOLOv8 model and returns dict with confidence, type, and boxes"""
    if model is None:
        return {
            "ai_confidence": 0.0,
            "damage_type": "Unknown",
            "bounding_boxes": "[]"
        }
        
    results = model(image_path)
    if not results or not len(results):
        return {
            "ai_confidence": 0.0,
            "damage_type": "None",
            "bounding_boxes": "[]"
        }
        
    result = results[0]
    boxes = result.boxes
    if len(boxes) == 0:
        return {
            "ai_confidence": 0.0,
            "damage_type": "None",
            "bounding_boxes": "[]"
        }
    
    # We will aggregate to find highest confidence and average
    highest_conf = 0.0
    damage_label = "damage"
    box_list = []
    
    for box in boxes:
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        # label = model.names[cls] # Usually, but for placeholder we just map generic objects or mock
        box_data = box.xyxy[0].tolist() # [x1, y1, x2, y2]
        box_list.append({"box": box_data, "confidence": conf, "class": cls})
        
        if conf > highest_conf:
            highest_conf = conf
            # Mocking specific infrastructure damage mapping
            damage_label = "Pothole" if cls % 2 == 0 else "Crack" # Just a placeholder mock based on id
            
    return {
        "ai_confidence": highest_conf,
        "damage_type": damage_label,
        "bounding_boxes": json.dumps(box_list)
    }

def calculate_priority_score(ai_confidence: float, location_importance: float, duplicate_count: int) -> tuple[float, str]:
    """
    Computes priority based on metrics.
    ai_confidence: 0.0 to 1.0
    location_importance: 1.0 to 10.0
    duplicate_count: num of times reported
    """
    # Base score out of 100
    score = (ai_confidence * 40) + ((location_importance / 10) * 40) + (min(duplicate_count, 10) * 2)
    
    level = "Low"
    if score > 80:
        level = "Critical"
    elif score > 60:
        level = "High"
    elif score > 35:
        level = "Medium"
        
    return score, level
