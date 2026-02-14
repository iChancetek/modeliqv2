"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { HealthScoreCard } from './HealthScoreCard';
import { DriftEngine } from '@/lib/sentinel/driftEngine';
import { AnomalyEngine } from '@/lib/sentinel/anomalyEngine';
import { DriftResult, AnomalyAlert, RuntimeMetrics, HealthScore } from '@/lib/sentinel/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

const driftEngine = new DriftEngine();
const anomalyEngine = new AnomalyEngine();

// Simulate Baseline for Drift
driftEngine.setBaseline('feature_x', Array.from({ length: 100 }, () => Math.random() * 100));

export default function SentinelDashboard() {
    const [metrics, setMetrics] = useState<RuntimeMetrics[]>([]);
    const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
    const [drift, setDrift] = useState<DriftResult | null>(null);
    const [isActive, setIsActive] = useState(false);

    // Derived Health Score
    const healthScore: HealthScore = useMemo(() => {
        const lastMetric = metrics[metrics.length - 1];
        if (!lastMetric) return { overall: 100, latencyScore: 100, accuracyScore: 100, driftScore: 100, costEfficiency: 100 };

        const latScore = Math.max(0, 100 - (lastMetric.latencyMs / 200) * 100); // Penalty if > 200ms
        const driftPenalty = drift?.hasDrift ? 30 : 0;
        const errPenalty = lastMetric.errorRate * 500; // 10% error = 50 pt penalty

        const overall = Math.min(100, Math.floor((latScore + (100 - driftPenalty) + (100 - errPenalty)) / 3));

        return {
            overall,
            latencyScore: Math.floor(latScore),
            accuracyScore: Math.floor(100 - errPenalty),
            driftScore: Math.floor(100 - driftPenalty),
            costEfficiency: 95
        };
    }, [metrics, drift]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                const now = Date.now();

                // 1. Ingest Telemetry (Simulated or Real Source)
                const newMetric: RuntimeMetrics = {
                    latencyMs: 50 + Math.random() * 20 + (Math.random() > 0.95 ? 250 : 0), // Occasional spikes
                    throughputRps: 120 + Math.random() * 10,
                    errorRate: Math.random() > 0.98 ? 0.08 : 0.01,
                    cpuUsage: 0.45,
                    memoryUsage: 0.60
                };

                setMetrics(prev => [...prev.slice(-49), { ...newMetric, timestamp: now } as any]);

                // 2. Run Anomaly Detection (Real Logic)
                const alert = anomalyEngine.analyze(newMetric);
                if (alert) {
                    setAlerts(prev => [alert, ...prev].slice(0, 5));
                }

                // 3. Run Drift Detection (Real Logic)
                // Simulate production feature values
                const currentBatch = Array.from({ length: 50 }, () => Math.random() * 100 + (Math.random() > 0.90 ? 50 : 0)); // Slight shift
                const driftResult = driftEngine.detectDrift('feature_x', currentBatch);
                setDrift(driftResult);

            }, 800);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-white/5">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-blue-400" /> Modeliq Sentinel
                    </h1>
                    <p className="text-blue-200/60 mt-1">AI-Native Monitoring & Observability Engine</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant={isActive ? "destructive" : "default"}
                        onClick={() => setIsActive(!isActive)}
                        className="min-w-[150px]"
                    >
                        {isActive ? "Stop Sentinel" : "Start Monitoring"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Health & Alerts */}
                <div className="space-y-6 lg:col-span-1">
                    <HealthScoreCard score={healthScore} />

                    <Card className="bg-black/40 border-white/5 h-[300px]">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-400" /> Live Anomalies
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 overflow-y-auto max-h-[220px]">
                            {alerts.length === 0 && <div className="text-xs text-muted-foreground text-center py-10">No active anomalies.</div>}
                            {alerts.map(alert => (
                                <div key={alert.id} className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs">
                                    <div className="font-bold text-red-300 mb-1 capitalize">{alert.severity} • {alert.type}</div>
                                    <div className="text-gray-300">{alert.message}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Real-Time Charts */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-black/40 border-white/5">
                            <CardHeader className="py-3"><CardTitle className="text-xs font-mono text-gray-400">P99 LATENCY</CardTitle></CardHeader>
                            <CardContent className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics}>
                                        <defs>
                                            <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis stroke="#444" fontSize={10} />
                                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                                        <Area type="monotone" dataKey="latencyMs" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorLat)" isAnimationActive={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/40 border-white/5">
                            <CardHeader className="py-3"><CardTitle className="text-xs font-mono text-gray-400">THROUGHPUT (RPS)</CardTitle></CardHeader>
                            <CardContent className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={metrics}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis stroke="#444" fontSize={10} domain={['auto', 'auto']} />
                                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                                        <Line type="step" dataKey="throughputRps" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-black/40 border-white/5 p-4">
                        <h3 className="text-sm font-bold text-gray-300 mb-2">AI Copilot Insights</h3>
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-300">
                                    <span className="text-blue-400 font-semibold">System Analysis:</span>
                                    {drift?.hasDrift ?
                                        " Drifting detected in 'feature_x'. PSI score is elevated (0.24). Retraining recommended." :
                                        " Model is operating within expected parameters. Latency stability is 98%."}
                                </p>
                                <p className="text-xs text-gray-500">Last analyzed: {new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
