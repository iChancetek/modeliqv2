import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
        const prompt = `
      You are an expert MLOps engineer. Generate the necessary files to containerize an ML model for production deployment.
      
      Model Details:
      - Name: ${request.modelName}
      - Type: ${request.modelType}
      - Framework: ${request.framework}
      - Python Version: ${request.pythonVersion}
      - Dependencies: ${request.requirements.join(', ')}

      Output JSON with the following keys:
      - "dockerfile": A production-ready Dockerfile (using multi-stage builds, non-root user).
      - "requirementsTxt": The content of requirements.txt.
      - "serverCode": A complete main.py using FastAPI to serve the model (assume 'model.joblib' or 'model.pkl' is present).
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
