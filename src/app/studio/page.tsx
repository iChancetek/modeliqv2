"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/ui/back-button';
import SmartUpload from '@/components/upload/SmartUpload';
import InsightCard from '@/components/studio/InsightCard';
import ExplorationView from '@/components/studio/ExplorationView';
import FloatingSidebar from '@/components/layout/FloatingSidebar'; // Import the new sidebar
import { Cpu, BarChart3, Cloud, Shield, FileText, ArrowUpRight, Activity, Upload, Settings } from 'lucide-react';

export default function StudioPage() {
    const [insights, setInsights] = useState<string[] | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [config, setConfig] = useState({
        name: 'Untitled Project',
        target: '',
        problemType: 'classification'
    });

    const handleAnalysis = (data: any) => {
        setAnalysisData(data);
        if (data.insights) {
            // Split by newline or bullet points
            const lines = data.insights.split('\n').filter((line: string) => line.trim().length > 0);
            setInsights(lines);
        }

        // Auto-Fill Configuration
        if (data.columns && data.columns.length > 0) {
            const potentialTarget = data.columns[data.columns.length - 1]; // Default to last column

            // Simple heuristic for problem type
            let type = 'classification';
            // heuristic logic...
            if (data.data) {
                const uniqueValues = new Set(data.data.slice(0, 100).map((r: any) => r[potentialTarget])).size;
                if (uniqueValues >= 20) type = 'regression';
            }

            setConfig(prev => ({
                ...prev,
                name: data.filename ? `${data.filename.split('.')[0]} Analysis` : prev.name,
                target: potentialTarget,
                problemType: type
            }));
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Sidebar Integration */}
            <FloatingSidebar />

            <div className="pl-4 md:pl-28 p-8 max-w-[1600px] mx-auto pt-24">
                <div className="mb-4">
                    <BackButton fallbackUrl="/" />
                </div>
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">
                            Welcome back, <span className="text-gradient">Chancellor</span>
                        </h1>
                        <p className="text-muted-foreground">Your AI command center is ready.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/notebooks">
                            <Button variant="outline" className="h-10 border-primary/30 text-primary hover:bg-primary/10">
                                <FileText className="w-4 h-4 mr-2" /> Open Notebooks
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Workspace - 8 cols */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Upload Section */}
                        <section className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
                                <Cloud className="text-primary" /> Start New Project
                            </h2>
                            <SmartUpload onAnalysisComplete={handleAnalysis} />
                        </section>

                        {/* Project Configuration Section */}
                        <section className="glass-panel p-6 rounded-3xl space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Settings className="w-5 h-5 text-primary" /> Project Configuration
                            </h2>

                            <div className="space-y-2">
                                <label htmlFor="projectName" className="text-sm font-medium text-muted-foreground">Project Name</label>
                                <Input
                                    value={config.name}
                                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                    id="projectName"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="targetColumn" className="text-sm font-medium text-muted-foreground">Target Column</label>
                                <select
                                    id="targetColumn"
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-primary transition-colors"
                                    value={config.target}
                                    onChange={(e) => setConfig({ ...config, target: e.target.value })}
                                    disabled={!analysisData}
                                >
                                    {!analysisData && <option value="">Upload data first...</option>}
                                    {analysisData?.columns?.map((col: string) => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="problemType" className="text-sm font-medium text-muted-foreground">Problem Type</label>
                                <select
                                    id="problemType"
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:border-primary transition-colors"
                                    value={config.problemType}
                                    onChange={(e) => setConfig({ ...config, problemType: e.target.value })}
                                >
                                    <option value="classification">Classification</option>
                                    <option value="regression">Regression</option>
                                    <option value="clustering">Clustering</option>
                                </select>
                            </div>
                        </section>

                        {/* AI Insights Display */}
                        {insights && (
                            <div className="animate-in slide-in-from-bottom-5">
                                <InsightCard insights={insights} loading={false} />
                            </div>
                        )}

                        {/* Exploration View */}
                        {analysisData && (
                            <section className="glass-panel p-6 rounded-3xl border-t border-white/10">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <BarChart3 className="text-emerald-500" /> Interactive Exploration
                                </h3>
                                <ExplorationView
                                    filename={analysisData.filename}
                                    columns={analysisData.columns}
                                    data={analysisData.data}
                                />
                            </section>
                        )}
                    </div>

                    {/* Right Panel / Activity - 4 cols */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/pipeline" className="col-span-2">
                                <div className="glass-panel p-5 rounded-2xl hover:bg-accent/5 transition-colors cursor-pointer group border-l-4 border-l-purple-500">
                                    <h3 className="font-bold mb-1 flex items-center gap-2">
                                        <Cpu className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" /> AutoML Pipeline
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Train new model wizard</p>
                                </div>
                            </Link>
                            <Link href="/deploy">
                                <div className="glass-panel p-5 rounded-2xl hover:bg-accent/5 transition-colors cursor-pointer border-l-4 border-l-orange-500">
                                    <h3 className="font-bold mb-1 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-orange-400" /> Deployments
                                    </h3>
                                    <p className="text-xs text-muted-foreground">Manage endpoints</p>
                                </div>
                            </Link>
                            <Link href="/reports">
                                <div className="glass-panel p-5 rounded-2xl hover:bg-accent/5 transition-colors cursor-pointer border-l-4 border-l-emerald-500">
                                    <h3 className="font-bold mb-1 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-emerald-400" /> Metrics
                                    </h3>
                                    <p className="text-xs text-muted-foreground">View performance</p>
                                </div>
                            </Link>
                        </div>

                        {/* Recent Activity Feed */}
                        <div className="glass-panel p-6 rounded-3xl h-full min-h-[300px]">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" /> Live Activity
                            </h3>
                            <div className="space-y-6 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />

                                {/* Items */}
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-background" />
                                    <p className="text-sm font-medium">Model "XGB_v2" training completed</p>
                                    <span className="text-xs text-muted-foreground">2 minutes ago</span>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-background" />
                                    <p className="text-sm font-medium">New dataset "titanic.csv" uploaded</p>
                                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                                </div>
                                <div className="relative pl-6 opacity-60">
                                    <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-gray-500 ring-4 ring-background" />
                                    <p className="text-sm font-medium">System maintenance scheduled</p>
                                    <span className="text-xs text-muted-foreground">Yesterday</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
