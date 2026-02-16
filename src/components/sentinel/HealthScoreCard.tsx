import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthScore } from '@/lib/sentinel/types';
import { Activity, Zap, ShieldCheck, DollarSign, Loader2 } from 'lucide-react';

interface Props {
    score: HealthScore | null;
}

export function HealthScoreCard({ score }: Props) {
    if (!score) {
        return (
            <Card className="bg-black/40 border-white/5 h-[300px] flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-gray-300">Waiting for Data</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-[200px]">
                    Sentinel is listening for telemetry events...
                </p>
            </Card>
        );
    }

    const getColor = (val: number) => val >= 90 ? 'text-green-400' : val >= 70 ? 'text-yellow-400' : 'text-red-400';
    const getBg = (val: number) => val >= 90 ? 'bg-green-400/10' : val >= 70 ? 'bg-yellow-400/10' : 'bg-red-400/10';

    return (
        <Card className="bg-black/40 border-white/5 h-[300px]">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-300">
                    <Activity className="w-4 h-4 text-purple-400" /> System Health
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="flex flex-col items-center justify-center py-2">
                    <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${getBg(score.overall)} border-current ${getColor(score.overall)}`}>
                        <span className="text-3xl font-bold">{score.overall}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">Overall Score</span>
                </div>

                {/* Granular Metrics */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex justify-between items-center p-2 rounded bg-white/5">
                        <span className="flex items-center gap-1 text-gray-400"><Zap className="w-3 h-3" /> Latency</span>
                        <span className={`font-mono font-bold ${getColor(score.latencyScore)}`}>{score.latencyScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-white/5">
                        <span className="flex items-center gap-1 text-gray-400"><ShieldCheck className="w-3 h-3" /> Quality</span>
                        <span className={`font-mono font-bold ${getColor(score.accuracyScore)}`}>{score.accuracyScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-white/5">
                        <span className="flex items-center gap-1 text-gray-400"><Activity className="w-3 h-3" /> Drift</span>
                        <span className={`font-mono font-bold ${getColor(score.driftScore)}`}>{score.driftScore}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-white/5">
                        <span className="flex items-center gap-1 text-gray-400"><DollarSign className="w-3 h-3" /> Cost</span>
                        <span className={`font-mono font-bold ${getColor(score.costEfficiency)}`}>{score.costEfficiency}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
