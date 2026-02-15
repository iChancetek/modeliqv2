import { NextRequest, NextResponse } from 'next/server';
import { sentinelStorage } from '@/lib/sentinel/storage';
import { TelemetryPoint } from '@/lib/sentinel/types';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Security: Validate API Key
        const apiKey = req.headers.get('x-api-key');
        const validKey = process.env.SENTINEL_INGEST_KEY || process.env.NEXT_PUBLIC_SENTINEL_INGEST_KEY;

        if (!validKey || apiKey !== validKey) {
            return NextResponse.json({ success: false, error: 'Unauthorized: Invalid API Key' }, { status: 401 });
        }

        // Validation (Basic)
        if (!body.modelId || !body.metrics) {
            return NextResponse.json({ success: false, error: 'Invalid Telemetry Payload' }, { status: 400 });
        }

        const point: TelemetryPoint = {
            timestamp: body.timestamp || Date.now(),
            modelId: body.modelId,
            version: body.version || 'unknown',
            type: body.type || 'ml_model',
            metrics: body.metrics,
            prediction: body.prediction,
            genai: body.genai,
            infra: body.infra
        };

        // Async write - Fire and forget for low latency? 
        // For reliability, we await, but ingestion speed might suffer.
        // In prod, use Pub/Sub here. For now, direct DB write.
        await sentinelStorage.writeTelemetry(point);

        return NextResponse.json({ success: true, id: point.timestamp });

    } catch (error: any) {
        console.error('Ingestion Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// OPTIONS method for CORS if needed, though Next.js usually handles this
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}
