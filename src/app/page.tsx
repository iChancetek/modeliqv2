"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cpu, Zap, BarChart3, Cloud, Shield, ArrowRight } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Background Grid & Glow */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="inline-block mb-4 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-mono tracking-wider">
            V2.0 NOW LIVE • GEN-AI POWERED
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500 leading-tight"
          >
            Build AI Models <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">At Light Speed</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto mb-12"
          >
            ChanceTEK is the elite platform for Data Science teams. Automate ETL, verify models with GPT-5, and deploy to any cloud in seconds.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" variant="elite" className="w-full sm:w-auto text-lg h-14 px-8">
                Start Building Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 border-gray-700 text-gray-300 hover:text-white hover:bg-white/5">
                View Documentation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-24 px-4 relative z-10 bg-black/50 backdrop-blur-3xl border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              Architected for Scale
            </h2>
            <p className="text-gray-400">Everything you need to go from raw data to production AI.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                key={i}
                className="glass-panel p-8 hover:bg-white/5 transition-all group"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-gradient-to-br ${feature.color} bg-opacity-10`}>
                  <feature.icon className="text-white w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto glass-panel p-12 border border-blue-500/30 shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          <h2 className="text-4xl font-bold mb-6">Ready to upgrade your workflow?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join 10,000+ data scientists using ChanceTEK to deploy models faster.</p>
          <Link href="/login">
            <Button size="lg" variant="elite" className="text-lg px-10 h-14">Get Started Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

const features = [
  { title: "AutoML Pipeline", desc: "Automate model selection, training, and hyperparameter tuning with our intelligent engine.", icon: Cpu, color: "from-blue-500 to-cyan-500" },
  { title: "Generative Insights", desc: "Leverage GPT-5.2 to automatically discover patterns and generate executive reports.", icon: Zap, color: "from-purple-500 to-pink-500" },
  { title: "Advanced Viz", desc: "Interactive D3 charts and scientific Seaborn plots for deep data exploration.", icon: BarChart3, color: "from-emerald-500 to-green-500" },
  { title: "One-Click Deploy", desc: "Deploy models to AWS, Azure, or GCP with a single click via our unified interface.", icon: Cloud, color: "from-orange-500 to-red-500" },
  { title: "Canvas Notebooks", desc: "A Notion-style notebook interface with integrated PySpark and SQL support.", icon: Shield, color: "from-indigo-500 to-blue-500" },
  { title: "Enterprise Security", desc: "SOC2 compliant, SSO, RBAC, and VPC peering for secure model training.", icon: Shield, color: "from-gray-500 to-white" }
];
