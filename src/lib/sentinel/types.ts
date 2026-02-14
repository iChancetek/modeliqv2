export interface TelemetryPoint {
    timestamp: number;
    modelId: string;
    version: string;
    metrics: RuntimeMetrics;
    prediction: PredictionData;
}

export interface RuntimeMetrics {
    latencyMs: number;
    throughputRps: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    tokenUsage?: number; // GenAI specific
}

export interface PredictionData {
    inputFeatures: Record<string, number | string>;
    outputValue: number | string;
    confidence: number;
}

export interface DriftResult {
    featureName: string;
    driftScore: number; // 0-1
    method: 'PSI' | 'KL_Divergence' | 'Wasserstein';
    hasDrift: boolean;
    severity: 'low' | 'medium' | 'high';
}

export interface AnomalyAlert {
    id: string;
    timestamp: number;
    type: 'latency' | 'error_rate' | 'drift' | 'cost';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    suggestedAction: string;
}

export interface HealthScore {
    overall: number; // 0-100
    latencyScore: number;
    accuracyScore: number;
    driftScore: number;
    costEfficiency: number;
}
