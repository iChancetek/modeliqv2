"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import SmartUpload from '@/components/upload/SmartUpload';
import InsightCard from '@/components/studio/InsightCard';
import ExplorationView from '@/components/studio/ExplorationView';
import { Cpu, BarChart3, Cloud, Shield, FileText } from 'lucide-react';

export default function StudioPage() {
    const [insights, setInsights] = useState<string[] | null>(null);
    const [analysisData, setAnalysisData] = useState<any>(null);

    const handleAnalysis = (data: any) => {
        setAnalysisData(data);
        if (data.insights) {
            // Split by newline or bullet points
            const lines = data.insights.split('\n').filter((line: string) => line.trim().length > 0);
            setInsights(lines);
        }
    };

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            <header className="mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        ChanceTEK Studio
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your datasets, models, and deployments.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/notebooks">
                        <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20">
                            <FileText className="w-4 h-4 mr-2" /> Open Notebooks
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Upload Area */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="glass-panel p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Cloud className="text-blue-400" /> New Project
                        </h2>
                        <SmartUpload onAnalysisComplete={handleAnalysis} />

                        {/* AI Insights Display */}
                        {insights && (
                            <div className="mt-8 animate-in slide-in-from-bottom-5">
                                <InsightCard insights={insights} loading={false} />
                            </div>
                        )}

                        {/* Exploration View */}
                        {analysisData && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <BarChart3 className="text-emerald-400" /> Interactive Exploration
                                </h3>
                                <ExplorationView
                                    filename={analysisData.filename}
                                    columns={analysisData.columns}
                                />
                            </div>
                        )}
                    </section>

                    <section className="grid md:grid-cols-2 gap-4">
                        <Link href="/pipeline">
                            <div className="glass-panel p-6 hover:bg-white/5 transition-colors cursor-pointer border-l-4 border-l-purple-500">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    <Cpu className="text-purple-400" /> AutoML Pipeline
                                </h3>
                                <p className="text-sm text-gray-400">Train new models using our 9-step wizard.</p>
                            </div>
                        </Link>
                        <Link href="/reports">
                            <div className="glass-panel p-6 hover:bg-white/5 transition-colors cursor-pointer border-l-4 border-l-emerald-500">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    <BarChart3 className="text-emerald-400" /> Model Reports
                                </h3>
                                <p className="text-sm text-gray-400">View performance metrics and visualizations.</p>
                            </div>
                        </Link>
                        <Link href="/deploy">
                            <div className="glass-panel p-6 hover:bg-white/5 transition-colors cursor-pointer border-l-4 border-l-orange-500">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    <Shield className="text-orange-400" /> Deployments
                                </h3>
                                <p className="text-sm text-gray-400">Manage cloud endpoints and API keys.</p>
                            </div>
                        </Link>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="glass-panel p-6">
                        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500" />
                                <div>
                                    <p className="text-gray-300">Model "XGB_v2" training completed.</p>
                                    <span className="text-xs text-gray-600">2 mins ago</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-gray-300">New dataset "titanic.csv" uploaded.</p>
                                    <span className="text-xs text-gray-600">1 hour ago</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
