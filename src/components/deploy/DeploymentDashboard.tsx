"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Server, Activity, GitBranch, RefreshCw, ShieldCheck, Box, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Placeholder components - will be implemented individually next
const ValidationGate = () => <div className="p-4 text-gray-400">Validation Gate: Checking Model Metrics against SLA...</div>;
const DeploymentConfig = () => <div className="p-4 text-gray-400">Deployment Config: Cloud Selection & Packaging...</div>;
const DriftMonitor = () => <div className="p-4 text-gray-400">Drift Monitor: Tracking Prediction Latency & Data Drift...</div>;
const RetrainingTrigger = () => <div className="p-4 text-gray-400">Retraining: Auto-trigger configuration...</div>;

const TABS = [
    { id: 'validate', label: '4. Validate', icon: ShieldCheck },
    { id: 'deploy', label: '5. Deploy (CI/CD)', icon: Box },
    { id: 'monitor', label: '6. Monitor', icon: Activity },
    { id: 'retrain', label: '7. Retrain', icon: RefreshCw },
];

export default function DeploymentDashboard() {
    const [activeTab, setActiveTab] = useState('validate');

    return (
        <div className="w-full h-full p-6 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/studio">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
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
            <div className="flex gap-2 border-b border-white/10 pb-1">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors relative ${activeTab === tab.id ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'
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
                    {activeTab === 'validate' && <ValidationGate />}
                    {activeTab === 'deploy' && <DeploymentConfig />}
                    {activeTab === 'monitor' && <DriftMonitor />}
                    {activeTab === 'retrain' && <RetrainingTrigger />}
                </div>
            </div>
        </div>
    );
}
