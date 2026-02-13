"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cpu, Zap, BarChart3, Cloud, Shield, ArrowRight, Code2, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-background text-foreground transition-colors duration-300">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-grid-white [mask-image:linear-gradient(to_bottom,transparent,black,transparent)] opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full animate-pulse" />

        {/* Floating Elements (Decorative) */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 hidden lg:block p-4 glass-panel rounded-2xl"
        >
          <Code2 className="w-8 h-8 text-accent" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/3 right-1/4 hidden lg:block p-4 glass-panel rounded-2xl"
        >
          <Terminal className="w-8 h-8 text-primary" />
        </motion.div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-mono tracking-wider"
          >
            V2.0 NOW LIVE • GEN-AI POWERED
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-tight"
          >
            Build AI Models <br />
            <span className="text-gradient">At Light Speed</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            ChanceTEK is the elite platform for Data Science teams. Automate ETL, verify models with GPT-5, and deploy to any cloud in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" variant="elite" className="w-full sm:w-auto text-lg h-14 px-8 glow-primary">
                Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-input hover:bg-accent hover:text-accent-foreground">
                View Documentation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Architected for <span className="text-gradient">Scale</span>
            </h2>
            <p className="text-muted-foreground text-lg">Everything you need to go from raw data to production AI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Card 1: Large Span */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="md:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="p-3 bg-primary/10 w-fit rounded-xl mb-6 text-primary"><Cpu className="w-8 h-8" /></div>
                  <h3 className="text-2xl font-bold mb-2">AutoML Pipeline</h3>
                  <p className="text-muted-foreground max-w-md">Our 9-step intelligent engine automates model selection, training, and hyperparameter tuning. Just upload data and wait for results.</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-2 w-16 rounded-full bg-primary/30" />
                  <div className="h-2 w-12 rounded-full bg-primary/20" />
                  <div className="h-2 w-24 rounded-full bg-primary/40" />
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-primary/50 transition-colors"
            >
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all" />
              <div className="p-3 bg-accent/10 w-fit rounded-xl mb-6 text-accent"><Zap className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold mb-2">Generative Insights</h3>
              <p className="text-muted-foreground">Leverage GPT-5.2 to automatically discover patterns and generate executive reports.</p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="p-3 bg-emerald-500/10 w-fit rounded-xl mb-6 text-emerald-500"><BarChart3 className="w-8 h-8" /></div>
              <h3 className="text-2xl font-bold mb-2">Advanced Viz</h3>
              <p className="text-muted-foreground">Interactive D3 charts and scientific Seaborn plots for deep data exploration.</p>
            </motion.div>

            {/* Card 4: Large Span */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="md:col-span-2 glass-panel p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background/50 to-transparent" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">One-Click Deploy</h3>
                  <p className="text-muted-foreground max-w-lg">Deploy models to AWS, Azure, or GCP with a single click via our unified interface. No DevOps required.</p>
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <div className="p-4 bg-background/50 rounded-xl border border-white/5 flex items-center gap-3">
                    <Cloud className="w-6 h-6 text-blue-400" />
                    <span className="font-mono text-sm">Deploying to us-east-1...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          className="max-w-4xl mx-auto glass-panel p-16 rounded-[3rem] border border-primary/20 shadow-[0_0_100px_hsl(var(--primary)/0.1)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to upgrade your workflow?</h2>
            <p className="text-muted-foreground mb-10 text-xl max-w-2xl mx-auto">Join 10,000+ data scientists using ChanceTEK to deploy models faster than ever before.</p>
            <Link href="/login">
              <Button size="lg" variant="elite" className="text-lg px-12 h-16 rounded-full glow-primary">Get Started Now</Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
