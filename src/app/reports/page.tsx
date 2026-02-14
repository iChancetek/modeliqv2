"use client";

import React, { useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { BarChart3, TrendingUp, Clock, Zap, AlertCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DeploymentMetrics {
    modelName: string;
    status: string;
    progress: number;
    endpoint?: string;
    createdAt: any;
}

interface TelemetryData {
    modelId: string;
    metrics: {
        latencyMs: number;
        throughputRps: number;
        errorRate: number;
    };
    timestamp: number;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function ReportsPage() {
    const [deployments, setDeployments] = useState<DeploymentMetrics[]>([]);
    const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Subscribe to deployments
        const deploymentsQuery = query(
            collection(db, 'deployments'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubDeployments = onSnapshot(deploymentsQuery, (snapshot) => {
            const data: DeploymentMetrics[] = [];
            snapshot.forEach((doc) => {
                data.push({ ...doc.data() } as DeploymentMetrics);
            });
            setDeployments(data);
        });

        // Subscribe to telemetry
        const telemetryQuery = query(
            collection(db, 'model_telemetry'),
            orderBy('ingested_at', 'desc'),
            limit(100)
        );

        const unsubTelemetry = onSnapshot(telemetryQuery, (snapshot) => {
            const data: TelemetryData[] = [];
            snapshot.forEach((doc) => {
                const docData = doc.data();
                data.push({
                    modelId: docData.modelId,
                    metrics: docData.metrics,
                    timestamp: docData.ingested_at
                } as TelemetryData);
            });
            setTelemetry(data);
            setLoading(false);
        });

        return () => {
            unsubDeployments();
            unsubTelemetry();
        };
    }, []);

    // Aggregate metrics by model
    const modelPerformance = telemetry.reduce((acc, t) => {
        if (!acc[t.modelId]) {
            acc[t.modelId] = {
                name: t.modelId,
                avgLatency: 0,
                avgThroughput: 0,
                errorRate: 0,
                count: 0
            };
        }
        acc[t.modelId].avgLatency += t.metrics.latencyMs;
        acc[t.modelId].avgThroughput += t.metrics.throughputRps;
        acc[t.modelId].errorRate += t.metrics.errorRate;
        acc[t.modelId].count += 1;
        return acc;
    }, {} as Record<string, any>);

    const performanceData = Object.values(modelPerformance).map((m: any) => ({
        name: m.name,
        avgLatency: (m.avgLatency / m.count).toFixed(2),
        avgThroughput: (m.avgThroughput / m.count).toFixed(2),
        errorRate: ((m.errorRate / m.count) * 100).toFixed(2)
    }));

    // Deployment status distribution
    const statusDistribution = deployments.reduce((acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    // Latency over time (last 50 points)
    const latencyOverTime = telemetry.slice(0, 50).reverse().map((t, idx) => ({
        index: idx,
        latency: t.metrics.latencyMs,
        model: t.modelId
    }));

    return (
        <div className="min-h-screen p-8 text-white">
            <div className="mb-6">
                <BackButton fallbackUrl="/studio" />
            </div>

            <header className="mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                    Elite Reporting
                </h1>
                <p className="text-gray-400 mt-2">Real-time model performance and deployment insights.</p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            ) : telemetry.length === 0 && deployments.length === 0 ? (
                <Card className="bg-yellow-900/10 border-yellow-500/20">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-yellow-300 mb-2">No Data Available</h3>
                        <p className="text-yellow-200/70 mb-4">
                            Deploy a model and generate telemetry to see performance reports.
                        </p>
                        <p className="text-sm text-yellow-200/50">
                            Go to <strong>Deploy</strong> → Upload and deploy a model → Monitor telemetry in <strong>Sentinel</strong>
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-black/40 border-white/5">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Total Deployments</p>
                                        <p className="text-2xl font-bold">{deployments.length}</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-purple-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/40 border-white/5">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Active Models</p>
                                        <p className="text-2xl font-bold">{deployments.filter(d => d.status === 'active').length}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/40 border-white/5">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Telemetry Points</p>
                                        <p className="text-2xl font-bold">{telemetry.length}</p>
                                    </div>
                                    <Zap className="w-8 h-8 text-blue-400" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/40 border-white/5">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Avg Latency</p>
                                        <p className="text-2xl font-bold">
                                            {telemetry.length > 0
                                                ? (telemetry.reduce((sum, t) => sum + t.metrics.latencyMs, 0) / telemetry.length).toFixed(0)
                                                : '0'
                                            }ms
                                        </p>
                                    </div>
                                    <Clock className="w-8 h-8 text-orange-400" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Model Latency Comparison */}
                        {performanceData.length > 0 && (
                            <Card className="bg-black/40 border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-sm">Average Latency by Model (ms)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={performanceData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="name" stroke="#666" fontSize={11} />
                                            <YAxis stroke="#666" fontSize={11} />
                                            <Tooltip
                                                contentStyle={{ background: '#111', border: '1px solid #333' }}
                                            />
                                            <Bar dataKey="avgLatency" fill="#8b5cf6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Deployment Status Distribution */}
                        {statusData.length > 0 && (
                            <Card className="bg-black/40 border-white/5">
                                <CardHeader>
                                    <CardTitle className="text-sm">Deployment Status Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => entry.name}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#111', border: '1px solid #333' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}

                        {/* Latency Over Time */}
                        {latencyOverTime.length > 0 && (
                            <Card className="bg-black/40 border-white/5 md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-sm">Latency Trend (Last 50 Requests)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={latencyOverTime}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="index" stroke="#666" fontSize={11} />
                                            <YAxis stroke="#666" fontSize={11} />
                                            <Tooltip
                                                contentStyle={{ background: '#111', border: '1px solid #333' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="latency"
                                                stroke="#06b6d4"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
