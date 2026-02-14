import { OpenAI } from 'openai';

import { OpenAI } from 'openai';

// Removed module-level initialization

interface InfraRequest {
    cloudProvider: 'aws' | 'gcp' | 'azure';
    resourceType: 'kubernetes' | 'serverless' | 'vm';
    appName: string;
    region: string;
}

interface InfraResult {
    terraformCode: string;
    explanation: string;
}

export class InfraAgent {
    async generateInfra(request: InfraRequest): Promise<InfraResult> {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true
        });

        const prompt = `
      You are an expert Cloud Architect. Generate Infrastructure-as-Code (Terraform) for deploying an ML model.

      Requirements:
      - Cloud: ${request.cloudProvider}
      - Resource Type: ${request.resourceType} (e.g., EKS/GKE for kubernetes, Lambda/Cloud Run for serverless)
      - App Name: ${request.appName}
      - Region: ${request.region}

      Output JSON with:
      - "terraformCode": valid HCL code.
      - "explanation": Brief explanation of the resources created.
    `;

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4-turbo-preview",
                messages: [{ role: "system", content: "You are a Cloud Architect." }, { role: "user", content: prompt }],
                response_format: { type: "json_object" },
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("No response from AI");

            return JSON.parse(content) as InfraResult;
        } catch (error) {
            console.error("Infra Agent Error:", error);
            throw new Error("Failed to generate infrastructure code.");
        }
    }
}
