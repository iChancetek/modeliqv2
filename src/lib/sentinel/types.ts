export interface TelemetryPoint {
    timestamp: number;
    modelId: string;
    version: string;
    type: 'ml_model' | 'genai_model' | 'infrastructure' | 'pipeline';
    metrics: RuntimeMetrics;
    prediction?: PredictionData;
    genai?: GenAIMetrics;
    infra?: InfraMetrics;
}

export interface RuntimeMetrics {
    latencyMs: number;
    throughputRps?: number;
    errorRate: number;
    cpuUsage?: number;
    memoryUsage?: number;
}

export interface GenAIMetrics {
    tokenUsage: {
        prompt: number;
        completion: number;
        total: number;
    };
    cost: number;
    hallucinationScore?: number;
    safetyFlags?: string[];
    contextWindowUtilization?: number;
}

export interface InfraMetrics {
    gpuUtil?: number;
    diskIo?: number;
    networkTraffic?: number; // bytes/sec
    containerRestarts?: number;
    activeInstances?: number;
}

export interface PredictionData {
    inputFeatures?: Record<string, number | string>;
    outputValue?: number | string;
    confidence?: number;
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
    resourceId: string; // modelId or infraId
    type: 'latency' | 'error_rate' | 'drift' | 'cost' | 'security' | 'infrastructure';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    suggestedAction: string;
    status: 'open' | 'investigating' | 'resolved';
}

export interface HealthScore {
    overall: number; // 0-100
    latencyScore: number;
    accuracyScore: number;
    driftScore: number;
    costEfficiency: number;
}

