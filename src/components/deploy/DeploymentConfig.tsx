"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Cloud, Cpu, Globe, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CLOUD_PROVIDERS = [
    { id: 'aws', name: 'AWS', icon: Cloud, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'gcp', name: 'Google Cloud', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'azure', name: 'Azure', icon: Server, color: 'text-blue-600', bg: 'bg-blue-600/10' },
];

const COMPUTE_TYPES = [
    { id: 'serverless', name: 'Serverless', desc: 'Auto-scaling, Pay-per-use', icon: Zap },
    { id: 'k8s', name: 'Kubernetes', desc: 'High Availability Cluster', icon: Server },
    { id: 'vm', name: 'Virtual Machine', desc: 'Dedicated Instance', icon: Cpu },
];

export default function DeploymentConfig() {
    const [selectedCloud, setSelectedCloud] = useState<string | null>(null);
    const [selectedCompute, setSelectedCompute] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const handleDeploy = async () => {
        setIsGenerating(true);
        setLogs(["Initializing GenAI Deployment Agent...", "Analyzing Model requirements..."]);

        // Mocking the agent workflow for now
        await new Promise(r => setTimeout(r, 1000));
        setLogs(prev => [...prev, `Selected Target: ${selectedCloud?.toUpperCase()} (${selectedCompute})`]);

        await new Promise(r => setTimeout(r, 1500));
        setLogs(prev => [...prev, "Generating Dockerfile (PackagingAgent)...", "Generating Terraform modules (InfraAgent)..."]);

        await new Promise(r => setTimeout(r, 1500));
        setLogs(prev => [...prev, "Provisioning Resources...", "Deployment Successful! 🚀"]);
        setIsGenerating(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Configuration Section */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Cloud className="w-4 h-4 text-primary" /> Target Cloud
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {CLOUD_PROVIDERS.map((cloud) => (
                                <button
                                    key={cloud.id}
                                    onClick={() => setSelectedCloud(cloud.id)}
                                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${selectedCloud === cloud.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-white/5 bg-black/20 hover:border-white/20'
                                        }`}
                                >
                                    <cloud.icon className={`w-8 h-8 ${cloud.color}`} />
                                    <span className="text-sm font-medium">{cloud.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-primary" /> Compute Strategy
                        </h3>
                        <div className="space-y-2">
                            {COMPUTE_TYPES.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedCompute(type.id)}
                                    className={`w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-all ${selectedCompute === type.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-white/5 bg-black/20 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`p-2 rounded-md ${selectedCompute === type.id ? 'bg-primary/20' : 'bg-white/5'}`}>
                                        <type.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm">{type.name}</div>
                                        <div className="text-xs text-muted-foreground">{type.desc}</div>
                                    </div>
                                    {selectedCompute === type.id && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        size="lg"
                        disabled={!selectedCloud || !selectedCompute || isGenerating}
                        onClick={handleDeploy}
                    >
                        {isGenerating ? "Deploying..." : "Launch Deployment"}
                    </Button>
                </div>

                {/* Status / Logs Section */}
                <Card className="bg-black/40 border-white/10 p-6 font-mono text-sm overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b border-white/5 pb-2">
                        <ShieldCheck className="w-4 h-4" /> Deployment Log
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto min-h-[300px]">
                        {logs.length === 0 && (
                            <div className="text-center text-muted-foreground py-10 opacity-50">
                                Waiting to start deployment...
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-2"
                            >
                                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                                <span className={log.includes("Successful") ? "text-green-400 font-bold" : "text-gray-300"}>
                                    {log}
                                </span>
                            </motion.div>
                        ))}
                        {isGenerating && (
                            <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="h-4 w-2 bg-primary ml-1"
                            />
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
