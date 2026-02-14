"use client";

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const MOCK_METRICS = [
    { name: 'Accuracy', value: 0.94, threshold: 0.90, status: 'pass' },
    { name: 'F1 Score', value: 0.92, threshold: 0.88, status: 'pass' },
    { name: 'Latency (p95)', value: '45ms', threshold: '50ms', status: 'pass' },
    { name: 'Bias Score', value: 0.02, threshold: 0.05, status: 'pass' },
];

export default function ValidationGate() {
    const [isApproving, setIsApproving] = useState(false);
    const [isApproved, setIsApproved] = useState(false);

    const handleApprove = () => {
        setIsApproving(true);
        setTimeout(() => {
            setIsApproving(false);
            setIsApproved(true);
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-green-400" /> Model Validation Gate
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Verify model performance against production SLAs before deployment.
                    </p>
                </div>
                {!isApproved ? (
                    <div className="flex gap-2">
                        <Button variant="destructive" size="sm">Reject Version</Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            onClick={handleApprove}
                            disabled={isApproving}
                        >
                            {isApproving ? "Verifying Sign-off..." : "Approve for Production"}
                        </Button>
                    </div>
                ) : (
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 font-bold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Approved for Deploy
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_METRICS.map((metric) => (
                    <Card key={metric.name} className="p-4 bg-black/40 border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-300">{metric.name}</span>
                            {metric.status === 'pass' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            )}
                        </div>
                        <div className="flex items-end justify-between mb-2">
                            <span className="text-2xl font-bold text-white">{metric.value}</span>
                            <span className="text-xs text-gray-500">Target: {metric.threshold}</span>
                        </div>
                        {typeof metric.value === 'number' && (
                            <Progress value={metric.value * 100} className="h-1 bg-white/10" />
                        )}
                    </Card>
                ))}
            </div>

            <Card className="p-4 bg-yellow-500/5 border-yellow-500/10">
                <h4 className="flex items-center gap-2 text-yellow-500 font-semibold text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" /> AI Compliance Check
                </h4>
                <p className="text-xs text-gray-400">
                    GenAI analysis detected no PII leakage in the training set. Model robustness score is 98/100.
                    Adversarial attack resistance is rated High.
                </p>
            </Card>
        </div>
    );
}
