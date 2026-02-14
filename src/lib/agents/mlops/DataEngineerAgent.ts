import { BaseAgent, AgentRole, AgentTask } from './AgentBase';

export class DataEngineerAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'DataEngineer';
    }

    protected getPersona(): string {
        return "You are a Senior Data Engineer. Your goal is to analyze datasets for quality issues, suggest preprocessing pipelines (imputation, encoding, scaling), and detect schema anomalies.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'analyze_data') {
            const { sampleData, columns } = task.payload;

            const prompt = `
                Analyze this sample data (first 5 rows): ${JSON.stringify(sampleData)}
                Columns: ${JSON.stringify(columns)}

                Recommend a preprocessing pipeline. Output JSON:
                - "missingValuesStrategy": How to handle nulls (mean, median, drop).
                - "categoricalEncoding": OneHot vs Label encoding suggestions.
                - "scaling": Standard vs MinMax scaling necessity.
                - "outlierDetection": Recommended method (Z-score, IQR).
                - "featureEngineering": 2-3 ideas for new features.
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
