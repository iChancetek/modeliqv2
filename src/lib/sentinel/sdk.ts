import { TelemetryPoint, RuntimeMetrics, PredictionData, GenAIMetrics, InfraMetrics } from './types';

class SentinelSDK {
    private ingestionUrl: string;
    private buffer: TelemetryPoint[] = [];
    private flushInterval: NodeJS.Timeout | null = null;
    private maxBufferSize = 50;
    private flushIntervalMs = 5000;

    constructor() {
        // Safe check for window/client side
        const isClient = typeof window !== 'undefined';
        const baseUrl = isClient ? window.location.origin : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
        this.ingestionUrl = `${baseUrl}/api/sentinel/ingest`;
        this.apiKey = process.env.NEXT_PUBLIC_SENTINEL_INGEST_KEY || ''; // Load key

        this.startAutoFlush();
    }

    private apiKey: string; // Add property

    configure(options: { ingestionUrl?: string, flushIntervalMs?: number, maxBufferSize?: number }) {
        if (options.ingestionUrl) this.ingestionUrl = options.ingestionUrl;
        if (options.flushIntervalMs) this.flushIntervalMs = options.flushIntervalMs;
        if (options.maxBufferSize) this.maxBufferSize = options.maxBufferSize;
        this.restartAutoFlush();
    }

    /**
     * Log a standard ML model prediction
     */
    logModelPrediction(
        modelId: string,
        version: string,
        metrics: RuntimeMetrics,
        prediction?: PredictionData
    ) {
        this.push({
            timestamp: Date.now(),
            modelId,
            version,
            type: 'ml_model',
            metrics,
            prediction
        });
    }

    /**
     * Log a GenAI interaction
     */
    logGenAICompletion(
        modelId: string,
        metrics: RuntimeMetrics,
        genaiMetrics: GenAIMetrics
    ) {
        this.push({
            timestamp: Date.now(),
            modelId,
            version: 'genai-latest',
            type: 'genai_model',
            metrics,
            genai: genaiMetrics
        });
    }

    /**
     * Log Infrastructure metrics
     */
    logInfraMetrics(
        resourceId: string,
        metrics: InfraMetrics,
        cpuUsage: number,
        memoryUsage: number
    ) {
        this.push({
            timestamp: Date.now(),
            modelId: resourceId, // overloading modelId as resourceId
            version: 'infra',
            type: 'infrastructure',
            metrics: {
                latencyMs: 0,
                throughputRps: 0,
                errorRate: 0,
                cpuUsage,
                memoryUsage
            },
            infra: metrics
        });
    }

    private push(point: TelemetryPoint) {
        this.buffer.push(point);
        if (this.buffer.length >= this.maxBufferSize) {
            this.flush();
        }
    }

    private startAutoFlush() {
        if (this.flushInterval) clearInterval(this.flushInterval);
        this.flushInterval = setInterval(() => this.flush(), this.flushIntervalMs);
    }

    private restartAutoFlush() {
        this.startAutoFlush();
    }

    async flush() {
        if (this.buffer.length === 0) return;

        const pointsToSend = [...this.buffer];
        this.buffer = [];

        try {
            // Send sequentially or batch if API supports it. 
            // Current API is single point, so loop. 
            // TODO: Update API to support batch ingestion for efficiency.

            // For now, simple parallelism
            await Promise.all(pointsToSend.map(p => this.sendPoint(p)));
        } catch (error) {
            console.error("Sentinel SDK Flush Error:", error);
            // Retry logic would go here (put back in buffer?)
        }
    }

    private async sendPoint(point: TelemetryPoint) {
        try {
            await fetch(this.ingestionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                },
                body: JSON.stringify(point)
            });
        } catch (e) {
            console.error("Failed to send telemetry:", e);
        }
    }
}

export const Sentinel = new SentinelSDK();
