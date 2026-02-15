import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sentinel } from '@/lib/sentinel/sdk';
import { Bug, Activity, Zap, AlertTriangle } from 'lucide-react';

export function DebugSimulationPanel() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [scenario, setScenario] = useState<string>('normal');

    const simulate = async (type: 'normal' | 'latency_spike' | 'error_spike' | 'drift') => {
        setScenario(type);
        setIsSimulating(true);

        const pointCount = type === 'drift' ? 50 : 10;

        for (let i = 0; i < pointCount; i++) {
            let latency = 45 + Math.random() * 10;
            let errorRate = 0;
            let outputVal = 0.5 + Math.random() * 0.1;

            if (type === 'latency_spike') latency = 400 + Math.random() * 100;
            if (type === 'error_spike') errorRate = 0.15; // 15% error
            if (type === 'drift') {
                // Drift: shift output distribution over time
                outputVal = 0.8 + Math.random() * 0.1;
            }

            Sentinel.logModelPrediction(
                'model-v1',
                'v1.0.2',
                {
                    latencyMs: latency,
                    errorRate: errorRate,
                    throughputRps: 120,
                    cpuUsage: 0.4,
                    memoryUsage: 512
                },
                {
                    inputFeatures: { f1: Math.random(), f2: Math.random() },
                    outputValue: outputVal,
                    confidence: 0.9
                }
            );

            // Force flush for immediate feedback
            await Sentinel.flush();
            await new Promise(r => setTimeout(r, 200)); // Delay between points
        }

        setIsSimulating(false);
    };

    return (
        <Card className="bg-red-900/10 border-red-500/20 mt-6">
            <CardHeader className="py-2 border-b border-white/5">
                <CardTitle className="text-xs font-mono text-red-400 flex items-center gap-2">
                    <Bug className="w-4 h-4" /> DEBUG: INJECT TELEMETRY
                </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 p-4">
                <Button
                    size="sm" variant="outline"
                    onClick={() => simulate('normal')}
                    disabled={isSimulating}
                    className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                >
                    <Activity className="w-3 h-3 mr-2" />
                    Normal Traffic
                </Button>
                <Button
                    size="sm" variant="outline"
                    onClick={() => simulate('latency_spike')}
                    disabled={isSimulating}
                    className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                >
                    <Zap className="w-3 h-3 mr-2" />
                    Inject Latency
                </Button>
                <Button
                    size="sm" variant="outline"
                    onClick={() => simulate('drift')}
                    disabled={isSimulating}
                    className="bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
                >
                    <Activity className="w-3 h-3 mr-2" />
                    Simulate Drift
                </Button>
                <Button
                    size="sm" variant="outline"
                    onClick={() => simulate('error_spike')}
                    disabled={isSimulating}
                    className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                >
                    <AlertTriangle className="w-3 h-3 mr-2" />
                    Trigger Error
                </Button>
            </CardContent>
        </Card>
    );
}
