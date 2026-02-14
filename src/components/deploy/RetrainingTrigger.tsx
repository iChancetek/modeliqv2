"use client";

import React, { useState } from 'react';
import { RefreshCw, Settings2, History, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function RetrainingTrigger() {
    const [autoRetrain, setAutoRetrain] = useState(true);
    const [isTriggering, setIsTriggering] = useState(false);

    const handleManualRetrain = () => {
        setIsTriggering(true);
        setTimeout(() => setIsTriggering(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-blue-400" /> Continuous Retraining Policy
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Configure when and how GenAI should trigger a new training pipeline.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={handleManualRetrain}
                    disabled={isTriggering}
                >
                    <Play className={`w-4 h-4 mr-2 ${isTriggering ? 'animate-spin' : ''}`} />
                    {isTriggering ? 'Triggering...' : 'Run Pipeline Now'}
                </Button>
            </div>

            <Card className="p-6 bg-black/40 border-white/5 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="space-y-1">
                        <Label htmlFor="auto-retrain" className="text-base font-medium">Automatic Retraining</Label>
                        <p className="text-xs text-muted-foreground">
                            Allow GenAI to start retraining when drift thresholds are exceeded.
                        </p>
                    </div>
                    <Switch
                        id="auto-retrain"
                        checked={autoRetrain}
                        onCheckedChange={setAutoRetrain}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-90">
                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                            <Settings2 className="w-4 h-4" /> Trigger Conditions
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between p-2 rounded bg-white/5">
                                <span>Drift Score &gt; 0.15</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between p-2 rounded bg-white/5">
                                <span>Accuracy Drop &gt; 5%</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between p-2 rounded bg-white/5">
                                <span>Fresh Data Count &gt; 10k rows</span>
                                <span className="text-gray-500">Paused</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                            <History className="w-4 h-4" /> Recent Executions
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between p-2 rounded bg-white/5 border-l-2 border-green-500">
                                <span>v2.1.0 (Auto)</span>
                                <span className="text-gray-400">Today, 04:00 AM</span>
                            </div>
                            <div className="flex justify-between p-2 rounded bg-white/5 border-l-2 border-green-500">
                                <span>v2.0.9 (Manual)</span>
                                <span className="text-gray-400">Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
