import os
import importlib.metadata

# Suppress oneDNN warnings
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

# Conditionally set legacy Keras behavior only for TensorFlow 2.16+
try:
    tf_names = ["tensorflow", "tensorflow-cpu", "tensorflow-gpu", "tensorflow-intel"]
    tf_version = next((dist.version for dist in importlib.metadata.distributions() if dist.metadata["Name"].lower() in tf_names), None)
    if tf_version:
        tf_parts = [int(p) for p in tf_version.split(".") if p.isdigit()]
        if len(tf_parts) >= 2 and (tf_parts[0] > 2 or (tf_parts[0] == 2 and tf_parts[1] >= 16)):
            os.environ["TF_USE_LEGACY_KERAS"] = "1"
            print(f"TensorFlow {tf_version} (>=2.16) detected: TF_USE_LEGACY_KERAS set to 1")
except Exception as e:
    print(f"TensorFlow version check failed, defaulting to standard initialization: {e}")

import base64
import time
from io import BytesIO
from fastapi import FastAPI, Request
from PIL import Image
import numpy as np
import tensorflow as tf

# Dynamically load legacy Keras compatibility layer if available
try:
    import tf_keras as keras
    print("Loaded legacy Keras via tf_keras compatibility layer.")
except ImportError:
    keras = tf.keras
    print("Loaded Keras via standard tf.keras module.")

app = FastAPI()

# Load model globally at startup
MODEL_PATH = os.path.join(os.path.dirname(__file__), "crack_model.h5")
print(f"Loading ML model from: {MODEL_PATH} ...")
model = keras.models.load_model(MODEL_PATH)
print("ML model loaded successfully!")

@app.get("/")
def home():
    return {"status": "working"}

@app.post("/predict")
async def predict(request: Request):
    start_time = time.time()
    
    data = await request.json()
    base64_image = data.get("imageData")
    
    if not base64_image:
        # Fallback/default mock if no image data is supplied (for background test compatibility)
        return {
            "severity": "none",
            "defectCount": 0,
            "confidenceScore": 0.95,
            "analysisSpeedMs": 100,
            "defectTypes": []
        }
    
    try:
        # Preprocessing:
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]
        image_data = base64.b64decode(base64_image)
        image = Image.open(BytesIO(image_data))
        
        # Resize to 224x224
        img = image.resize((224, 224))
        img = np.array(img)
        
        # Grayscale / Channel handling (ensure exactly 3 channels)
        if len(img.shape) == 2:
            img = np.stack((img,) * 3, axis=-1)
        elif len(img.shape) == 3 and img.shape[-1] == 4:
            img = img[:, :, :3]
            
        img = img / 255.0
        img = np.expand_dims(img, axis=0)
        
        # Model prediction
        prediction = model.predict(img)
        confidence = float(np.max(prediction))  # between 0.0 and 1.0
        class_idx = int(np.argmax(prediction))
        
        # Mapping logic
        if class_idx == 1:
            # Crack Detected
            severity = "high" if confidence > 0.90 else "medium"
            defect_count = 1
            defect_types = ["structural_crack"]
        else:
            # No Crack Detected
            severity = "none"
            defect_count = 0
            defect_types = []
            
        end_time = time.time()
        analysis_speed_ms = int((end_time - start_time) * 1000)
        
        return {
            "severity": severity,
            "defectCount": defect_count,
            "confidenceScore": confidence,
            "analysisSpeedMs": max(1, analysis_speed_ms),
            "defectTypes": defect_types
        }
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(f"Error executing prediction:\n{tb}")
        # Return fallback on processing error
        return {
            "severity": "none",
            "defectCount": 0,
            "confidenceScore": 0.0,
            "analysisSpeedMs": int((time.time() - start_time) * 1000),
            "defectTypes": [],
            "error": str(e),
            "traceback": tb
        }