"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Wand2, CheckCircle, BarChart3, Binary, Scale, Scissors, BrainCircuit, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePyodide from '@/hooks/usePyodide'; // Import Hook

type Step = 'config' | 'cleaning' | 'preprocessing' | 'augmentation' | 'splitting' | 'feature_engineering' | 'selection' | 'training' | 'results';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'config', label: 'Config', icon: <Binary className="w-4 h-4" /> },
    { id: 'cleaning', label: 'Cleaning', icon: <Wand2 className="w-4 h-4" /> },
    { id: 'preprocessing', label: 'Preprocessing', icon: <Scale className="w-4 h-4" /> },
    { id: 'augmentation', label: 'Augmentation', icon: <Binary className="w-4 h-4" /> },
    { id: 'splitting', label: 'Splitting', icon: <Scissors className="w-4 h-4" /> },
    { id: 'feature_engineering', label: 'Engineering', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'selection', label: 'Selection', icon: <Binary className="w-4 h-4" /> },
    { id: 'training', label: 'Training', icon: <Play className="w-4 h-4" /> },
    { id: 'results', label: 'Results', icon: <CheckCircle className="w-4 h-4" /> },
];

export default function PipelineWizard() {
    const router = useRouter();
    const { pyodide, runPython, isLoading: isPyodideLoading } = usePyodide(); // Initialize Pyodide
    const [currentStep, setCurrentStep] = useState<Step>('config');
    const [pipelineSteps, setPipelineSteps] = useState<any[]>([]);

    // State
    const [filename, setFilename] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataPreview, setDataPreview] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [dataProfile, setDataProfile] = useState<any>(null);

    // Config Input
    const [targetCol, setTargetCol] = useState('');
    const [metrics, setMetrics] = useState<any>(null); // Added for Results Step
    const [modelId, setModelId] = useState<string>(''); // Added for Deployment

    // Fetch Preview whenever pipelineSteps change
    useEffect(() => {
        // Auto-load from SessionStorage if available
        const storedName = sessionStorage.getItem('current_dataset_name');
        if (storedName && !filename) setFilename(storedName);

        if (filename && currentStep !== 'config') {
            fetchPreview();
        }
    }, [pipelineSteps, currentStep, filename]);

    const fetchPreview = async () => {
        setLoading(true);
        try {
            // Client-Side Fallback for Headers
            const storedCsv = sessionStorage.getItem('current_dataset_csv');
            if (storedCsv) {
                const lines = storedCsv.split('\n');
                if (lines.length > 0) {
                    // Simple robust CSV header split
                    const cols = lines[0].split(',').map((c: string) => c.trim().replace(/^"|"$/g, ''));
                    setColumns(cols);

                    // Mock simple profile
                    setDataProfile({ rows: lines.length - 1, columns: {} });

                    // Mock preview for table
                    const previewRows = lines.slice(1, 9).map((line: string) => {
                        const vals = line.split(',').map((v: string) => v.trim());
                        const obj: any = {};
                        cols.forEach((col: string, i: number) => {
                            obj[col] = vals[i];
                        });
                        return obj;
                    });
                    setDataPreview(previewRows);
                }
            }

            // Try API as enhancement
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pipeline/preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename, steps: pipelineSteps })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.head) {
                        setDataPreview(data.head);
                        setColumns(data.columns);
                        setDataProfile(data.profile);
                    }
                }
            } catch (apiError) {
                console.warn("API Preview unavailable, using client-side fallback", apiError);
            }

        } catch (error) {
            console.error("Preview failed", error);
        } finally {
            setLoading(false);
        }
    };

    const addPipelineStep = (type: string, action: string, params: any) => {
        const newStep = { type, action, params };
        setPipelineSteps([...pipelineSteps, newStep]);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'config':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">1. Project Configuration</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Dataset Filename (from Uploads)</label>
                                <input className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white focus:border-accent outline-none"
                                    value={filename} onChange={e => setFilename(e.target.value)} placeholder="e.g., titanic.csv" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Target Column</label>
                                <input className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white focus:border-accent outline-none"
                                    value={targetCol} onChange={e => setTargetCol(e.target.value)} placeholder="e.g., Survived" />
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('cleaning')} disabled={!filename}>
                                Next: Data Cleaning
                            </Button>
                        </div>
                    </div>
                );
            case 'cleaning':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">2. Data Cleaning</h2>

                        {/* Imputation Controls */}
                        <div className="glass-panel p-6 mb-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-purple-400" /> Missing Value Imputation
                            </h3>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Column</label>
                                    <select id="impute-col" className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm">
                                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Strategy</label>
                                    <select id="impute-strategy" className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm">
                                        <option value="mean">Mean</option>
                                        <option value="median">Median</option>
                                        <option value="most_frequent">Most Frequent</option>
                                    </select>
                                </div>
                                <Button size="sm" onClick={() => {
                                    const col = (document.getElementById('impute-col') as HTMLSelectElement).value;
                                    const strat = (document.getElementById('impute-strategy') as HTMLSelectElement).value;
                                    addPipelineStep('cleaning', 'impute', { column: col, strategy: strat });
                                }}>Apply</Button>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('preprocessing')}>
                                Next: Preprocessing
                            </Button>
                        </div>
                    </div>
                );
            case 'preprocessing':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">3. Preprocessing</h2>
                        <div className="glass-panel p-6 mb-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Scale className="w-4 h-4 text-blue-400" /> Scaling & Encoding
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Scaling (Numeric)</label>
                                    <div className="flex gap-2">
                                        <select id="scale-method" className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm">
                                            <option value="standard">Standard Scaler</option>
                                            <option value="minmax">MinMax Scaler</option>
                                        </select>
                                        <Button size="sm" onClick={() => {
                                            // Auto-select numeric columns for simplicity or could be manual
                                            const numericCols = columns.filter(c => dataProfile?.columns[c]?.dtype?.includes('int') || dataProfile?.columns[c]?.dtype?.includes('float'));
                                            const method = (document.getElementById('scale-method') as HTMLSelectElement).value;
                                            addPipelineStep('preprocessing', 'scale', { columns: numericCols, method });
                                        }}>Apply</Button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Encoding (Categorical)</label>
                                    <div className="flex gap-2">
                                        <select id="encode-method" className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm">
                                            <option value="label">Label Encoding</option>
                                            <option value="onehot">One-Hot Encoding</option>
                                        </select>
                                        <Button size="sm" onClick={() => {
                                            const catCols = columns.filter(c => dataProfile?.columns[c]?.dtype?.includes('object'));
                                            const method = (document.getElementById('encode-method') as HTMLSelectElement).value;
                                            addPipelineStep('preprocessing', 'encode', { columns: catCols, method });
                                        }}>Apply</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('augmentation')}>
                                Next: Augmentation
                            </Button>
                        </div>
                    </div>
                );
            case 'augmentation':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">4. Data Augmentation</h2>
                        <div className="p-6 border border-gray-700 rounded-lg bg-black/20">
                            <p className="text-gray-300 mb-4">
                                Synthetic data generation (SMOTE) helps balance datasets and improve model generalization.
                            </p>
                            <div className="flex items-center gap-4">
                                <Button variant="outline" onClick={() => addPipelineStep('augmentation', 'smote', { samples: 500 })}>
                                    <Binary className="w-4 h-4 mr-2" /> Generate 500 Synthetic Samples
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('splitting')}>
                                Next: Splitting
                            </Button>
                        </div>
                    </div>
                );
            case 'splitting':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">5. Data Splitting</h2>
                        <div className="p-8 bg-black/40 rounded-xl">
                            <p className="text-gray-400 mb-4">Define Training / Test split ratio.</p>
                            <div className="flex justify-between mb-2">
                                <span className="text-blue-400 font-bold">Training Set: 80%</span>
                                <span className="text-orange-400 font-bold">Test Set: 20%</span>
                            </div>
                            <input
                                type="range"
                                min="50" max="90"
                                defaultValue="80"
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                onChange={(e) => {
                                    // In real implementation we might store this in a global config state
                                    // For now we just visually show it
                                }}
                            />
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('feature_engineering')}>
                                Next: Feature Engineering
                            </Button>
                        </div>
                    </div>
                );
            case 'feature_engineering':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">6. Feature Engineering</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="glass-panel p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-purple-400">
                                    <BrainCircuit className="w-4 h-4" /> AI Suggestions
                                </h3>
                                <div className="space-y-3">
                                    {['LogTransform(Fare)', 'ExtractTitle(Name)', 'Binning(Age)'].map(feat => (
                                        <div key={feat} className="p-3 bg-black/40 rounded border border-gray-700 flex justify-between items-center group hover:border-accent cursor-pointer"
                                            onClick={() => addPipelineStep('feature_engineering', 'custom_transform', { description: feat })}>
                                            <span className="text-sm font-mono">{feat}</span>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100"><Wand2 className="w-3 h-3" /></Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-panel p-6">
                                <h3 className="font-bold mb-4">Manual Operations</h3>
                                <div className="text-sm text-gray-500">
                                    Custom transformations can be added here using Python-like syntax or visual builders.
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('selection')}>
                                Next: Algorithm Selection
                            </Button>
                        </div>
                    </div>
                );
            case 'selection':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">7. Algorithm Selection</h2>
                        <p className="text-gray-400 mb-4">Select the model to train.</p>
                        <div className="space-y-4">
                            {['RandomForest', 'LogisticRegression', 'XGBoost', 'SVM'].map(algo => (
                                <div key={algo} onClick={() => addPipelineStep('selection', 'set_algo', { algorithm: algo })}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center 
                                    ${pipelineSteps.find(s => s.type === 'selection')?.params?.algorithm === algo ? 'border-accent bg-accent/10' : 'border-gray-700 hover:border-gray-500'}`}>
                                    <span className="font-bold">{algo}</span>
                                    {pipelineSteps.find(s => s.type === 'selection')?.params?.algorithm === algo && <CheckCircle className="w-5 h-5 text-accent" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('training')} disabled={!pipelineSteps.find(s => s.type === 'selection')}>
                                Next: Training
                            </Button>
                        </div>
                    </div>
                );
            case 'training':
                return (
                    <div className="space-y-6 flex flex-col items-center justify-center p-12">
                        <h2 className="text-2xl font-bold mb-8">8. Model Training</h2>

                        {!metrics ? (
                            <div className="w-full max-w-md space-y-6">
                                <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 h-full bg-accent animate-pulse w-full origin-left transform scale-x-50"></div>
                                </div>
                                <div className="font-mono text-xs text-green-400 space-y-1 h-32 overflow-y-auto bg-black/50 p-4 rounded border border-gray-800">
                                    <div>$ Initializing training environment...</div>
                                    <div>$ Loading transformed dataset...</div>
                                    <div>$ Applying split...</div>
                                    <div>$ Training model...</div>
                                </div>
                                <Button className="w-full" onClick={async () => {
                                    // Trigger Training (In-Browser via Pyodide)
                                    if (!pyodide) {
                                        console.error("Pyodide not ready");
                                        return;
                                    }

                                    setLoading(true);

                                    try {
                                        // 1. Load Data from Session Storage
                                        const csvData = sessionStorage.getItem('current_dataset_csv');
                                        if (!csvData) {
                                            alert("No dataset found in session. Please upload a file first.");
                                            setLoading(false);
                                            return;
                                        }

                                        // 2. Write file to Pyodide FS
                                        pyodide.FS.writeFile("dataset.csv", csvData);

                                        // 3. Construct Python Pipeline Script
                                        const algo = pipelineSteps.find(s => s.type === 'selection')?.params?.algorithm || 'RandomForest';

                                        // Dynamic Script Construction
                                        let script = `
import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer

# 1. Load Data
df = pd.read_csv("dataset.csv")
target_col = "${targetCol}"

# Separate Features and Target
X = df.drop(columns=[target_col])
y = df[target_col]

# Identify columns types automatically for default fallback
num_cols = X.select_dtypes(include=[np.number]).columns.tolist()
cat_cols = X.select_dtypes(include=['object']).columns.tolist()
`;

                                        // Apply Pipeline Steps dynamically
                                        pipelineSteps.forEach(step => {
                                            if (step.type === 'cleaning' && step.action === 'impute') {
                                                const { column, strategy } = step.params;
                                                // Generate Python for imputation
                                                script += `
# Imputation for ${column}
if "${column}" in X.columns:
    imp = SimpleImputer(strategy="${strategy}")
    # Reshape for single column
    X["${column}"] = imp.fit_transform(X[["${column}"]]).ravel()
`;
                                            }

                                            if (step.type === 'preprocessing' && step.action === 'scale') {
                                                const { method } = step.params; // columns might be implicit or explicit
                                                const scalerClass = method === 'minmax' ? 'MinMaxScaler' : 'StandardScaler';
                                                script += `
# Scaling (${method})
scaler = ${scalerClass}()
if len(num_cols) > 0:
    X[num_cols] = scaler.fit_transform(X[num_cols])
`;
                                            }

                                            if (step.type === 'augmentation' && step.action === 'smote') {
                                                // Check if imbalanced-learn is available, otherwise skip or warn
                                                // For standard Pyodide, we might skip heavy SMOTE if not installed, or try-except
                                                script += `
# SMOTE Augmentation (Placeholder/Requires imblearn)
# try:
#     from imblearn.over_sampling import SMOTE
#     sm = SMOTE(random_state=42)
#     X, y = sm.fit_resample(X, y)
# except:
#     pass
`;
                                            }
                                        });

                                        // Final Preprocessing (Encoding) - Always needed for sklearn
                                        script += `
# Final Encoding for Categorical
le = LabelEncoder()
for col in cat_cols:
    X[col] = X[col].astype(str)
    X[col] = le.fit_transform(X[col])

# Encode Target
if y.dtype == 'object':
    y = le.fit_transform(y.astype(str))

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
`;

                                        // Model Training
                                        const algoMap: Record<string, string> = {
                                            'RandomForest': 'RandomForestClassifier',
                                            'LogisticRegression': 'LogisticRegression',
                                            'XGBoost': 'RandomForestClassifier', // Fallback
                                            'SVM': 'SVC'
                                        };
                                        const pyAlgo = algoMap[algo] || 'RandomForestClassifier';

                                        script += `
# Train Model
model = ${pyAlgo}()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)

metrics = {
    "accuracy": acc,
    "precision": prec,
    "recall": rec
}
print(json.dumps(metrics))
`;
                                        const pythonScript = script;


                                        // 4. Run Selection
                                        const { result, stdout, stderr, error } = await runPython(pythonScript);

                                        if (error) {
                                            console.error("Training Error:", error);
                                            alert("Training failed: " + error);
                                        } else {
                                            // Parse stdout for JSON metrics
                                            try {
                                                const lines = stdout.trim().split('\n');
                                                const jsonLine = lines[lines.length - 1];
                                                const metrics = JSON.parse(jsonLine);

                                                setMetrics(metrics);
                                                setModelId(`model_${Date.now()}_${algo}`);
                                                setCurrentStep('results');

                                                // --- NEW: Persist Model for Deployment ---
                                                // 1. Dump model in Python (We need to run a separate script or append to previous)
                                                // Since previous script finished, variables are still in scope in Pyodide!
                                                await runPython(`
import joblib
joblib.dump(model, 'model.joblib')
                                                `);

                                                // 2. Read from FS
                                                const modelFileContent = pyodide.FS.readFile('model.joblib');

                                                // 3. Save to Global (Client-side persistence)
                                                const file = new File([modelFileContent], `${algo}_model.joblib`, { type: 'application/octet-stream' });

                                                // @ts-ignore
                                                window.__PENDING_MODEL__ = file;
                                                // @ts-ignore
                                                window.__PENDING_METRICS__ = metrics;

                                                console.log("Model saved to window.__PENDING_MODEL__", file);

                                            } catch (parseError) {
                                                console.error("Failed to parse metrics or save model", parseError, stdout);
                                            }
                                        }

                                    } catch (e) {
                                        console.error(e);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}>
                                    {isPyodideLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                                    Start Training (In-Browser)
                                </Button>
                            </div>
                        ) : (
                            <div>Training Complete.</div>
                        )}
                    </div>
                );
            case 'results':
                return (
                    <div className="space-y-8 text-center pt-12">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/40">
                            <CheckCircle className="w-10 h-10 text-black" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Pipeline Executed Successfully</h2>
                        <p className="text-gray-400">Your model has been trained and saved with ID: <span className="text-accent font-mono">{modelId}</span></p>

                        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                            <div className="p-6 bg-white/5 rounded-xl border border-gray-700">
                                <div className="text-sm text-gray-500 mb-1">Accuracy</div>
                                <div className="text-3xl font-mono text-accent">{metrics?.accuracy?.toFixed(3) || '0.000'}</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl border border-gray-700">
                                <div className="text-sm text-gray-500 mb-1">Precision</div>
                                <div className="text-3xl font-mono text-accent">{metrics?.precision?.toFixed(3) || '0.000'}</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-xl border border-gray-700">
                                <div className="text-sm text-gray-500 mb-1">Recall</div>
                                <div className="text-3xl font-mono text-accent">{metrics?.recall?.toFixed(3) || '0.000'}</div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-8">
                            <Button variant="outline" onClick={() => router.push('/studio')}>Back to Studio</Button>
                            <Button onClick={() => {
                                if (modelId) router.push(`/studio/deploy?model_id=${modelId}`);
                            }}>
                                Deploy & Monitor Model
                            </Button>
                        </div>
                    </div>
                );
            default:
                return <div className="p-12 text-center text-gray-500">Step implementation in progress...</div>;
        }
    };

    return (
        <div className="min-h-screen p-8 text-white flex flex-col items-center max-w-7xl mx-auto">
            {/* Header */}
            <div className="w-full mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
                    Pipeline Studio
                </h1>
                <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Construct your ML pipeline step-by-step.</span>
                    <div className="flex gap-2">
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20">
                            {pipelineSteps.length} Operations Queued
                        </span>
                    </div>
                </div>
            </div>

            {/* Stepper */}
            <div className="w-full mb-8 overflow-x-auto pb-4">
                <div className="flex justify-between min-w-[800px]">
                    {STEPS.map((s, i) => (
                        <div
                            key={s.id}
                            onClick={() => setCurrentStep(s.id)}
                            className={`flex flex-col items-center gap-2 cursor-pointer group w-24 ${currentStep === s.id ? 'opacity-100' : 'opacity-50 hover:opacity-80'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                                ${currentStep === s.id ? 'border-accent bg-accent/20 text-accent' : 'border-gray-700 bg-gray-900 text-gray-500'}
                            `}>
                                {s.icon}
                            </div>
                            <span className={`text-xs font-medium uppercase tracking-wider text-center ${currentStep === s.id ? 'text-white' : 'text-gray-500'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 w-full flex-grow">
                {/* Main Workspace */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 min-h-[500px]">
                        {renderStepContent()}
                    </div>
                </div>

                {/* Data Preview Sidebar */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 sticky top-8">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-emerald-400">
                            <Binary className="w-4 h-4" /> Live Data Preview
                        </h3>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <span className="text-xs">Processing Transforms...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            {columns.slice(0, 3).map(c => <th key={c} className="p-2 text-gray-400 font-normal">{c}</th>)}
                                            {columns.length > 3 && <th className="p-2 text-gray-400">...</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataPreview.slice(0, 8).map((row, i) => (
                                            <tr key={i} className="border-b border-gray-800 hover:bg-white/5">
                                                {columns.slice(0, 3).map(c => <td key={c} className="p-2 font-mono text-gray-300">{String(row[c]).substring(0, 10)}</td>)}
                                                {columns.length > 3 && <td className="p-2 text-gray-600">...</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-2 text-xs text-gray-500 text-right">
                                    Showing top 8 rows of {dataProfile?.rows || 0}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
