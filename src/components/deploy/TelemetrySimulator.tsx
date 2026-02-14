"use client";

import React, { useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface Deployment {
    id: string;
    modelName: string;
    status: string;
    hostingTarget?: string;
}

export function TelemetrySimulator() {
    const deploymentsRef = useRef<Deployment[]>([]);

    // 1. Listen for active 'modeliq' deployments
    useEffect(() => {
        const q = query(
            collection(db, 'deployments'),
            where('status', '==', 'active'),
            where('hostingTarget', '==', 'modeliq')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const active: Deployment[] = [];
            snapshot.forEach(doc => {
                active.push({ id: doc.id, ...doc.data() } as Deployment);
            });
            deploymentsRef.current = active;
        });

        return () => unsubscribe();
    }, []);

    // 2. Variable Loop for data generation
    useEffect(() => {
        const interval = setInterval(async () => {
            if (deploymentsRef.current.length === 0) return;

            // Pick a random deployment to simulate traffic for
            const deployment = deploymentsRef.current[Math.floor(Math.random() * deploymentsRef.current.length)];

            await simulateTraffic(deployment);

        }, 3000); // Every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return null; // Headless component
}

async function simulateTraffic(deployment: Deployment) {
    // Generate realistic metrics
    const isAnomaly = Math.random() > 0.95; // 5% chance of anomaly
    const latency = isAnomaly ?
        Math.floor(Math.random() * 800) + 200 : // High latency
        Math.floor(Math.random() * 100) + 20;   // Normal latency

    const throughput = Math.floor(Math.random() * 50) + 10;

    // Simulate feature drift occasionally
    const driftFactor = Math.random() > 0.9 ? 2.0 : 0.0;
    const inputFeature = (Math.random() * 10) + driftFactor;

    const payload = {
        modelId: deployment.modelName,
        version: '1.0.0',
        metrics: {
            latencyMs: latency,
            throughputRps: throughput,
            errorRate: isAnomaly ? 0.1 : 0.0,
            cpuUsage: Math.random() * 0.8,
            memoryUsage: Math.random() * 0.6
        },
        prediction: {
            inputFeatures: { f1: inputFeature, f2: Math.random() },
            outputValue: Math.random() > 0.5 ? "Class A" : "Class B",
            confidence: Math.random() * 0.5 + 0.5
        }
    };

    try {
        await fetch('/api/telemetry/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        // console.log(`Simulated telemetry for ${deployment.modelName}`);
    } catch (e) {
        console.error("Simulation failed", e);
    }
}
