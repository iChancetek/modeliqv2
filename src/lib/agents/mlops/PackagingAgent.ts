import { OpenAI } from 'openai';

import { OpenAI } from 'openai';

// Removed module-level initialization to prevent client-side crashes

interface PackagingRequest {
    modelName: string;
    modelType: string;
    pythonVersion: string;
    requirements: string[];
    framework: 'sklearn' | 'tensorflow' | 'pytorch' | 'xgboost';
}

interface PackagingResult {
    dockerfile: string;
    requirementsTxt: string;
    serverCode: string; // FastAPI app
}

export class PackagingAgent {
    async generatePackage(request: PackagingRequest): Promise<PackagingResult> {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true // Allow client-side usage if needed (though API routes preferred)
        });

        const telemetryUrl = process.env.NEXT_PUBLIC_API_URL || 'https://modeliqv2.firebaseapp.com';

        const prompt = `
You are an expert MLOps engineer. Generate the necessary files to containerize an ML model for production deployment with BUILT-IN TELEMETRY.

Model Details:
- Name: ${request.modelName}
- Type: ${request.modelType}
- Framework: ${request.framework}
- Python Version: ${request.pythonVersion}
- Dependencies: ${request.requirements.join(', ')}

**CRITICAL**: The FastAPI server MUST include telemetry hooks that POST metrics to the Modeliq Sentinel API after each prediction.

Output JSON with the following keys:
- "dockerfile": A production-ready Dockerfile (using multi-stage builds, non-root user).
- "requirementsTxt": The content of requirements.txt (include 'requests' for telemetry).
- "serverCode": A complete main.py using FastAPI with the following telemetry integration:

TELEMETRY TEMPLATE:
\`\`\`python
import requests
import time

TELEMETRY_URL = "${telemetryUrl}/api/telemetry/ingest"
MODEL_ID = "${request.modelName}"
MODEL_VERSION = "v1.0.0"

def send_telemetry(latency_ms, input_features, output, confidence):
    try:
        payload = {
            "modelId": MODEL_ID,
            "version": MODEL_VERSION,
            "metrics": {
                "latencyMs": latency_ms,
                "throughputRps": 1,
                "errorRate": 0.0,
                "cpuUsage": 0.5,
                "memoryUsage": 0.6
            },
            "prediction": {
                "inputFeatures": input_features,
                "outputValue": str(output),
                "confidence": float(confidence)
            }
        }
        requests.post(TELEMETRY_URL, json=payload, timeout=2)
    except Exception as e:
        print(f"Telemetry failed: {e}")

@app.post("/predict")
async def predict(data: dict):
    start = time.time()
    result = model.predict(data['features'])
    confidence = 0.95
    latency_ms = (time.time() - start) * 1000
    send_telemetry(latency_ms, data['features'], result, confidence)
    return {"prediction": result, "confidence": confidence}
\`\`\`

Ensure the /predict endpoint includes this telemetry call for every request.
    `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview", // Or gpt-3.5-turbo if cost concern, but 4 is better for code
                messages: [{ role: "system", content: "You are a helpful MLOps assistant." }, { role: "user", content: prompt }],
                response_format: { type: "json_object" },
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No response from AI");

            const result = JSON.parse(content) as PackagingResult;
            return result;
        } catch (error) {
            console.error("Packaging Agent Error:", error);
            throw new Error("Failed to generate packaging artifacts.");
        }
    }
}
