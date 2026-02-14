import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        // Validate required fields
        if (!payload.modelId || !payload.version || !payload.metrics) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Store in Firestore
        await addDoc(collection(db, 'model_telemetry'), {
            ...payload,
            timestamp: serverTimestamp(),
            ingested_at: Date.now()
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Telemetry ingestion error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
