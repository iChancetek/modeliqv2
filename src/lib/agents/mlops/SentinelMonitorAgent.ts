import { BaseAgent, AgentRole, AgentTask } from './AgentBase';
import { anomalyEngine } from '@/lib/sentinel/engines/anomalyEngine';
import { driftEngine } from '@/lib/sentinel/engines/driftEngine';
import { TelemetryPoint } from '@/lib/sentinel/types';

export class SentinelMonitorAgent extends BaseAgent {
    getRole(): AgentRole {
        return 'SentinelMonitor';
    }

    protected getPersona(): string {
        return "You are Modeliq Sentinel, an AI-native observability brain. You monitor MLOps pipelines, GenAI models, and Infrastructure. You don't just report metrics; you explain WHY things are breaking and predict WHAT will happen next. You are proactive, precise, and solicitous of system health.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'analyze_telemetry') {
            const { resourceId, points } = task.payload as { resourceId: string, points: TelemetryPoint[] };

            // 1. Classical Statistical Analysis
            const anomalies = anomalyEngine.detectAnomalies(points);

            // 2. Drift Analysis (if prediction data exists)
            const driftResults = [];
            const predictionPoints = points.filter(p => p.prediction?.outputValue !== undefined);

            if (predictionPoints.length > 20) { // Min sample for drift
                // Simplified: Check drift on output value (concept drift proxy)
                // In real impl, we'd check input features too
                const baseline = predictionPoints.slice(0, 10).map(p => Number(p.prediction!.outputValue));
                const current = predictionPoints.slice(-10).map(p => Number(p.prediction!.outputValue));

                // Only numeric for now
                if (!baseline.some(isNaN)) {
                    const drift = driftEngine.detectDrift(baseline, current, 'output_prediction');
                    if (drift.hasDrift) driftResults.push(drift);
                }
            }

            // 3. AI Synthesis (LLM determines root cause & severity)
            if (anomalies.length > 0 || driftResults.length > 0) {
                const prompt = `
                    **Sentinel Situation Report**
                    Resource: ${resourceId}
                    
                    **Detected Signals:**
                    Anomalies: ${JSON.stringify(anomalies)}
                    Drift: ${JSON.stringify(driftResults)}
                    
                    **Recent Telemetry Context:**
                    ${JSON.stringify(points.slice(-3))}

                    **Mission:**
                    1. Analyze the correlation between anomalies and drift.
                    2. Hypothesize a root cause (e.g., "Upstream data schema change", "Competitor traffic spike").
                    3. Recommend a remediation action.

                    Output JSON:
                    {
                        "rootCause": "string",
                        "severity": "critical" | "warning",
                        "recommendation": "string",
                        "explanation": "string"
                    }
                 `;

                const analysis = await this.think(prompt);
                let aiInsight = {};
                try {
                    aiInsight = JSON.parse(analysis.replace(/```json/g, '').replace(/```/g, '').trim());
                } catch (e) {
                    aiInsight = { explanation: analysis };
                }

                return {
                    status: 'incident',
                    anomalies,
                    driftResults,
                    insight: aiInsight
                };
            }

            return {
                status: 'healthy',
                anomalies: [],
                driftResults: []
            };
        }

        throw new Error(`Unknown task type: ${task.type}`);
    }
}
