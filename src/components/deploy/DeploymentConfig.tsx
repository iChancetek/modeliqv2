"use client";

import React, { useState, useEffect } from 'react';
import { Server, Cloud, Cpu, Globe, CheckCircle2, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DeploymentOrchestrator } from '@/lib/agents/mlops/DeploymentOrchestrator';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useMLOps } from './MLOpsContext';

const CLOUD_PROVIDERS = [
    { id: 'gcp', name: 'GCP', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'aws', name: 'AWS', icon: Cloud, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'azure', name: 'Azure', icon: Cloud, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
];

const COMPUTE_STRATEGIES = [
    { id: 'serverless', name: 'Serverless', icon: Zap, desc: 'Auto-scaling, pay-per-use' },
    { id: 'kubernetes', name: 'Kubernetes', icon: Server, desc: 'Container orchestration' },
    { id: 'vm', name: 'VM', icon: Cpu, desc: 'Dedicated compute instances' },
];

export default function DeploymentConfig() {
    const { model } = useMLOps();
    const [provider, setProvider] = useState('gcp');
    const [compute, setCompute] = useState('serverless');
    const [hostingTarget, setHostingTarget] = useState<'modeliq' | 'external'>('modeliq');
    const [deploymentId, setDeploymentId] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);

    // Subscribe to deployment status
    useEffect(() => {
        if (!deploymentId) return;

        const unsubscribe = onSnapshot(doc(db, 'deployments', deploymentId), (snapshot) => {
            if (snapshot.exists()) {
                setStatus(snapshot.data());
            }
        });

        return () => unsubscribe();
    }, [deploymentId]);

    const handleDeploy = async () => {
        if (!model) {
            alert('Please upload a model in Step 3 first');
            return;
        }

        try {
            // Lazy-load orchestrator only when deploying
            const orchestrator = new DeploymentOrchestrator();
            const id = await orchestrator.deployModel({
                modelName: model.name,
                modelFile: new File([], model.name), // Placeholder
                framework: model.format === 'onnx' ? 'sklearn' : model.format as any,
                cloudProvider: hostingTarget === 'external' ? provider as any : undefined,
                computeStrategy: hostingTarget === 'external' ? compute as any : undefined,
                hostingTarget: hostingTarget,
                metrics: model.metrics
            });

            setDeploymentId(id);
        } catch (error) {
            console.error('Deployment error:', error);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Card className="bg-black/40 border-white/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-400" />
                        Deployment Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Cloud Provider Selection - EMPTY PLACEHOLDER REMOVED */}

                    {/* Hosting Target Selection - DEFAULT to internal */}
                    <div>
                        <h3 className="text-sm font-medium mb-3 text-gray-300">Hosting Target</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setHostingTarget('modeliq')}
                                className={`p-4 rounded-lg border-2 transition-all ${hostingTarget === 'modeliq'
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <Zap className={`w-6 h-6 mx-auto mb-2 ${hostingTarget === 'modeliq' ? 'text-purple-400' : 'text-gray-400'}`} />
                                <p className="text-sm font-medium text-center">Modeliq Platform</p>
                                <p className="text-xs text-center text-gray-500 mt-1">Instant internal hosting</p>
                            </button>

                            <button
                                onClick={() => setHostingTarget('external')}
                                className={`p-4 rounded-lg border-2 transition-all ${hostingTarget === 'external'
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <Cloud className={`w-6 h-6 mx-auto mb-2 ${hostingTarget === 'external' ? 'text-blue-400' : 'text-gray-400'}`} />
                                <p className="text-sm font-medium text-center">External Cloud</p>
                                <p className="text-xs text-center text-gray-500 mt-1">AWS / GCP / Azure</p>
                            </button>
                        </div>
                    </div>

                    {/* Compute Strategy & Cloud Provider - Only show if External */}
                    {hostingTarget === 'external' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <h3 className="text-sm font-medium mb-3 text-gray-300">Cloud Provider</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {CLOUD_PROVIDERS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setProvider(p.id)}
                                            className={`p-4 rounded-lg border-2 transition-all ${provider === p.id
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <p.icon className={`w-6 h-6 mx-auto mb-2 ${provider === p.id ? p.color : 'text-gray-400'}`} />
                                            <p className="text-sm font-medium text-center">{p.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium mb-3 text-gray-300">Compute Strategy</h3>
                                <div className="space-y-2">
                                    {COMPUTE_STRATEGIES.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setCompute(s.id)}
                                            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all ${compute === s.id
                                                ? 'border-purple-500 bg-purple-500/10'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <s.icon className={`w-5 h-5 ${compute === s.id ? 'text-purple-400' : 'text-gray-400'}`} />
                                            <div className="text-left flex-1">
                                                <p className="font-medium text-sm">{s.name}</p>
                                                <p className="text-xs text-muted-foreground">{s.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleDeploy}
                        className="w-full"
                        size="lg"
                        disabled={!model || (status && status.status !== 'failed')}
                    >
                        {status && status.status !== 'failed' ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deploying...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4 mr-2" />
                                Deploy Model
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card >

            {/* Deployment Status */}
            {
                status && (
                    <Card className="bg-black/40 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm flex items-center gap-2">
                                {status.status === 'active' ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : status.status === 'failed' ? (
                                    <ShieldCheck className="w-4 h-4 text-red-400" />
                                ) : (
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                )}
                                Deployment Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Progress Bar */}
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-400 capitalize">{status.status}</span>
                                    <span className="font-mono">{status.progress}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                        style={{ width: `${status.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Logs */}
                            <div className="bg-black/60 rounded p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                                {status.logs?.map((log: string, i: number) => (
                                    <div key={i} className="text-gray-300">
                                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                                    </div>
                                ))}
                            </div>

                            {/* Endpoint */}
                            {status.endpoint && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded">
                                    <p className="text-xs text-gray-400 mb-1">Live Endpoint:</p>
                                    <a
                                        href={status.endpoint}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-mono text-green-400 hover:underline break-all"
                                    >
                                        {status.endpoint}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )
            }
        </div >
    );
}
