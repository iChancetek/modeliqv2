"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
    Cpu,
    Zap,
    BarChart3,
    Shield,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
    BrainCircuit,
    Lock
} from 'lucide-react';

export default function LearnMorePage() {
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pt-24 pb-20 overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <header className="text-center mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold mb-8 tracking-tight"
                    >
                        The <span className="text-gradient">Ultimate</span> AI Workbench
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-3xl mx-auto"
                    >
                        Dive deeper into the technologies powering ChanceTEK. From automated neural architecture search to enterprise-grade security.
                    </motion.p>
                </header>

                {/* Feature Deep Dive 1: AutoML */}
                <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="p-3 bg-primary/10 w-fit rounded-xl mb-6 text-primary">
                            <Cpu className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Autonomous Model Engineering</h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Stop wasting hours on hyperparameter tuning. Our AutoML engine tests thousands of combinations in minutes using a distributed genetic algorithm.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Automated Feature Engineering & Selection",
                                "Neural Architecture Search (NAS)",
                                "Ensemble Modeling (Stacking/Blending)",
                                "Explainable AI (SHAP/LIME) Integration"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-panel p-8 rounded-3xl aspect-square flex items-center justify-center relative bg-grid-white"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-50" />
                        <BrainCircuit className="w-48 h-48 text-primary/50 animate-pulse" />
                    </motion.div>
                </section>

                {/* Feature Deep Dive 2: Gen-AI */}
                <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-panel p-8 rounded-3xl aspect-square flex items-center justify-center relative bg-grid-white order-2 lg:order-1"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tl from-accent/20 to-transparent opacity-50" />
                        <Zap className="w-48 h-48 text-accent/50 animate-float" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="order-1 lg:order-2"
                    >
                        <div className="p-3 bg-accent/10 w-fit rounded-xl mb-6 text-accent">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Generative Discovery</h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            We've integrated GPT-5.2 directly into the data pipeline. It doesn't just write code; it understands your data's specific context to generate executive summaries.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Natural Language to SQL Query Generation",
                                "Automatic Flaw Detection & Anomaly Flagging",
                                "Context-Aware Executive Summary Generation",
                                "Zero-Shot Classification capabilities"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </section>

                {/* Feature Deep Dive 3: Security */}
                <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="p-3 bg-emerald-500/10 w-fit rounded-xl mb-6 text-emerald-500">
                            <Shield className="w-8 h-8" />
                        </div>
                        <h2 className="text-4xl font-bold mb-6">Fortress-Grade Security</h2>
                        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                            Your data never leaves your VPC if you don't want it to. We offer full isolation options and are compliant with major enterprise standards.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "SOC 2 Type II Certified",
                                "End-to-End Encryption (AES-256)",
                                "Role-Based Access Control (RBAC)",
                                "Private Cloud (VPC) Peering Options"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-panel p-8 rounded-3xl aspect-square flex items-center justify-center relative bg-grid-white"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-50" />
                        <Lock className="w-48 h-48 text-emerald-500/50" />
                    </motion.div>
                </section>


                {/* FAQ Section */}
                <section className="max-w-3xl mx-auto mb-24">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground">Everything you need to know about the platform.</p>
                    </div>
                    <div className="space-y-4">
                        <FAQItem
                            question="Can I deploy models to my own AWS account?"
                            answer="Yes! ChanceTEK supports Bring Your Own Cloud (BYOC). You can connect your AWS, Azure, or GCP credentials and we will orchestrate the deployment into your VPC."
                        />
                        <FAQItem
                            question="How does the pricing work?"
                            answer="We offer a free tier for individuals and small projects. Enterprise plans are based on compute usage and team size. Check our Pricing page for more details."
                        />
                        <FAQItem
                            question="Is my data used to train your models?"
                            answer="Absolutely not. Your data remains yours. We do not use customer data to train our foundational models. All processing happens in isolated environments."
                        />
                        <FAQItem
                            question="Do you support R?"
                            answer="Currently, our Studio focuses on Python-based workflows (PyTorch, TensorFlow, Scikit-learn). R support is on our roadmap for Q4."
                        />
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="text-center">
                    <Link href="/login">
                        <Button size="lg" variant="elite" className="text-lg px-12 h-16 rounded-full glow-primary">
                            Start Your Free Trial
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </section>
            </div>
        </div>
    );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="glass-panel rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
                <span className="font-semibold text-lg">{question}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-white/5">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
