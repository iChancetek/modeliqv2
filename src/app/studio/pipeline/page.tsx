"use client";

import React, { useState, useEffect } from 'react';
import usePyodide from '@/hooks/usePyodide';
import SmartUpload from '@/components/upload/SmartUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, Play, ChevronRight, BrainCircuit, Wand2 } from 'lucide-react';

// Pipeline Stages
const STAGES = [
    { id: 'define', title: '1. Define Problem', description: 'Objective & Target Variable' },
    { id: 'collect', title: '2. Collect Data', description: 'Upload & Load CSV' },
    { id: 'preprocess', title: '3. Preprocess', description: 'Clean, Encode & Split' },
    { id: 'train', title: '4. Train Model', description: 'Select Algorithm & Fit' },
    { id: 'evaluate', title: '5. Evaluate', description: 'Metrics & Visualization' },
    { id: 'tune', title: '6. Tune', description: 'Optimize Hyperparameters' },
    { id: 'deploy', title: '7. Deploy', description: 'Export Model' }
];

export default function PipelinePage() {
    const { pyodide, isLoading: isPyodideLoading, runPython } = usePyodide();
    const [currentStage, setCurrentStage] = useState(0);
    const [dataset, setDataset] = useState<any>(null);
    const [generatedCode, setGeneratedCode] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [output, setOutput] = useState("");
    const [pipelineState, setPipelineState] = useState({
        problemType: 'classification',
        targetColumn: '',
        modelType: 'RandomForestClassifier'
    });

    // --- GenAI Helper ---
    const generateStageCode = async () => {
        if (!dataset && currentStage > 1) return alert("Please upload data first.");
        setIsGenerating(true);

        const stageName = STAGES[currentStage].id;
        let prompt = "";

        // Contextual Prompting
        const context = `
            Stage: ${stageName}
            Dataset Columns: ${dataset?.columns?.join(', ') || 'None'}
            Target Column: ${pipelineState.targetColumn}
            Problem Type: ${pipelineState.problemType}
            Model: ${pipelineState.modelType}
        `;

        if (stageName === 'define') {
            prompt = `Analyzing columns: ${dataset?.columns?.join(', ')}. Suggest problem type (classification/regression) and likely target column. Return code to set variables 'problem_type' and 'target_col'.`;
        } else if (stageName === 'collect') {
            prompt = `Assume 'file_content' is available. Write pandas code to load it into 'df' and print head/info.`;
        } else if (stageName === 'preprocess') {
            prompt = `Write code to handle missing values, encode categoricals, and split 'df' into X_train, X_test, y_train, y_test. Target is '${pipelineState.targetColumn}'.`;
        } else if (stageName === 'train') {
            prompt = `Initialize ${pipelineState.modelType} and fit on X_train, y_train.`;
        } else if (stageName === 'evaluate') {
            prompt = `Predict on X_test, calculate accuracy/MSE based on ${pipelineState.problemType}, and print report.`;
        } else if (stageName === 'deploy') {
            prompt = `Use joblib to dump the model to 'model.joblib'.`;
        }

        try {
            const res = await fetch('/api/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, context })
            });
            const data = await res.json();
            if (data.code) setGeneratedCode(data.code);
        } catch (e) {
            console.error(e);
            alert("AI Generation Failed");
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Auto-GenAI Trigger ---
    useEffect(() => {
        // Auto-generate code when entering a new stage (skip stage 0/1 which are manual setup/upload)
        if (currentStage > 1 && !generatedCode && !isGenerating) {
            generateStageCode();
        }
    }, [currentStage]);

    // --- Execution ---
    const executeStage = async () => {
        setIsExecuting(true);
        try {
            // Special handling for Step 2 (Upload) -> In reality, we'd pass the file buffer to Pyodide
            // For this demo, we assume the 'df' is already loaded via the Notebook context or similar.
            // We'll simulate the "Load" by injecting the parsed JSON data from SmartUpload directly.

            if (currentStage === 1 && dataset?.preview) {
                // Inject data directly for Step 2
                await runPython(`
                    import pandas as pd
                    data = ${JSON.stringify(dataset.data.slice(0, 100))} # Inject sample for speed, normally full data
                    df = pd.DataFrame(data)
                    print("Data Loaded Successfully!")
                    print(f"DataFrame Shape: {df.shape}")
                    print(df.info())
                 `);
                setOutput("Data Loaded into DataFrame 'df'.");
            } else {
                const { result, stdout, stderr, error } = await runPython(generatedCode);
                if (error) throw new Error(error);
                setOutput(stdout || result || "Execution Successful");
            }

            // Move to next stage on success
            if (currentStage < STAGES.length - 1) {
                setCurrentStage(prev => prev + 1);
                setGeneratedCode(""); // Clear for next step to trigger auto-gen
            }
        } catch (e: any) {
            alert("Execution Error: " + e.message);
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto flex gap-6">
            {/* Sidebar: Progress */}
            <div className="w-64 shrink-0 space-y-2">
                {STAGES.map((stage, idx) => (
                    <div
                        key={stage.id}
                        className={`p-4 rounded-xl border transition-all ${idx === currentStage
                            ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                            : idx < currentStage
                                ? 'bg-green-500/10 border-green-500/50 text-green-400'
                                : 'bg-black/20 border-white/5 opacity-50'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono opacity-70">STEP {idx + 1}</span>
                            {idx < currentStage && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div className="font-bold">{stage.title}</div>
                        <div className="text-xs opacity-70 mt-1">{stage.description}</div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <BrainCircuit className="w-8 h-8 text-accent animate-pulse" />
                        AI Studio Pipeline
                    </h1>
                    <p className="text-muted-foreground">Generative AI-Driven AutoML Workflow</p>
                </header>

                {/* Stage Interface */}
                <div className="glass-panel p-8 rounded-3xl min-h-[500px] flex flex-col relative">
                    {isPyodideLoading && (
                        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center rounded-3xl">
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                <p>Initializing Python AI Kernel...</p>
                            </div>
                        </div>
                    )}

                    <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">
                        {STAGES[currentStage].title}
                    </h2>

                    {/* Stage Specific UI */}
                    <div className="flex-1">
                        {currentStage === 0 && (
                            <div className="space-y-4 max-w-md">
                                <p>Describe your objective or upload data to auto-detect.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant={pipelineState.problemType === 'classification' ? 'default' : 'outline'}
                                        onClick={() => setPipelineState(p => ({ ...p, problemType: 'classification' }))}
                                    >
                                        Classification
                                    </Button>
                                    <Button
                                        variant={pipelineState.problemType === 'regression' ? 'default' : 'outline'}
                                        onClick={() => setPipelineState(p => ({ ...p, problemType: 'regression' }))}
                                    >
                                        Regression
                                    </Button>
                                </div>
                                <Input
                                    placeholder="Target Column Name (e.g. 'Survived')"
                                    value={pipelineState.targetColumn}
                                    onChange={e => setPipelineState(p => ({ ...p, targetColumn: e.target.value }))}
                                />
                                <Button onClick={() => setCurrentStage(1)} className="w-full">
                                    Next: Upload Data <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        )}

                        {currentStage === 1 && (
                            <div className="space-y-6">
                                <SmartUpload onAnalysisComplete={(res) => {
                                    setDataset(res);
                                    // Auto-advance or allow user to review
                                    if (res.columns) {
                                        setPipelineState(p => ({ ...p, targetColumn: res.columns[res.columns.length - 1] })); // Guess last col
                                    }
                                }} />
                                {dataset && (
                                    <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                                        <p className="font-bold text-green-400">Dataset Loaded: {dataset.filename}</p>
                                        <p className="text-sm opacity-70">{dataset.rowCount} rows, {dataset.columns?.length} columns</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStage > 1 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                {/* Code Editor */}
                                <div className="space-y-2 flex flex-col">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-mono text-muted-foreground">Generated Python Code</span>
                                        <Button size="sm" variant="ghost" className="h-8 text-accent" onClick={generateStageCode} disabled={isGenerating}>
                                            <Wand2 className="w-3 h-3 mr-2" />
                                            {isGenerating ? "Generating..." : "Regenerate AI Code"}
                                        </Button>
                                    </div>
                                    <textarea
                                        className="flex-1 w-full bg-[#0d0d14] p-4 rounded-xl font-mono text-sm text-blue-300 resize-none focus:ring-1 focus:ring-primary/50 min-h-[300px]"
                                        value={generatedCode}
                                        onChange={(e) => setGeneratedCode(e.target.value)}
                                        placeholder="# AI will generate code here..."
                                    />
                                </div>

                                {/* Output Terminal */}
                                <div className="space-y-2 flex flex-col">
                                    <span className="text-sm font-mono text-muted-foreground">Execution Output</span>
                                    <div className="flex-1 bg-black/40 rounded-xl p-4 font-mono text-sm text-gray-400 whitespace-pre-wrap overflow-auto min-h-[300px]">
                                        {output || "// Output will appear here..."}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex justify-end gap-4 border-t border-white/10 pt-6">
                        {currentStage > 1 && (
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform"
                                onClick={executeStage}
                                disabled={isExecuting || !generatedCode}
                            >
                                {isExecuting ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing...</>
                                ) : (
                                    <><Play className="w-4 h-4 mr-2 fill-current" /> Run Step</>
                                )}
                            </Button>
                        )}
                        {currentStage === 1 && dataset && (
                            <Button onClick={executeStage}>
                                Confirm Data & Proceed <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
