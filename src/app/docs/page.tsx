"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book,
    Code,
    Terminal,
    Cpu,
    Zap,

    Layout,
    GitBranch,
    Shield,
    Database,
    Search,
    Menu,
    ChevronRight,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// --- Documentation Content Data ---

type DocSection = {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
};

const DOC_SECTIONS: DocSection[] = [
    {
        id: 'overview',
        title: 'Platform Overview',
        icon: <Layout className="w-4 h-4" />,
        content: (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <header className="mb-8 border-b border-white/10 pb-8">
                    <h1 className="text-4xl font-bold mb-4">ModelIQ Architecture</h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        A comprehensive guide to the ChanceTEK next-generation AI workbench.
                    </p>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        ModelIQ is an enterprise-grade MLOps platform designed to unify the entire machine learning lifecycle—from data exploration and autonomous model engineering to one-click deployment and real-time monitoring.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Built on a <span className="text-primary font-medium">serverless architecture</span>, it leverages the power of genetic algorithms for AutoML and the latest GPT-5.2 models for generative code intelligence.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <div className="p-3 bg-purple-500/10 w-fit rounded-lg mb-4">
                            <Cpu className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">The Studio</h3>
                        <p className="text-sm text-muted-foreground">
                            Interactive environment for data analysis, featuring automated insight generation and visualization discovery.
                        </p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                        <div className="p-3 bg-blue-500/10 w-fit rounded-lg mb-4">
                            <GitBranch className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">AutoML Pipeline</h3>
                        <p className="text-sm text-muted-foreground">
                            Distributed genetic algorithms that search through thousands of neural architectures to find the optimal model.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'studio',
        title: 'Studio & Notebooks',
        icon: <Terminal className="w-4 h-4" />,
        content: (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <header className="mb-8 border-b border-white/10 pb-8">
                    <h1 className="text-3xl font-bold mb-4">Studio Environment</h1>
                    <p className="text-muted-foreground">
                        The central command center for your data science workflows.
                    </p>
                </header>

                <section className="space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Smart Upload</h3>
                        <p className="text-muted-foreground mb-4">
                            The Studio accepts CSV, JSON, and Parquet files. Upon upload, the <code className="bg-black/30 px-2 py-1 rounded text-xs border border-white/10">InsightEngine</code> automatically:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>Profiles column distributions and data types.</li>
                            <li>Detects anomalies and missing values.</li>
                            <li>Generates executive summaries using LLM context.</li>
                        </ul>
                    </div>

                    <div className="p-6 bg-black/40 rounded-xl border border-white/10 font-mono text-sm overflow-x-auto">
                        <div className="flex items-center gap-2 mb-4 text-muted-foreground border-b border-white/5 pb-2">
                            <Terminal className="w-4 h-4" />
                            <span>Exploration View State</span>
                        </div>
                        <p className="text-green-400">
                            {`{
  "vizType": "scatter",
  "selectedColumn": "revenue",
  "selectedX": "marketing_spend",
  "selectedY": "revenue",
  "filters": []
}`}
                        </p>
                    </div>
                </section>
            </div>
        )
    },
    {
        id: 'pipeline',
        title: 'AutoML Pipeline',
        icon: <Zap className="w-4 h-4" />,
        content: (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <header className="mb-8 border-b border-white/10 pb-8">
                    <h1 className="text-3xl font-bold mb-4">The Pipeline</h1>
                    <p className="text-muted-foreground">
                        Configure and execute automated machine learning experiments.
                    </p>
                </header>

                <section className="space-y-6">
                    <div className="prose prose-invert max-w-none">
                        <p>
                            The Pipeline Wizard guides you through 4 stages:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground bg-white/5 p-6 rounded-xl border border-white/10">
                            <li><strong>Data Selection:</strong> Choose pre-processed datasets or upload new ones.</li>
                            <li><strong>Target Definition:</strong> Select your target variable and problem type (Regression/Classification).</li>
                            <li><strong>Resource Allocation:</strong> Define compute budget (vCPUs, Memory) and timeout constraints.</li>
                            <li><strong>Execution:</strong> Launch the distributed search.</li>
                        </ol>
                    </div>
                </section>
            </div>
        )
    },
    {
        id: 'deploy',
        title: 'Deployment & Ops',
        icon: <Shield className="w-4 h-4" />,
        content: (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <header className="mb-8 border-b border-white/10 pb-8">
                    <h1 className="text-3xl font-bold mb-4">Deployment & Validation</h1>
                    <p className="text-muted-foreground">
                        From artifact to production endpoint in one click.
                    </p>
                </header>

                <section className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Validation Gates</h3>
                        <p className="text-muted-foreground mb-4">
                            Before deployment, every model must pass the <code className="bg-black/30 px-2 py-1 rounded text-xs border border-white/10">ValidationGate</code>.
                            This component runs a battery of tests against a holdout dataset to ensure performance stability.
                        </p>
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                            <h4 className="text-red-400 font-semibold mb-1 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Security Context
                            </h4>
                            <p className="text-sm text-red-200/70">
                                Models are containerized in isolated runtimes. Changing the <code className="text-xs">NEXT_PUBLIC_API_URL</code> without re-validation will trigger a security halt.
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-4">Inference API</h3>
                        <p className="text-muted-foreground mb-4">
                            Deployed models expose a standardized REST API.
                        </p>
                        <div className="bg-black rounded-lg p-4 border border-white/10 font-mono text-sm">
                            <p className="text-purple-400">POST <span className="text-white">/api/v1/predict</span></p>
                            <p className="text-gray-500 mt-2">// Headers</p>
                            <p className="text-blue-300">Authorization: Bearer &lt;API_KEY&gt;</p>
                            <p className="text-gray-500 mt-2">// Body</p>
                            <p className="text-green-300">
                                {`{
  "model_id": "xgb_v2_production",
  "features": {
    "age": 25,
    "salary": 50000
  }
}`}
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        )
    },
    {
        id: 'agents',
        title: 'Agentic System',
        icon: <Cpu className="w-4 h-4" />,
        content: (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <header className="mb-8 border-b border-white/10 pb-8">
                    <h1 className="text-3xl font-bold mb-4">Agentic Architecture</h1>
                    <p className="text-muted-foreground">
                        Understanding the autonomous agents powering the platform.
                    </p>
                </header>

                <section className="space-y-6">
                    <p className="text-muted-foreground">
                        ModelIQ utilizes a multi-agent system orchestrator. Each agent specializes in a specific domain of the MLOps lifecycle.
                    </p>

                    <div className="grid gap-4">
                        {[
                            { name: "DeployerAgent", role: "Infrastructure", desc: "Manages Cloud Run services and Firebase allocations." },
                            { name: "ValidatorAgent", role: "Quality Assurance", desc: "Runs performance regression tests on new model candidates." },
                            { name: "InsightAgent", role: "Data Science", desc: "Generates natural language summaries of complex datasets." }
                        ].map(agent => (
                            <div key={agent.name} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors">
                                <div className="p-2 bg-primary/20 rounded-lg">
                                    <Cpu className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{agent.name}</h4>
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2 inline-block">{agent.role}</span>
                                    <p className="text-sm text-gray-400">{agent.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        )
    }
];

export default function DocsPage() {
    const [activeSection, setActiveSection] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const activeContent = DOC_SECTIONS.find(s => s.id === activeSection) || DOC_SECTIONS[0];

    return (
        <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
            {/* Sidebar Navigation */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-[#050510] border-r border-white/5 flex flex-col pt-20
                transform transition-transform duration-300 md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Documentation</h2>
                    <nav className="space-y-1">
                        {DOC_SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => {
                                    setActiveSection(section.id);
                                    setIsMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                                    ${activeSection === section.id
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                `}
                            >
                                {section.icon}
                                {section.title}
                                {activeSection === section.id && (
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-white/5">
                        <h4 className="text-sm font-semibold text-white mb-2">Need Help?</h4>
                        <p className="text-xs text-gray-400 mb-3">
                            Can't find what you're looking for? Contact our support agents.
                        </p>
                        <Button variant="secondary" size="sm" className="w-full text-xs">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 flex flex-col min-h-screen transition-all duration-300">
                {/* Mobile Header Trigger */}
                <div className="md:hidden flex items-center p-4 border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-16 z-30">
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                    <span className="ml-3 font-semibold">Documentation</span>
                </div>

                {/* Content Render */}
                <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full pt-20">
                    <div className="mb-6 flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-white">Docs</span>
                        <ChevronRight className="w-4 h-4 mx-2" />
                        <span className="text-primary">{activeContent.title}</span>
                    </div>

                    <div className="glass-panel p-8 md:p-12 rounded-3xl min-h-[600px] relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        {/* Dynamic Content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="relative z-10"
                            >
                                {activeContent.content}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-in fade-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
