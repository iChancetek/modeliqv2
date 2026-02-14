"use client";

import React, { useState, useEffect } from 'react';
import { useMLOps } from './MLOpsContext';
import usePyodide from '@/hooks/usePyodide';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Play, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function InferencePanel() {
    const { model, dataset } = useMLOps();
    const { pyodide, isLoading, runPython } = usePyodide();

    const [inputData, setInputData] = useState<string>('{}');
    const [result, setResult] = useState<any>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modelLoaded, setModelLoaded] = useState(false);

    // Initialize default input based on dataset columns if available
    useEffect(() => {
        if (dataset?.columns) {
            const defaultInput: Record<string, number> = {};
            dataset.columns.forEach(col => {
                if (col !== 'target') defaultInput[col] = 0;
            });
            setInputData(JSON.stringify(defaultInput, null, 2));
        }
    }, [dataset]);

    // Load Model into Pyodide when available
    useEffect(() => {
        const loadModel = async () => {
            if (!pyodide || !model?.file) return;

            try {
                // 1. Write file to Pyodide FS
                const buffer = await model.file.arrayBuffer();
                pyodide.FS.writeFile('/model.pkl', new Uint8Array(buffer));

                // 2. Load model in Python
                // Installing joblib just in case, though sklearn usually includes it or uses pickle
                await pyodide.loadPackage(['joblib']);

                await runPython(`
                    import joblib
                    import pandas as pd
                    import json
                    
                    try:
                        global loaded_model
                        loaded_model = joblib.load('/model.pkl')
                        print("Model loaded successfully")
                    except Exception as e:
                        print(f"Error loading model: {e}")
                `);

                setModelLoaded(true);
            } catch (e) {
                console.error("Failed to load model into Pyodide:", e);
                setError("Failed to load model. Ensure it is a valid pickle file.");
            }
        };

        if (pyodide && model?.file && !modelLoaded) {
            loadModel();
        }
    }, [pyodide, model, modelLoaded, runPython]);

    const handleRunInference = async () => {
        if (!modelLoaded) return;
        setIsRunning(true);
        setError(null);
        setResult(null);

        const startTime = performance.now();

        try {
            // 1. Prepare Input
            // Validate JSON
            JSON.parse(inputData);

            // 2. Run Inference in Python
            const pythonCode = `
                import json
                import pandas as pd
                import time
                
                input_json = '${inputData}'
                input_dict = json.loads(input_json)
                
                # Convert to DataFrame (sklearn expects 2D array-like)
                df = pd.DataFrame([input_dict])
                
                start_time = time.time()
                prediction = loaded_model.predict(df)[0]
                
                # Try getting probability if available
                confidence = 1.0
                try:
                    probas = loaded_model.predict_proba(df)[0]
                    confidence = max(probas)
                except:
                    pass
                    
                json.dumps({
                    "prediction": str(prediction),
                    "confidence": float(confidence)
                })
            `;

            const { result: outputJson, error: pyError } = await runPython(pythonCode);

            if (pyError) throw new Error(pyError);

            const output = JSON.parse(outputJson);
            setResult(output);

            const endTime = performance.now();
            const latency = endTime - startTime;

            // 3. Send Telemetry
            await sendTelemetry(latency, JSON.parse(inputData), output);

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsRunning(false);
        }
    };

    const sendTelemetry = async (latency: number, inputs: any, output: any) => {
        if (!model) return;

        try {
            await fetch('/api/telemetry/ingest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelId: model.name,
                    version: model.version,
                    metrics: {
                        latencyMs: latency,
                        throughputRps: 1, // Single request
                        errorRate: 0,
                    },
                    prediction: {
                        inputFeatures: inputs,
                        outputValue: output.prediction,
                        confidence: output.confidence
                    }
                })
            });
        } catch (e) {
            console.error("Failed to send telemetry:", e);
        }
    };

    if (!model) {
        return (
            <div className="p-10 text-center text-gray-500">
                Please upload a model in the "Develop" step first.
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in">
            <Card className="bg-black/40 border-white/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-green-400" />
                        Live Inference Test
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Engine Status:</span>
                        {isLoading ? (
                            <span className="flex items-center gap-1 text-yellow-400">
                                <Loader2 className="w-3 h-3 animate-spin" /> Loading Pyodide...
                            </span>
                        ) : modelLoaded ? (
                            <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle2 className="w-3 h-3" /> Model Loaded
                            </span>
                        ) : (
                            <span className="text-red-400">Not Loaded</span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Area */}
                        <div className="space-y-2">
                            <Label>Input Features (JSON)</Label>
                            <Textarea
                                value={inputData}
                                onChange={e => setInputData(e.target.value)}
                                className="font-mono text-xs h-[200px] bg-black/50 border-white/10"
                            />
                        </div>

                        {/* Result Area */}
                        <div className="space-y-2">
                            <Label>Prediction Result</Label>
                            <div className="h-[200px] rounded-md border border-white/10 bg-black/50 p-4 font-mono text-sm relative">
                                {isRunning && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                                    </div>
                                )}

                                {error ? (
                                    <div className="text-red-400 flex gap-2 items-start">
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-1" />
                                        <div className="break-all">{error}</div>
                                    </div>
                                ) : result ? (
                                    <div className="space-y-2">
                                        <div className="text-gray-400 text-xs">Prediction:</div>
                                        <div className="text-xl text-green-400 font-bold">{result.prediction}</div>

                                        <div className="text-gray-400 text-xs mt-4">Confidence:</div>
                                        <div className="text-blue-400">{(result.confidence * 100).toFixed(1)}%</div>
                                    </div>
                                ) : (
                                    <div className="text-gray-600 italic">Run prediction to see results...</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleRunInference}
                        disabled={!modelLoaded || isRunning || isLoading}
                        className="w-full"
                    >
                        <Play className="w-4 h-4 mr-2" /> Run Prediction
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
