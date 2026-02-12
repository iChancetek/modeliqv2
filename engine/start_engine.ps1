# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate venv
Write-Host "Activating venv..."
& .\venv\Scripts\Activate.ps1

# Install requirements
Write-Host "Installing dependencies..."
pip install -r requirements.txt

# Start Server
Write-Host "Starting Uvicorn Server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
