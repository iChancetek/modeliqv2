"use client";

import React from 'react';
import { Activity, BarChart2, Zap, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Mock charts would go here - using simplified visual placeholders for now
const MockChart = ({ color, label }: { color: string, label: string }) => (
    <div className="h-32 w-full flex items-end gap-1 bg-black/20 rounded-md p-2 relative overflow-hidden">
        <div className="absolute top-2 left-2 text-xs font-mono text-muted-foreground">{label}</div>
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className={`w-full rounded-sm ${color} opacity-60 hover:opacity-100 transition-opacity`}
                style={{ height: `${30 + Math.random() * 60}%` }}
            />
        ))}
    </div>
);

export default function DriftMonitor() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-black/40 border-white/5 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Example Request Volume</span>
                    <span className="text-2xl font-bold font-mono">1.2M / day</span>
                    <span className="text-xs text-green-400 flex items-center gap-1">
                        <Activity className="w-3 h-3" /> +12% from last week
                    </span>
                </Card>
                <Card className="p-4 bg-black/40 border-white/5 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Avg Latency (p99)</span>
                    <span className="text-2xl font-bold font-mono text-blue-400">42ms</span>
                    <span className="text-xs text-blue-400/70 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Within SLA (100ms)
                    </span>
                </Card>
                <Card className="p-4 bg-black/40 border-white/5 flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Drift Score</span>
                    <span className="text-2xl font-bold font-mono text-green-400">0.05</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        Threshold: 0.15
                    </span>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-purple-400" /> Feature Drift (Input Distribution)
                    </h4>
                    <MockChart color="bg-purple-500" label="Age Distribution" />
                    <MockChart color="bg-blue-500" label="Income Distribution" />
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-orange-400" /> Prediction Drift (Output Distribution)
                    </h4>
                    <MockChart color="bg-orange-500" label="Class Probability" />

                    <Card className="p-4 bg-red-500/5 border-red-500/10 mt-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <h5 className="text-sm font-bold text-red-300">Anomaly Detected [2 hrs ago]</h5>
                                <p className="text-xs text-muted-foreground">
                                    Sudden spike in "Null" values for feature `transaction_amount`.
                                    GenAI recommends checking the upstream ETL pipeline.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
