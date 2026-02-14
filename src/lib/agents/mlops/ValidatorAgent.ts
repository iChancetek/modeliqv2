import { BaseAgent, AgentRole, AgentTask } from './AgentBase';

export class ValidatorAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'Validator';
    }

    protected getPersona(): string {
        return "You are a QA/Validation Engineer for AI Systems. Your goal is to rigorously test models for accuracy, bias, and robustness before they are allowed to deploy. You act as the 'Gatekeeper'.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'validate_model') {
            const { metrics, acceptanceCriteria } = task.payload;

            const prompt = `
                Review the following model metrics against acceptance criteria:
                
                Metrics: ${JSON.stringify(metrics)}
                Criteria: ${JSON.stringify(acceptanceCriteria)}

                Perform a risk assessment.
                
                Output JSON:
                - "approved": boolean (true if all critical criteria met).
                - "riskLevel": 'low' | 'medium' | 'high'.
                - "feedback": Constructive feedback on where the model failed or excelled.
                - "comparisonAssessment": How this compares to standard benchmarks (simulated reasoning).
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
