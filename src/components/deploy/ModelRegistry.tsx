"use client";

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Box, CheckCircle, Clock, Cloud, Server, AlertTriangle, ExternalLink, Terminal } from 'lucide-react';

interface DeploymentRecord {
    id: string;
    modelName: string;
    status: 'pending' | 'building' | 'deploying' | 'active' | 'failed';
    progress: number;
    logs: string[];
    createdAt: any;
    hostingTarget: 'modeliq' | 'external';
    cloudProvider?: string;
    endpoint?: string;
}

export default function ModelRegistry() {
    const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
    const [selectedDeployment, setSelectedDeployment] = useState<DeploymentRecord | null>(null);

    useEffect(() => {
        const q = query(collection(db, 'deployments'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items: DeploymentRecord[] = [];
            snapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() } as DeploymentRecord);
            });
            setDeployments(items);
            // Auto-select first if none selected
            if (items.length > 0 && !selectedDeployment) {
                setSelectedDeployment(items[0]);
            }
        });
        return () => unsubscribe();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] animate-in fade-in">
            {/* List Column */}
            <Card className="bg-black/40 border-white/5 lg:col-span-1 flex flex-col h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-purple-400" /> Model Registry
                    </CardTitle>
                    <CardDescription>
                        {deployments.length} models managed
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        <div className="space-y-1 p-4">
                            {deployments.map((deploy) => (
                                <div
                                    key={deploy.id}
                                    onClick={() => setSelectedDeployment(deploy)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedDeployment?.id === deploy.id
                                        ? 'bg-purple-500/10 border-purple-500/50'
                                        : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-gray-200">{deploy.modelName}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusColor(deploy.status)}`}>
                                            {deploy.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {deploy.createdAt?.seconds ? new Date(deploy.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                    </div>
                                </div>
                            ))}
                            {deployments.length === 0 && (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    No deployments found. Use the "Deploy" tab to create one.
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Details Column */}
            <Card className="bg-black/40 border-white/5 lg:col-span-2 flex flex-col h-full">
                {selectedDeployment ? (
                    <>
                        <CardHeader className="border-b border-white/5 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl flex items-center gap-2 mb-2">
                                        {selectedDeployment.modelName}
                                        {selectedDeployment.hostingTarget === 'modeliq' ? (
                                            <span className="bg-blue-900/40 text-blue-300 ml-2 px-2 py-0.5 rounded text-xs flex items-center border border-blue-500/30">
                                                <Server className="w-3 h-3 mr-1" /> Modeliq Hosted
                                            </span>
                                        ) : (
                                            <span className="bg-orange-900/40 text-orange-300 ml-2 px-2 py-0.5 rounded text-xs flex items-center border border-orange-500/30">
                                                <Cloud className="w-3 h-3 mr-1" /> {selectedDeployment.cloudProvider || 'External'}
                                            </span>
                                        )}
                                    </CardTitle>
                                    <div className="flex gap-4 text-xs text-gray-400 font-mono">
                                        <span>ID: {selectedDeployment.id}</span>
                                        <span>•</span>
                                        <span>Ver: v{selectedDeployment.id.substring(0, 6)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedDeployment.endpoint && (
                                        <Button size="sm" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                                            <ExternalLink className="w-4 h-4 mr-2" /> Test Endpoint
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">

                            {/* Endpoint Card */}
                            <div className="p-4 rounded-lg bg-black/60 border border-gray-800 font-mono text-xs">
                                <div className="text-gray-500 mb-2 uppercase tracking-wide">Endpoint URL</div>
                                <div className="flex justify-between items-center text-green-300">
                                    {selectedDeployment.endpoint || 'Provisioning endpoint...'}
                                    <Button size="icon" variant="ghost" className="h-6 w-6"><CheckCircle className="w-3 h-3" /></Button>
                                </div>
                            </div>

                            {/* Logs Terminal */}
                            <div className="flex-1 bg-black rounded-lg border border-gray-800 p-4 overflow-hidden flex flex-col">
                                <div className="flex items-center gap-2 text-gray-400 mb-2 text-xs border-b border-gray-800 pb-2">
                                    <Terminal className="w-3 h-3" /> System Logs
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    <div className="space-y-1 font-mono text-xs">
                                        {selectedDeployment.logs?.map((log, i) => (
                                            <div key={i} className="text-gray-300 border-l-2 border-transparent hover:border-blue-500 pl-2">
                                                <span className="text-gray-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                                {log}
                                            </div>
                                        ))}
                                        {selectedDeployment.status === 'active' && (
                                            <div className="text-green-500 font-bold mt-2">
                                                ✨ Service Healthy & Ready
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 flex-col gap-4">
                        <Box className="w-12 h-12 opacity-20" />
                        <p>Select a model to view details</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
