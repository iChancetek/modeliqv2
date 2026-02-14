"use client";

import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

interface InsightCardProps {
    insights: string[];
    loading: boolean;
    onInsightClick?: (insight: string) => void;
}

export default function InsightCard({ insights, loading, onInsightClick }: InsightCardProps) {
    return (
        <div className="glass-panel p-6 border-l-4 border-l-purple-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lightbulb className="w-24 h-24 text-purple-500" />
            </div>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="text-purple-400" /> AI Insights
            </h3>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-500" />
                    <p>Analyzing data patterns with GPT-5.2...</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {insights.length > 0 ? (
                        insights.map((insight, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`flex items-start gap-3 p-3 rounded-lg bg-white/5 transition-colors ${onInsightClick ? 'cursor-pointer hover:bg-white/10' : ''}`}
                                onClick={() => onInsightClick && onInsightClick(insight)}
                            >
                                <div className="mt-1">
                                    {insight.toLowerCase().includes("warning") ? (
                                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {insight.replace(/^- /, "")}
                                </p>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic">No insights generated yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
