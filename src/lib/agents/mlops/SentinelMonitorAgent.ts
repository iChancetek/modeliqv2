import { BaseAgent, AgentRole, AgentTask } from './AgentBase';

export class SentinelMonitorAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'SentinelMonitor';
    }

    protected getPersona(): string {
        return "You are Modeliq Sentinel, an AI-native monitoring agent. You constantly watch telemetry streams for drift, anomalies, and performance degradation. You proactively alert humans when things go wrong.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'analyze_telemetry') {
            const { recentMetrics, historicalBaseline } = task.payload;

            const prompt = `
                Compare recent metrics to baseline.
                
                Recent: ${JSON.stringify(recentMetrics)}
                Baseline: ${JSON.stringify(historicalBaseline)}

                Detect anomalies using statistical reasoning.
                
                Output JSON:
                - "status": 'healthy' | 'degraded' | 'critical'
                - "anomalies": List of detected issues (e.g. "Latency spike > 200ms").
                - "driftDetected": boolean.
                - "rootCauseHypothesis": A guess at why this is happening.
                - "recommendedAction": "Scale up", "Retrain", or "Investigate".
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
