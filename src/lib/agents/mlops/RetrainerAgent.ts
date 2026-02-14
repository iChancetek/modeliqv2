import { BaseAgent, AgentRole, AgentTask } from './AgentBase';

export class RetrainerAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'Retrainer';
    }

    protected getPersona(): string {
        return "You are an Automated Retraining Specialist. You decide when and how to retrain models based on performance decay and new data availability. You manage the lifecycle loop.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'evaluate_retraining_need') {
            const { monitorStatus, dataFreshness } = task.payload;

            const prompt = `
                Decide if retraining is needed.
                Monitor Status: ${JSON.stringify(monitorStatus)}
                New Data Points Available: ${dataFreshness.newRowsCount}
                Last Retrained: ${dataFreshness.daysSinceLastTraining} days ago

                Output JSON:
                - "shouldRetrain": boolean.
                - "urgency": 'low' | 'medium' | 'high'.
                - "strategy": 'incremental' vs 'full_retrain'.
                - "reasoning": Why?
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
