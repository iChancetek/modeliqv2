import os
import joblib
import pandas as pd
import uuid
from datetime import datetime

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

def save_model(pipeline, metrics, feature_names, target_col, problem_type):
    """
    Serializes and saves the trained pipeline.
    """
    model_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()
    
    metadata = {
        "model_id": model_id,
        "timestamp": timestamp,
        "metrics": metrics,
        "feature_names": feature_names,
        "target_col": target_col,
        "problem_type": problem_type
    }
    
    # Save Model Object
    joblib.dump(pipeline, os.path.join(MODEL_DIR, f"{model_id}.pkl"))
    
    # Save Metadata
    joblib.dump(metadata, os.path.join(MODEL_DIR, f"{model_id}_meta.pkl"))
    
    return model_id

def load_model(model_id):
    """
    Loads a model and its metadata by ID.
    """
    model_path = os.path.join(MODEL_DIR, f"{model_id}.pkl")
    meta_path = os.path.join(MODEL_DIR, f"{model_id}_meta.pkl")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model {model_id} not found.")
        
    pipeline = joblib.load(model_path)
    metadata = joblib.load(meta_path)
    
    return pipeline, metadata

def predict(model_id, data):
    """
    Runs prediction using the loaded model.
    data: dict or list of dicts (for DataFrame conversion)
    """
    pipeline, metadata = load_model(model_id)
    
    # Ensure input is a DataFrame
    if isinstance(data, dict):
        df = pd.DataFrame([data])
    else:
        df = pd.DataFrame(data)
        
    # Ensure correct columns (subset to features)
    features = metadata.get("feature_names", [])
    # In a real scenario, we might need to handle missing cols or reordering
    # For now assuming input data aligns or pipeline handles it (e.g. if we kept column transformer)
    
    predictions = pipeline.predict(df)
    
    if metadata.get("problem_type") == "Classification":
        probabilities = pipeline.predict_proba(df).tolist() if hasattr(pipeline, "predict_proba") else None
        return {"prediction": predictions.tolist(), "probabilities": probabilities}
    else:
        return {"prediction": predictions.tolist()}
