import { RuntimeMetrics, AnomalyAlert } from './types';

/**
 * Modeliq Sentinel - Anomaly Detection Engine
 * Detects point anomalies in runtime metrics.
 */

export class AnomalyEngine {
    private latencyHistory: number[] = [];
    private errorHistory: number[] = [];
    private windowSize = 50;

    analyze(metric: RuntimeMetrics): AnomalyAlert | null {
        // Update history
        this.updateHistory(this.latencyHistory, metric.latencyMs);
        this.updateHistory(this.errorHistory, metric.errorRate);

        // Check Latency Spike (Z-Score > 3)
        if (this.detectSpike(this.latencyHistory, metric.latencyMs)) {
            return {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type: 'latency',
                severity: 'warning',
                message: `Latency spike detected: ${metric.latencyMs}ms (Baseline: ${this.getMean(this.latencyHistory).toFixed(0)}ms)`,
                suggestedAction: 'Check Cloud Run concurrency or downstream database latency.'
            };
        }

        // Check Error Rate Burst
        if (metric.errorRate > 0.05) { // Fixed threshold > 5%
            return {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                type: 'error_rate',
                severity: 'critical',
                message: `High Error Rate detected: ${(metric.errorRate * 100).toFixed(1)}%`,
                suggestedAction: 'Rollback to previous version immediately.'
            };
        }

        return null; // No anomaly
    }

    private updateHistory(arr: number[], val: number) {
        arr.push(val);
        if (arr.length > this.windowSize) arr.shift();
    }

    private detectSpike(arr: number[], current: number): boolean {
        if (arr.length < 10) return false;
        const mean = this.getMean(arr);
        const std = this.getStdDev(arr, mean);

        const zScore = (current - mean) / (std || 1);
        return zScore > 3; // 3 Sigma Rule
    }

    private getMean(arr: number[]): number {
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    private getStdDev(arr: number[], mean: number): number {
        return Math.sqrt(arr.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / arr.length);
    }
}
