import { BaseAgent, AgentRole, AgentTask } from './AgentBase';

export class ProblemDefinerAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'ProblemDefiner';
    }

    protected getPersona(): string {
        return "You are an expert MLOps Solution Architect. Your goal is to translate vague business requirements into concrete ML problem definitions, identifying KPIs, success criteria, and constraints.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'analyze_requirements') {
            const { problemStatement, userGoal } = task.payload;

            const prompt = `
                Analyze the following user goal: "${userGoal}"
                And problem statement: "${problemStatement}"

                Output a JSON object with:
                - "refinedGoal": A clear, technical objective.
                - "taskType": Classification, Regression, Clustering, etc.
                - "suggestedKPIs": List of metrics (e.g. Accuracy, F1, RMSE).
                - "potentialChallenges": List of likely data or modeling issues.
                - "recommendedModelTypes": List of algorithms to try (e.g. XGBoost, Random Forest).
            `;

            const response = await this.think(prompt);
            // In a real implementation, we'd force JSON structure via response_format or parsing
            // For now, we assume the model behaves (or we parse leniently)
            try {
                // Simple cleanup if md blocks are present
                const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(jsonStr);
            } catch (e) {
                return { rawAnalysis: response };
            }
        }
        throw new Error(`Unknown task type: ${task.type}`);
    }
}
