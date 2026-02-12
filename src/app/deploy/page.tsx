"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, BrainCircuit, Activity, ArrowRight } from 'lucide-react';

function DeployContent() {
    const searchParams = useSearchParams();
    const modelId = searchParams.get('model_id');

    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [inputs, setInputs] = useState<Record<string, any>>({});
    const [prediction, setPrediction] = useState<any>(null);
    const [predicting, setPredicting] = useState(false);

    useEffect(() => {
        if (modelId) {
            fetchModelDetails();
        }
    }, [modelId]);

    const fetchModelDetails = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/models/${modelId}`);
            if (res.ok) {
                const data = await res.json();
                setMetadata(data);
                // Initialize inputs
                const initialInputs: any = {};
                data.feature_names?.forEach((f: string) => initialInputs[f] = '');
                setInputs(initialInputs);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePredict = async () => {
        setPredicting(true);
        setPrediction(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict/${modelId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: [inputs] }) // array of one record
            });
            const data = await res.json();
            setPrediction(data);
        } catch (e) {
            console.error(e);
        } finally {
            setPredicting(false);
        }
    };

    if (!modelId) return <div className="p-12 text-center">No Model ID provided.</div>;
    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen p-8 text-white max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-600 mb-2">
                    Model Inference
                </h1>
                <p className="text-gray-400 font-mono text-sm">ID: {modelId}</p>
                <div className="flex gap-4 mt-4 text-sm text-gray-500">
                    <span>Target: <strong className="text-white">{metadata?.target_col}</strong></span>
                    <span>Type: <strong className="text-white">{metadata?.problem_type}</strong></span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="glass-panel p-6 space-y-4">
                    <h2 className="font-bold flex items-center gap-2 mb-4">
                        <Activity className="w-4 h-4 text-blue-400" /> Input Features
                    </h2>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {metadata?.feature_names?.map((feature: string) => (
                            <div key={feature}>
                                <label className="text-xs text-gray-500 block mb-1">{feature}</label>
                                <input
                                    className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm text-white focus:border-accent outline-none"
                                    value={inputs[feature]}
                                    onChange={e => setInputs({ ...inputs, [feature]: e.target.value })}
                                    placeholder={`Enter value for ${feature}`}
                                />
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-4" onClick={handlePredict} disabled={predicting}>
                        {predicting ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2 w-4 h-4" />}
                        Run Prediction
                    </Button>
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                    <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
                        {prediction ? (
                            <div className="z-10 animate-in fade-in zoom-in duration-300">
                                <h3 className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Prediction Result</h3>
                                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-300 to-emerald-600 mb-4">
                                    {prediction.prediction?.[0]}
                                </div>
                                {prediction.probabilities && (
                                    <div className="text-xs text-gray-500 font-mono">
                                        Confidence: {JSON.stringify(prediction.probabilities[0])}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-600 z-10">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p>Enter feature values and run prediction to see results.</p>
                            </div>
                        )}

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DeployPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DeployContent />
        </Suspense>
    );
}
