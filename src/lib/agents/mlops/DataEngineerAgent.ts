import { BaseAgent, AgentRole, AgentTask } from './AgentBase';

export class DataEngineerAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'DataEngineer';
    }

    protected getPersona(): string {
        return "You are an expert Data Engineer and Preprocessing Specialist. Your goal is to inspect data profiles and recommend the optimal cleaning, scaling, encoding, and feature engineering strategies for machine learning pipelines.";
    }

    async execute(task: AgentTask): Promise<any> {
        const { problemDefinition, dataProfile } = task.payload;

        let prompt = "";

        switch (task.type) {
            case 'recommend_cleaning':
                prompt = `
                    Task: Recommend data cleaning strategies.
                    
                    Data Profile: ${JSON.stringify(dataProfile)}
                    Problem Type: ${problemDefinition.type}

                    Output JSON:
                    - "imputation": List of { column: string, strategy: "mean" | "median" | "most_frequent" | "constant" }. Logic: < 5% missing -> mean/median, 5-25% -> knn/most_frequent, > 25% -> drop or constant.
                    - "outliers": Strategy ("none" | "isolation_forest" | "iqr"). Logic: High variance/skew -> outlier removal.
                    - "reasoning": Brief explanation.
                `;
                break;

            case 'recommend_preprocessing':
                prompt = `
                    Task: Recommend preprocessing strategies (Scaling & Encoding).
                    
                    Data Profile: ${JSON.stringify(dataProfile)}
                    Problem Type: ${problemDefinition.type}

                    Output JSON:
                    - "scaling": "standard" | "minmax" | "robust". Logic: Standard default, Robust if outliers, MinMax for Neural Nets/Image.
                    - "encoding": "label" | "onehot". Logic: Low cardinality (<10) -> OneHot, High -> Label/Target.
                    - "reasoning": Brief explanation.
                `;
                break;

            case 'recommend_features':
                prompt = `
                   Task: Recommend feature engineering steps.
                   
                   Data Profile: ${JSON.stringify(dataProfile)}
                   Problem Type: ${problemDefinition.type}

                   Output JSON:
                   - "selected_features": List of string (columns to keep). Drop low variance or high correlation.
                   - "transformations": List of string descriptions (e.g., "LogTransform(Fare)", "Polynomial(Age)").
                   - "reasoning": Brief explanation.
                `;
                break;

            case 'recommend_imbalance':
                prompt = `
                   Task: Recommend data imbalance handling.
                   
                   Data Profile: ${JSON.stringify(dataProfile)}
                   Problem Type: ${problemDefinition.type}

                   Output JSON:
                   - "method": "none" | "smote" | "adasyn" | "undersampling" | "class_weight". Logic: Imbalance ratio > 0.75 -> SMOTE. > 0.85 -> SMOTE+Tomek. Large data -> Undersample. Tree models -> Class Weight.
                   - "confidence": number (0-1).
                   - "reasoning": Brief explanation.
                `;
                break;

            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }

        const response = await this.think(prompt);
        try {
            // Robust JSON parsing
            const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("Data Engineer Agent JSON Parse Error", e);
            // Return raw text as valid feedback if JSON fails, wrapped in a specific structure
            return { error: "Failed to parse JSON", raw: response };
        }
    }
}
