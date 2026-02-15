import { TelemetryPoint, AnomalyAlert } from '../types';

// Force rebuild 2026-02-15

/**
 * simple-statistics is a lightweight library, but we can implement basic stats manually
 * to avoid dependencies if preferred. For now, manual implementation.
 */

export class AnomalyEngine {

    /**
     * Detects anomalies in a stream of telemetry points using Z-Score and IQR.
     */
    detectAnomalies(points: TelemetryPoint[]): AnomalyAlert[] {
        if (points.length < 10) return []; // Need baseline

        const alerts: AnomalyAlert[] = [];
        const latestInfo = points[points.length - 1];

        // 1. Latency Anomaly (Z-Score)
        const latencies = points.map(p => p.metrics.latencyMs);
        if (this.isAnomaly(latencies, latestInfo.metrics.latencyMs)) {
            alerts.push(this.createAlert(latestInfo, 'latency', 'Latency Violation', `Latency ${latestInfo.metrics.latencyMs.toFixed(0)}ms is significantly higher than baseline.`));
        }

        // 2. Error Rate Spike (Threshold > 5%)
        if (latestInfo.metrics.errorRate > 0.05) {
            alerts.push(this.createAlert(latestInfo, 'error_rate', 'High Error Rate', `Error rate is ${latestInfo.metrics.errorRate * 100}%, exceeding 5% threshold.`));
        }

        // 3. GenAI Token Spike (if applicable)
        if (latestInfo.genai) {
            const tokenCounts = points.filter(p => p.genai).map(p => p.genai!.tokenUsage.total);
            if (tokenCounts.length > 5 && this.isAnomaly(tokenCounts, latestInfo.genai.tokenUsage.total, 3)) {
                alerts.push(this.createAlert(latestInfo, 'cost', 'Token Usage Spike', `Unusual token usage: ${latestInfo.genai.tokenUsage.total} tokens.`));
            }
        }

        return alerts;
    }

    private isAnomaly(data: number[], value: number, thresholdStdDev = 2): boolean {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev === 0) return false;

        const zScore = (value - mean) / stdDev;
        return Math.abs(zScore) > thresholdStdDev;
    }

    private createAlert(point: TelemetryPoint, type: AnomalyAlert['type'], title: string, message: string): AnomalyAlert {
        return {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            resourceId: point.modelId,
            type: type,
            severity: 'warning',
            message: title + ": " + message,
            suggestedAction: 'Investigate',
            status: 'open'
        };
    }
}

export const anomalyEngine = new AnomalyEngine();
