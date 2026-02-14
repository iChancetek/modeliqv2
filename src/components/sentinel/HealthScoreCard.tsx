import { Zap, Activity, DollarSign, BrainCircuit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HealthScore } from '@/lib/sentinel/types';

export function HealthScoreCard({ score }: { score: HealthScore }) {
    const getHealthColor = (val: number) => {
        if (val >= 90) return 'text-green-400';
        if (val >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <Card className="bg-black/40 border-white/5 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Overall Health Model</h3>
                    <div className={`text-4xl font-bold font-mono ${getHealthColor(score.overall)}`}>
                        {score.overall}/100
                    </div>
                </div>
                <BrainCircuit className={`w-12 h-12 ${getHealthColor(score.overall)} opacity-20`} />
            </div>

            <div className="space-y-4">
                <ScoreRow label="Latency & Performance" value={score.latencyScore} icon={Zap} />
                <ScoreRow label="Accuracy & Drift" value={score.accuracyScore} icon={Activity} />
                <ScoreRow label="Cost Efficiency" value={score.costEfficiency} icon={DollarSign} />
            </div>
        </Card>
    );
}

function ScoreRow({ label, value, icon: Icon }: { label: string, value: number, icon: any }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="flex items-center gap-2 text-gray-300">
                    <Icon className="w-3 h-3" /> {label}
                </span>
                <span className="font-mono">{value}%</span>
            </div>
            <Progress value={value} className="h-1.5 bg-white/5" />
        </div>
    );
}
