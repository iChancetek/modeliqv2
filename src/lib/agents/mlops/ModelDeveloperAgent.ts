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
            const { problemDefinition, dataAnalysis } = task.payload;

            const prompt = `
                Task: Generate Python training code for scikit-learn.
                
                Problem: ${JSON.stringify(problemDefinition)}
                Data Profile: ${JSON.stringify(dataAnalysis)}

                Output JSON:
                - "algorithm": Selected algorithm name.
                - "hyperparameters": Dictionary of initial params.
                - "code": Complete Python script to train and save the model as 'model.pkl'.
                - "justification": Why this algorithm was chosen.
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
