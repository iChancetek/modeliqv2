"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { HealthScoreCard } from './HealthScoreCard';
import { ChatInterface } from './ChatInterface';
import { driftEngine } from '@/lib/sentinel/engines/driftEngine';
import { anomalyEngine } from '@/lib/sentinel/engines/anomalyEngine';
import { DriftResult, AnomalyAlert, TelemetryPoint, HealthScore } from '@/lib/sentinel/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, Database, Zap } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { DebugSimulationPanel } from './DebugSimulationPanel';

export default function SentinelDashboard() {
    const [telemetryPoints, setTelemetryPoints] = useState<TelemetryPoint[]>([]);
    const [alerts, setAlerts] = useState<AnomalyAlert[]>([]);
    const [drift, setDrift] = useState<DriftResult | null>(null);
    const [isListening, setIsListening] = useState(false);

    // Subscribe to Firestore for real telemetry using the new unified collection
    useEffect(() => {
        if (!isListening) return;

        const q = query(
            collection(db, 'sentinel_telemetry'),
            orderBy('ingestedAt', 'desc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const points: TelemetryPoint[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                points.push({
                    timestamp: data.timestamp,
                    modelId: data.modelId,
                    version: data.version,
                    type: data.type,
                    metrics: data.metrics,
                    prediction: data.prediction,
                    genai: data.genai,
                    infra: data.infra
                } as TelemetryPoint);
            });

            // Reverse for charting (oldest -> newest)
            const sortedPoints = points.reverse();
            setTelemetryPoints(sortedPoints);

            // Run anomaly detection on the stream
            if (sortedPoints.length > 0) {
                const newAlerts = anomalyEngine.detectAnomalies(sortedPoints);
                if (newAlerts.length > 0) {
                    setAlerts(prev => [...newAlerts, ...prev].slice(0, 20)); // Keep last 20
                }

                // Run drift detection on latest window
                if (sortedPoints.length >= 20) {
                    const predictionPoints = sortedPoints.filter(p => p.prediction?.outputValue !== undefined);

                    if (predictionPoints.length > 10) {
                        const values = predictionPoints.map(p => Number(p.prediction!.outputValue));
                        if (!values.some(isNaN)) {
                            const baseline = values.slice(0, Math.floor(values.length / 2));
                            const current = values.slice(Math.floor(values.length / 2));

                            const result = driftEngine.detectDrift(baseline, current, 'output_prediction');
                            setDrift(result);
                        }
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [isListening]);

    // Derived Health Score
    const healthScore: HealthScore = useMemo(() => {
        if (telemetryPoints.length === 0) {
            return { overall: 100, latencyScore: 100, accuracyScore: 100, driftScore: 100, costEfficiency: 100 };
        }

        const recentPoints = telemetryPoints.slice(-20);
        const avgLatency = recentPoints.reduce((sum, p) => sum + p.metrics.latencyMs, 0) / recentPoints.length;
        const avgError = recentPoints.reduce((sum, p) => sum + p.metrics.errorRate, 0) / recentPoints.length;

        // Simple Heuristics
        const latScore = Math.max(0, 100 - (avgLatency / 200) * 100); // 200ms baseline
        const driftPenalty = drift?.hasDrift ? (drift.severity === 'high' ? 40 : 20) : 0;
        const errPenalty = avgError * 500; // 5% error = 25 point penalty

        const overall = Math.min(100, Math.floor((latScore + (100 - driftPenalty) + (100 - errPenalty)) / 3));

        return {
            overall,
            latencyScore: Math.floor(latScore),
            accuracyScore: Math.floor(100 - errPenalty),
            driftScore: Math.floor(100 - driftPenalty),
            costEfficiency: 95 // hardcoded for now until cost metrics ingested
        };
    }, [telemetryPoints, drift]);

    return (
        <div className="space-y-6 animate-in fade-in pb-10">
            {/* Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-white/5 shadow-2xl">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-blue-400" /> Modeliq Sentinel X
                    </h1>
                    <p className="text-blue-200/60 mt-1">Autonomous Observability Brain</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 border border-white/10">
                        <Database className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-mono text-gray-300">
                            {telemetryPoints.length} events
                        </span>
                    </div>
                    <Button
                        variant={isListening ? "destructive" : "secondary"}
                        onClick={() => setIsListening(!isListening)}
                        className="min-w-[160px] font-semibold"
                    >
                        {isListening ? (
                            <>
                                <span className="relative flex h-3 w-3 mr-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                Stop Monitoring
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 mr-2" />
                                Start Sentinel
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Empty State */}
            {!isListening && telemetryPoints.length === 0 && (
                <Card className="bg-blue-900/10 border-blue-500/20 p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Sentinel is Offline</h3>
                        <p className="text-gray-400 mb-6">
                            Start monitoring to ingest real-time telemetry from your ML pipelines, models, and infrastructure.
                        </p>
                        <Button
                            onClick={() => setIsListening(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Activate Neural Link
                        </Button>
                    </div>
                </Card>
            )}

            {/* Main Dashboard */}
            {(isListening || telemetryPoints.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Health, Anomalies, Chat (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <HealthScoreCard score={healthScore} />

                        {/* Anomalies Feed */}
                        <Card className="bg-black/40 border-white/5 max-h-[350px] flex flex-col">
                            <CardHeader className="py-3 border-b border-white/5">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-white">
                                    <AlertTriangle className="w-4 h-4 text-orange-400" /> Detected Anomalies
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 overflow-y-auto p-4 flex-1">
                                {alerts.length === 0 && (
                                    <div className="text-xs text-muted-foreground text-center py-10 italic">
                                        System operating within normal parameters.
                                    </div>
                                )}
                                {alerts.map(alert => (
                                    <div key={alert.id} className="p-3 rounded bg-red-900/20 border border-red-500/20 text-xs animate-in slide-in-from-left">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-red-300 capitalize flex items-center gap-1">
                                                {alert.severity === 'critical' && <AlertTriangle className="w-3 h-3" />}
                                                {alert.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-gray-500 text-[10px]">
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div className="text-gray-300 leading-snug">{alert.message}</div>
                                        {alert.suggestedAction && (
                                            <div className="mt-2 text-blue-300 font-mono bg-blue-900/20 p-1 rounded px-2 inline-block">
                                                Suggestion: {alert.suggestedAction}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Copilot Chat */}
                        <ChatInterface />
                    </div>

                    {/* Right Column: Key Metrics (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Charts Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-black/40 border-white/5">
                                <CardHeader className="py-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xs font-mono text-gray-400">P99 LATENCY (ms)</CardTitle>
                                        <Activity className="w-4 h-4 text-purple-500/50" />
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={telemetryPoints.map(p => ({
                                            timestamp: p.timestamp,
                                            latencyMs: p.metrics.latencyMs
                                        }))}>
                                            <defs>
                                                <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                            <XAxis dataKey="timestamp" hide />
                                            <YAxis stroke="#444" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{ background: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="latencyMs"
                                                stroke="#8b5cf6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorLat)"
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card className="bg-black/40 border-white/5">
                                <CardHeader className="py-3">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xs font-mono text-gray-400">DATA DRIFT (PSI)</CardTitle>
                                        <Activity className="w-4 h-4 text-red-500/50" />
                                    </div>
                                </CardHeader>
                                <CardContent className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={telemetryPoints.map((p, i) => ({
                                            timestamp: p.timestamp,
                                            // Simulate visualization track
                                            driftScore: (Math.sin(i * 0.1) + 1) * 0.05 + (drift?.hasDrift ? 0.2 : 0)
                                        }))}>
                                            <defs>
                                                <linearGradient id="colorDrift" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                            <XAxis dataKey="timestamp" hide />
                                            <YAxis stroke="#444" fontSize={10} domain={[0, 0.5]} />
                                            <Tooltip
                                                contentStyle={{ background: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="driftScore"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorDrift)"
                                                isAnimationActive={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Row 2 - GenAI & Infra (Placeholder for now until simulation improves) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-black/40 border-white/5">
                                <CardHeader className="py-3">
                                    <CardTitle className="text-xs font-mono text-gray-400">ERROR RATE (%)</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={telemetryPoints.map(p => ({
                                            timestamp: p.timestamp,
                                            errorRate: p.metrics.errorRate * 100
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                            <XAxis dataKey="timestamp" hide />
                                            <YAxis stroke="#444" fontSize={10} />
                                            <Tooltip
                                                contentStyle={{ background: '#000', border: '1px solid #333' }}
                                                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                            />
                                            <Line type="step" dataKey="errorRate" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card className="bg-black/40 border-white/5">
                                <CardHeader className="py-3">
                                    <CardTitle className="text-xs font-mono text-gray-400">SYSTEM LOAD (CPU)</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={telemetryPoints.map(p => ({
                                            timestamp: p.timestamp,
                                            load: (p.metrics.cpuUsage || 0) * 100
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                                            <XAxis dataKey="timestamp" hide />
                                            <YAxis stroke="#444" fontSize={10} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{ background: '#000', border: '1px solid #333' }}
                                                labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                            />
                                            <Line type="monotone" dataKey="load" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* Developer Tools */}
            <div className="opacity-50 hover:opacity-100 transition-opacity">
                <DebugSimulationPanel />
            </div>
        </div>
    );
}
