"use client";

import React, { useEffect, useState } from 'react';
import { useMLOps } from './MLOpsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, ReferenceLine } from 'recharts';
import { Activity, Zap, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DriftMonitor() {
    const { metrics, addMetric } = useMLOps();
    const [isSimulating, setIsSimulating] = useState(false);

    // Simulation effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSimulating) {
            interval = setInterval(() => {
                const now = Date.now();
                // Simulate latency flux
                addMetric({
                    timestamp: now,
                    name: 'latency',
                    value: 40 + Math.random() * 30 + (Math.random() > 0.9 ? 100 : 0), // Occasional spike
                });
                // Simulate request volume
                addMetric({
                    timestamp: now,
                    name: 'requests',
                    value: Math.floor(100 + Math.random() * 50),
                });
                // Simulate Drift Score (KL Divergence)
                const driftBase = 0.05;
                const driftSpike = Math.random() > 0.95 ? 0.6 : 0; // Rare drift event
                addMetric({
                    timestamp: now,
                    name: 'drift_score',
                    value: driftBase + Math.random() * 0.1 + driftSpike
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSimulating, addMetric]);

    // Prepare data for Recharts
    // We group by timestamp roughly or just take the last N points
    // For simplicity, we filter metrics by name
    const latencyData = metrics.filter(m => m.name === 'latency').slice(-50);
    const requestData = metrics.filter(m => m.name === 'requests').slice(-50);
    const driftData = metrics.filter(m => m.name === 'drift_score').slice(-50);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-400" /> Real-time Observability
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Live metric ingestion using custom time-series store.
                    </p>
                </div>
                <Button
                    variant={isSimulating ? "destructive" : "default"}
                    onClick={() => setIsSimulating(!isSimulating)}
                >
                    {isSimulating ? "Stop Ingestion" : "Start Live Traffic Simulation"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Latency Chart */}
                <Card className="bg-black/40 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" /> P99 Latency (ms)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={latencyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis stroke="#888" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                        labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#fbbf24"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Throughput Chart */}
                <Card className="bg-black/40 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Server className="w-4 h-4 text-green-400" /> Throughput (RPS)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={requestData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis stroke="#888" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                        labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#4ade80"
                                        fill="#4ade80"
                                        fillOpacity={0.2}
                                        isAnimationActive={false}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Drift Chart (KL Divergence) */}
                <Card className="bg-black/40 border-white/5 md:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Activity className="w-4 h-4 text-red-400" /> Feature Drift (KL Divergence)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={driftData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="timestamp" hide />
                                    <YAxis stroke="#888" fontSize={12} domain={[0, 1]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                        labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                                    />
                                    {/* Drift Threshold Limit */}
                                    <ReferenceLine y={0.5} stroke="red" strokeDasharray="3 3" label={{ value: 'Threshold', fill: 'red', fontSize: 10 }} />

                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#f87171"
                                        strokeWidth={2}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
