import fs from 'fs';
import path from 'path';
import { ProblemDefinerAgent } from '../lib/agents/mlops/ProblemDefinerAgent';

// Manual .env loading
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log("Loaded .env file");
    }
} catch (e) {
    console.warn("Could not load .env", e);
}

async function run() {
    console.log("Starting verification...");
    if (!process.env.OPENAI_API_KEY) {
        console.error("ERROR: OPENAI_API_KEY not found in environment.");
        process.exit(1);
    }

    const agent = new ProblemDefinerAgent();
    console.log("Agent initialized.");

    // Check if we can verify the model property (it's protected, but we can try to cast to any)
    const model = (agent as any).model;
    console.log(`Agent Model Configured: ${model}`);

    if (model !== 'gpt-5.2') {
        console.error(`ERROR: Expected 'gpt-5.2' but got '${model}'`);
        // We continue anyway to see if it works/fails
    }

    console.log("Sending test prompt to OpenAI...");
    try {
        const response = await agent.execute({
            id: 'test-run',
            type: 'analyze_requirements',
            payload: {
                userGoal: "Test connection",
                problemStatement: "Verify if GPT-5.2 model is accessible."
            },
            status: 'pending',
            logs: []
        });
        console.log("✅ SUCCESS: Agent responded.");
        console.log("Response:", JSON.stringify(response, null, 2));
    } catch (error: any) {
        console.error("❌ FAILURE: Agent failed to respond.");
        console.error("Error Message:", error.message);
        if (error.response) {
            console.error("API Error Data:", JSON.stringify(error.response.data || error.response, null, 2));
        }
        if (error.status === 404) {
            console.error("Hint: Model 'gpt-5.2' likely does not exist or you do not have access.");
        }
    }
}

run();
