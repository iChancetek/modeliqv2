import { BaseAgent, AgentRole, AgentTask } from './AgentBase';

export class ModelDeveloperAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'ModelDeveloper';
    }

    protected getPersona(): string {
        return "You are a Lead ML Research Scientist. Your goal is to select the optimal architecture, hyperparameters, and training strategy based on the data profile and problem definition.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'generate_training_code') {
            const { problemDefinition, dataProfile } = task.payload;

            const prompt = `
                Task: Generate Python training code for scikit-learn.
                
                Problem: ${JSON.stringify(problemDefinition)}
                Data Profile: ${JSON.stringify(dataProfile)}

                Output JSON:
                - "recommended_models": List of { "name": "ModelName", "confidence": 0-1, "params": {} }. Rank top 3.
                - "reasoning": Detailed explanation of the ranking.
                - "code": Python training script template for the top model.
            `;

            const response = await this.think(prompt);
            try {
                const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(jsonStr);
            } catch (e) {
                return { rawAnalysis: response };
            }
        }
        throw new Error(`Unknown task type: ${task.type}`);
    }
}
