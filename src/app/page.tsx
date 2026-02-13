"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cpu, Zap, BarChart3, Cloud, Shield, ArrowRight, Play } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground font-sans">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full" />
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-20 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium tracking-wide text-primary-foreground">ModelIQ 2.0 Now Live</span>
          </div>
        </motion.div>

        {/* Headlines */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-2 text-white"
        >
          Build AI Models
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-8 text-gradient pb-2"
        >
          With Your Voice
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          The world's first <span className="text-primary font-medium">Neural Architecture Search</span> engine controlled by natural language. From data to deployment in seconds.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/login">
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-gray-200 text-lg px-8 h-12 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
              Deploy Now <Zap className="ml-2 w-5 h-5 fill-black" />
            </Button>
          </Link>
          <Link href="/learn-more">
            <Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white/10 text-white text-lg px-8 h-12 backdrop-blur-sm transition-all hover:scale-105">
              View Interactive Demo
            </Button>
          </Link>
        </motion.div>

        {/* Hero Card Visual */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 w-full max-w-4xl glass-panel rounded-t-3xl border-b-0 p-1 bg-gradient-to-b from-white/10 to-transparent"
        >
          <div className="bg-[#0a0a1f] rounded-t-[22px] overflow-hidden border border-white/5 relative min-h-[400px]">
            {/* Mock UI Content */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

            <div className="p-12 flex flex-col items-center justify-center h-full relative z-10">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/20 text-primary mb-8 border border-primary/20">
                <Zap className="w-5 h-5" />
                <span className="font-mono text-sm uppercase tracking-wider">Enterprise ML/MLOps Platform</span>
              </div>

              <h3 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-12">ModelIQ</h3>

              <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Zap className="text-white w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg text-white">ML Auto</h4>
                    <p className="text-xs text-white/50 font-mono">Neural Pipeline</p>
                  </div>
                  <div className="ml-auto px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded uppercase tracking-wider">Fast</div>
                </div>
                <p className="text-sm text-white/60 text-left">Zero-intervention model creation.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
