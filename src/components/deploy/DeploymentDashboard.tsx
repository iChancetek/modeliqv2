"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Server, Activity, GitBranch, RefreshCw, ShieldCheck, Box, ArrowLeft, Target, Database, Code, Home, MonitorCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

import DeploymentConfig from './DeploymentConfig';
import ValidationGate from './ValidationGate';
import SentinelDashboard from '../sentinel/SentinelDashboard';
import RetrainingTrigger from './RetrainingTrigger';
import { useSearchParams } from 'next/navigation';
import { MLOpsProvider, useMLOps } from './MLOpsContext';
import { ProblemDefinitionStep, DataEngineeringStep, ModelDevelopmentStep } from './LifecycleSteps';

import ModelRegistry from './ModelRegistry';

const TABS = [
    { id: 'define', label: '1. Define', icon: Target },
    { id: 'data', label: '2. Data', icon: Database },
    { id: 'develop', label: '3. Develop', icon: Code },
    { id: 'validate', label: '4. Validate', icon: ShieldCheck },
    { id: 'deploy', label: '5. Deploy', icon: Box },
    { id: 'registry', label: '6. Registry', icon: Server }, // New Tab
    { id: 'monitor', label: '7. Monitor', icon: Activity },
    { id: 'retrain', label: '8. Retrain', icon: RefreshCw },
];

export default function DeploymentDashboard() {
    return (
        <MLOpsProvider>
            <DashboardContent />
        </MLOpsProvider>
    );
}

function DashboardContent() {
    const searchParams = useSearchParams();
    const modelId = searchParams.get('model_id');

    const [activeTab, setActiveTab] = useState('define');
    const { setModel } = useMLOps();

    React.useEffect(() => {
        if (modelId) {
            setActiveTab('deploy');

            // Check for pending model
            // @ts-ignore
            if (window.__PENDING_MODEL__) {
                // @ts-ignore
                const file = window.__PENDING_MODEL__;
                // @ts-ignore
                const metrics = window.__PENDING_METRICS__ || {};

                setModel({
                    name: file.name,
                    version: '1.0.0',
                    format: 'sklearn',
                    sizeBytes: file.size,
                    uploadedAt: new Date(),
                    metrics: metrics
                });

                // Cleanup
                // @ts-ignore
                window.__PENDING_MODEL__ = undefined;
            }
        }
    }, [modelId, setModel]);

    return (
        <div className="w-full h-full p-6 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/studio">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" title="Back to Studio">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" title="Home">
                            <Home className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                            GenAI MLOps Engine
                        </h1>
                        <p className="text-muted-foreground text-sm">Autonomous Deployment & Monitoring Lifecycle</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-mono border border-green-500/30">
                        System Online
                    </span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-1 overflow-x-auto">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="font-mono text-sm">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="glass-panel rounded-xl p-1 min-h-[400px]">
                <div className="bg-black/40 rounded-lg p-6 h-full">
                    {activeTab === 'define' && <ProblemDefinitionStep />}
                    {activeTab === 'data' && <DataEngineeringStep />}
                    {activeTab === 'develop' && <ModelDevelopmentStep />}
                    {activeTab === 'validate' && <ValidationGate status={status} />}
                    {activeTab === 'deploy' && <DeploymentConfig />}
                    {activeTab === 'registry' && <ModelRegistry />}
                    {activeTab === 'monitor' && <SentinelDashboard />}
                    {activeTab === 'retrain' && <RetrainingTrigger />}
                </div>
            </div>
        </div>
    );
}
