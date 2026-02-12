import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import pandas as pd
from io import BytesIO

app = FastAPI(title="ChanceTEK Engine", version="1.0.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "ChanceTEK Engine Running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Read file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file_path)
        elif file.filename.endswith('.parquet'):
            df = pd.read_parquet(file_path)
            
        # Perform analysis
        from data_analysis import get_profile, infer_problem_type
        
        # Determine likely target (naive heuristic: last column)
        likely_target = df.columns[-1]
        problem_type = infer_problem_type(df, likely_target)
        profile = get_profile(df)
        
        # Generate AI Insights
        from ai_service import generate_data_insights
        insights = generate_data_insights(profile)
        
        return {
            "filename": file.filename, 
            "problem_type": problem_type,
            "likely_target": likely_target,
            "profile": profile,
            "insights": insights,
            "columns": df.columns.tolist(),
            "dtypes": df.dtypes.astype(str).to_dict(),
            "message": "File uploaded and analyzed."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CodeRequest(BaseModel):
    code: str

@app.post("/notebook/execute")
async def run_notebook_cell(request: CodeRequest):
    from notebook_service import execute_code
    return execute_code(request.code)

class VizRequest(BaseModel):
    type: str # 'dist', 'corr', 'box', 'violin'
    filename: str
    column: str = None
    x: str = None
    y: str = None

@app.post("/visualize")
async def generate_plot(request: VizRequest):
    import viz_service
    file_path = os.path.join(UPLOAD_DIR, request.filename)
    
    if request.filename.endswith('.csv'):
        df = pd.read_csv(file_path)
    # Add other formats
    
    try:
        data = []
        if request.type == 'dist':
            data = viz_service.get_distribution_data(df, request.column)
        elif request.type == 'corr':
            data = viz_service.get_correlation_data(df)
        elif request.type == 'scatter':
            data = viz_service.get_scatter_data(df, request.x, request.y)
        else:
            return {"error": "Invalid plot type"}
            
        return {"data": data, "type": request.type}
    except Exception as e:
        return {"error": str(e)}

# ... existing code ...

class TrainRequest(BaseModel):
    filename: str
    target_col: str
    problem_type: str
    algorithm_id: str

@app.post("/recommend")
async def get_recommendations(request: TrainRequest): # Reusing model for simplicity or create new one
    import ml_service
    return ml_service.recommend_algorithms(request.problem_type)

@app.post("/pipeline/preview")
async def preview_pipeline(request: dict):
    # request: { filename: str, steps: list }
    import transform_service
    from data_analysis import get_profile
    
    filename = request.get("filename")
    steps = request.get("steps", [])
    
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        # Load Data
        if filename.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif filename.endswith('.json'):
            df = pd.read_json(file_path)
        elif filename.endswith('.parquet'):
            df = pd.read_parquet(file_path)
        else:
             raise HTTPException(status_code=400, detail="Unsupported file format")

        # Apply Transforms
        df_transformed = transform_service.apply_transforms(df, steps)
        
        # Get head and profile of transformed data
        head = df_transformed.head(10).to_dict(orient='records')
        profile = get_profile(df_transformed)
        
        return {
            "head": head,
            "profile": profile,
            "columns": df_transformed.columns.tolist(),
            "shape": df_transformed.shape
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/pipeline/deploy")
async def deploy_model(request: dict):
    # expect { "pipeline": serialized_pipeline_bytes, "metrics": {...}, ... }
    # OR since we have session state or temporary storage, we might need a way to persist the LAST trained model.
    # For simplicity, let's assume the frontend sends the *results* of training as confirmation, 
    # but the backend *already has* the trained object in memory or temp file from the /train step.
    
    # Better approach: The /train step should return a temporary ID. 
    # Then /deploy confirms it to be saved permanently.
    
    # REVISIT: For this MVP, let's make /train return the model_id immediately as "deployed" for simplicity, 
    # OR let's add a specific 'save' step.
    
    # Let's assume the frontend sends the model_id returned by train (if we updated train to save it).
    # IF NOT, we need to save it here.
    
    # To keep it robust:
    # 1. Update /train to save the model to a 'temp' or 'latest' slot.
    # 2. /deploy moves it to permanent storage.
    
    # SIMPLIFICATION:
    # We will update /train to just SAVE the model immediately and return the ID.
    # So /deploy might just be a metadata update or "publishing" step.
    
    # Let's just create a /predict endpoint for now, assuming /train saves the model.
    pass

@app.get("/models/{model_id}")
async def get_model_details(model_id: str):
    import model_service
    try:
        _, metadata = model_service.load_model(model_id)
        # Convert non-serializable types if any, but metadata should be simple dicts
        return metadata
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/{model_id}")
async def predict(model_id: str, request: dict):
    # request: { "data": [ { "feature1": val1, ... } ] }
    import model_service
    try:
        results = model_service.predict(model_id, request.get("data"))
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # For now leaving as is or updating to use steps if passed in request (need to update TrainRequest model)
    # Let's assume TrainRequest is updated or we handle steps here.
    # To keep it simple and safe, I will just update the endpoint to use steps if provided in a "pipeline_steps" field manually added or we can update the Pydantic model.
    pass 
    # NOTE: Will refactor train fully in Step 7-9 implementation. For now focusing on preview.

# Re-adding the original train endpoint for backward compatibility until full refactor
@app.post("/train_legacy") 
async def train_legacy(request: TrainRequest):
    import ml_service
    import model_service
    
    file_path = os.path.join(UPLOAD_DIR, request.filename)
    if request.filename.endswith('.csv'):
        df = pd.read_csv(file_path)
    
    try:
        # Train
        metrics, pipeline = ml_service.train_model(df, request.target_col, request.algorithm_id, request.problem_type)
        
        # Save Model
        # Extract feature names (simple assumption: all cols except target)
        feature_names = [c for c in df.columns if c != request.target_col]
        model_id = model_service.save_model(pipeline, metrics, feature_names, request.target_col, request.problem_type)
        
        return {
            "metrics": metrics, 
            "status": "Training Complete",
            "model_id": model_id
        }
    except Exception as e:
        return {"error": str(e)}

