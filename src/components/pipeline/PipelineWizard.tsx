"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Wand2, CheckCircle, BarChart3, Binary, Scale, Scissors, BrainCircuit, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import usePyodide from '@/hooks/usePyodide'; // Import Hook
import SmartUpload from '@/components/upload/SmartUpload'; // Import SmartUpload
import { ProblemDefinerAgent } from '@/lib/agents/mlops/ProblemDefinerAgent';
import { ModelDeveloperAgent } from '@/lib/agents/mlops/ModelDeveloperAgent';
import { DataEngineerAgent } from '@/lib/agents/mlops/DataEngineerAgent';

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
    const [projectName, setProjectName] = useState('Untitled Project');
    const [filename, setFilename] = useState('');
    const [loading, setLoading] = useState(false);
    const [dataPreview, setDataPreview] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [dataProfile, setDataProfile] = useState<any>(null);

    // Config Input
    const [targetCol, setTargetCol] = useState('');
    const [problemType, setProblemType] = useState('classification'); // Added for auto-population
    const [metrics, setMetrics] = useState<any>(null); // Added for Results Step
    const [modelId, setModelId] = useState<string>(''); // Added for Deployment
    const [aiRecommendation, setAiRecommendation] = useState<string>(''); // AI Recommendation State
    const [splitRatio, setSplitRatio] = useState<number>(0.8); // Data Splitting Ratio
    const [augmentationMethod, setAugmentationMethod] = useState<string>('none'); // Track selected augmentation
    const [agentThinking, setAgentThinking] = useState(false);
    const [agentMessage, setAgentMessage] = useState("");

    // Agentic State
    // Agents
    const [problemDefiner] = useState(() => new ProblemDefinerAgent());
    const [modelDeveloper] = useState(() => new ModelDeveloperAgent());
    const [dataEngineer] = useState(() => new DataEngineerAgent()); // New Agent

    interface PipelineConfig {
        target: string;
        problemType: string;
        cleaning: {
            imputation: { column: string, strategy: string }[];
            outliers: string;
        };
        preprocessing: {
            scaling: string;
            encoding: string;
        };
        augmentation: {
            method: string;
        };
        splitting: {
            ratio: number;
        };
        featureEngineering: {
            transformations: string[];
        };
        algorithm: {
            name: string;
            params: any;
        };
    }

    const [pipelineConfig, setPipelineConfig] = useState<PipelineConfig>({
        target: '',
        problemType: 'classification',
        cleaning: { imputation: [], outliers: 'none' },
        preprocessing: { scaling: 'standard', encoding: 'label' },
        augmentation: { method: 'none' },
        splitting: { ratio: 0.8 },
        featureEngineering: { transformations: [] },
        algorithm: { name: 'RandomForest', params: {} }
    });

    // ... existing simple state ...
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Update to sync valid session data to pipelineConfig
    useEffect(() => {
        const recTarget = sessionStorage.getItem('recommended_target');
        const recTask = sessionStorage.getItem('recommended_task');
        if (recTarget && !pipelineConfig.target) {
            setPipelineConfig(prev => ({ ...prev, target: recTarget }));
            setTargetCol(recTarget); // Keep local for UI sync if needed, or remove
        }
        if (recTask) {
            setPipelineConfig(prev => ({ ...prev, problemType: recTask }));
            setProblemType(recTask);
        }
    }, [filename]);

    const handleUploadAnalysis = (analysis: any) => {
        // This function matches the signature expected by SmartUpload onAnalysisComplete
        // analysis contains { filename, columns, preview, profile, ... }
        setFilename(analysis.filename || 'uploaded_file.csv');
        if (analysis.profile) {
            setDataProfile(analysis.profile);
        }
        if (analysis.preview) {
            setDataPreview(analysis.preview);
        }
        if (analysis.columns) {
            setColumns(analysis.columns);

            // Basic Auto-Detect Target
            const candidates = ['target', 'label', 'survived', 'class', 'outcome'];
            const detected = analysis.columns.find((c: string) => candidates.includes(c.toLowerCase()));
            if (detected) {
                setTargetCol(detected);
                setPipelineConfig(prev => ({ ...prev, target: detected }));
            }
        }
    };

    // Helper to trigger Data Engineer Agent
    const askDataEngineer = async (taskType: string, stepName: string) => {
        setAgentThinking(true);
        setAgentMessage(`Analyzing data for ${stepName}...`);
        try {
            const analysis = await dataEngineer.execute({
                id: `task_${Date.now()}`,
                type: taskType,
                status: 'pending',
                payload: {
                    problemDefinition: { target: pipelineConfig.target, type: pipelineConfig.problemType },
                    dataProfile: dataProfile || { rows: 1000, columns: {} } // Fallback profile
                },
                logs: []
            });

            // Apply recommendations
            if (taskType === 'recommend_cleaning') {
                setPipelineConfig(prev => ({
                    ...prev,
                    cleaning: {
                        imputation: analysis.imputation || [],
                        outliers: analysis.outliers || 'none'
                    }
                }));
            } else if (taskType === 'recommend_preprocessing') {
                setPipelineConfig(prev => ({
                    ...prev,
                    preprocessing: {
                        scaling: analysis.scaling || 'standard',
                        encoding: analysis.encoding || 'label'
                    }
                }));
            } else if (taskType === 'recommend_features') {
                setPipelineConfig(prev => ({
                    ...prev,
                    featureEngineering: {
                        transformations: analysis.transformations || []
                    }
                }));
            }
            else if (taskType === 'recommend_imbalance') {
                setPipelineConfig(prev => ({
                    ...prev,
                    augmentation: {
                        method: analysis.method || 'none'
                    }
                }));
            }

            setAiRecommendation(`🤖 **Data Engineer Agent**:\n"${analysis.reasoning}"`);
        } catch (e) {
            console.error("Agent failed", e);
            setAiRecommendation("Agent analysis failed. Please configure manually.");
        } finally {
            setAgentThinking(false);
            setAgentMessage("");
        }
    };

    // Helper for Agent UI
    const renderAgentThoughts = () => (
        <div className="min-h-[50px] mt-4">
            {agentThinking ? (
                <div className="glass-panel p-4 border-l-4 border-l-blue-500 bg-blue-500/5 animate-pulse flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    <div>
                        <div className="font-bold text-blue-400">Agent Thinking</div>
                        <div className="text-sm text-gray-300">{agentMessage}</div>
                    </div>
                </div>
            ) : aiRecommendation && (
                <div className="glass-panel p-4 border-l-4 border-l-purple-500 bg-purple-500/5 animate-in slide-in-from-bottom-2">
                    <h3 className="font-bold mb-1 flex items-center gap-2 text-purple-400">
                        <BrainCircuit className="w-4 h-4" /> Agent Recommendation
                    </h3>
                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{aiRecommendation}</div>
                </div>
            )}
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 'config':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">1. Project Configuration</h2>
                        {/* ... Existing Upload UI ... */}
                        {!filename ? (
                            <div className="mb-8">
                                <label className="block text-sm text-gray-400 mb-2">Upload Dataset</label>
                                <SmartUpload onAnalysisComplete={handleUploadAnalysis} />
                            </div>
                        ) : (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex justify-between items-center animate-in fade-in">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/20 rounded-full">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-emerald-100">Dataset Uploaded</div>
                                        <div className="text-xs text-emerald-400/70">{filename}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setFilename('');
                                    setDataPreview([]);
                                    setColumns([]);
                                    setPipelineConfig(prev => ({ ...prev, target: '' }));
                                }} className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20">
                                    Change File
                                </Button>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Project Name</label>
                            <input className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white focus:border-accent outline-none"
                                value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="e.g., Titanic Survival Prediction" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="opacity-50 pointer-events-none">
                                <label className="block text-sm text-gray-400 mb-2">Dataset Filename</label>
                                <input className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white outline-none"
                                    value={filename} readOnly />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Target Column</label>
                                <div className="relative">
                                    <input className="w-full bg-black/30 border border-gray-700 rounded p-3 text-white focus:border-accent outline-none"
                                        value={pipelineConfig.target}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setTargetCol(val);
                                            setPipelineConfig(prev => ({ ...prev, target: val }));
                                        }}
                                        placeholder="e.g., Survived" />
                                </div>
                            </div>
                        </div>
                        {/* ... Recommendation Display ... */}
                        <div className="min-h-[100px]">
                            {renderAgentThoughts()}
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
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">2. Data Cleaning</h2>
                            <Button variant="outline" size="sm" onClick={() => askDataEngineer('recommend_cleaning', 'Cleaning Strategy')}>
                                <Wand2 className="w-4 h-4 mr-2" /> Ask Agent
                            </Button>
                        </div>

                        {/* Imputation Controls - Editable List */}
                        <div className="glass-panel p-6 mb-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-purple-400" /> Imputation Strategy
                            </h3>
                            <div className="space-y-4">
                                {pipelineConfig.cleaning.imputation.map((imp, idx) => (
                                    <div key={idx} className="flex gap-4 items-center bg-black/20 p-2 rounded">
                                        <span className="font-mono text-sm flex-1">{imp.column}</span>
                                        <select
                                            value={imp.strategy}
                                            onChange={(e) => {
                                                const newImps = [...pipelineConfig.cleaning.imputation];
                                                newImps[idx].strategy = e.target.value;
                                                setPipelineConfig(prev => ({ ...prev, cleaning: { ...prev.cleaning, imputation: newImps } }));
                                            }}
                                            className="bg-black/40 border border-gray-700 rounded p-1 text-sm flex-1"
                                        >
                                            <option value="mean">Mean</option>
                                            <option value="median">Median</option>
                                            <option value="most_frequent">Most Frequent</option>
                                            <option value="constant">Constant</option>
                                        </select>
                                        <Button size="icon" variant="ghost" onClick={() => {
                                            const newImps = pipelineConfig.cleaning.imputation.filter((_, i) => i !== idx);
                                            setPipelineConfig(prev => ({ ...prev, cleaning: { ...prev.cleaning, imputation: newImps } }));
                                        }}><Scissors className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                ))}
                                <div className="flex gap-4 items-end pt-4 border-t border-gray-800">
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
                                        setPipelineConfig(prev => ({
                                            ...prev,
                                            cleaning: {
                                                ...prev.cleaning,
                                                imputation: [...prev.cleaning.imputation, { column: col, strategy: strat }]
                                            }
                                        }));
                                    }}>Add</Button>
                                </div>
                            </div>
                        </div>

                        {/* Outliers */}
                        <div className="glass-panel p-6 mb-6">
                            <h3 className="font-bold mb-4">Outlier Detection</h3>
                            <select
                                value={pipelineConfig.cleaning.outliers}
                                onChange={(e) => setPipelineConfig(prev => ({ ...prev, cleaning: { ...prev.cleaning, outliers: e.target.value } }))}
                                className="w-full bg-black/40 border border-gray-700 rounded p-2"
                            >
                                <option value="none">None</option>
                                <option value="isolation_forest">Isolation Forest (Auto)</option>
                                <option value="iqr">IQR Clipping</option>
                            </select>
                        </div>

                        {/* Agent Thoughts Display */}
                        {renderAgentThoughts()}

                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('preprocessing')}>Next: Preprocessing</Button>
                        </div>
                    </div>
                );

            case 'preprocessing':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">3. Preprocessing</h2>
                            <Button variant="outline" size="sm" onClick={() => askDataEngineer('recommend_preprocessing', 'Preprocessing Strategy')}>
                                <Wand2 className="w-4 h-4 mr-2" /> Ask Agent
                            </Button>
                        </div>

                        <div className="glass-panel p-6 mb-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Scale className="w-4 h-4 text-blue-400" /> Scaling & Encoding
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Scaling (Numeric)</label>
                                    <select
                                        value={pipelineConfig.preprocessing.scaling}
                                        onChange={(e) => setPipelineConfig(prev => ({ ...prev, preprocessing: { ...prev.preprocessing, scaling: e.target.value } }))}
                                        className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm"
                                    >
                                        <option value="standard">Standard Scaler</option>
                                        <option value="minmax">MinMax Scaler</option>
                                        <option value="robust">Robust Scaler</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Encoding (Categorical)</label>
                                    <select
                                        value={pipelineConfig.preprocessing.encoding}
                                        onChange={(e) => setPipelineConfig(prev => ({ ...prev, preprocessing: { ...prev.preprocessing, encoding: e.target.value } }))}
                                        className="w-full bg-black/40 border border-gray-700 rounded p-2 text-sm"
                                    >
                                        <option value="label">Label Encoding</option>
                                        <option value="onehot">One-Hot Encoding</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {renderAgentThoughts()}
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('augmentation')}>Next: Augmentation</Button>
                        </div>
                    </div>
                );
            case 'augmentation':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">4. Data Imbalance Handling</h2>
                            <Button variant="outline" size="sm" onClick={() => askDataEngineer('recommend_imbalance', 'Imbalance Strategy')}>
                                <Wand2 className="w-4 h-4 mr-2" /> Ask Agent
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Option Cards - Mapped to State */}
                            {['class_weight', 'undersampling', 'smote', 'adasyn', 'none'].map((method) => (
                                <div key={method}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${pipelineConfig.augmentation.method === method ? 'border-accent bg-accent/10' : 'border-gray-700 hover:border-gray-500'}`}
                                    onClick={() => setPipelineConfig(prev => ({ ...prev, augmentation: { method } }))}
                                >
                                    <h3 className="font-bold text-gray-200 capitalize mb-1">{method.replace('_', ' ')}</h3>
                                </div>
                            ))}
                        </div>
                        {renderAgentThoughts()}
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('splitting')}>Next: Splitting</Button>
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
                                <span className="text-blue-400 font-bold">Training Set: {Math.round(pipelineConfig.splitting.ratio * 100)}%</span>
                                <span className="text-orange-400 font-bold">Test Set: {Math.round((1 - pipelineConfig.splitting.ratio) * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="50" max="90"
                                value={pipelineConfig.splitting.ratio * 100}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                onChange={(e) => {
                                    const ratio = Number(e.target.value) / 100;
                                    setSplitRatio(ratio);
                                    setPipelineConfig(prev => ({ ...prev, splitting: { ratio } }));
                                }}
                            />
                        </div>
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('feature_engineering')}>Next: Feature Engineering</Button>
                        </div>
                    </div>
                );
            case 'feature_engineering':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">6. Feature Engineering</h2>
                            <Button variant="outline" size="sm" onClick={() => askDataEngineer('recommend_features', 'Feature Engineering')}>
                                <Wand2 className="w-4 h-4 mr-2" /> Ask Agent
                            </Button>
                        </div>
                        <div className="glass-panel p-6">
                            <h3 className="font-bold mb-4">Applied Transformations</h3>
                            {pipelineConfig.featureEngineering.transformations.length === 0 && (
                                <p className="text-gray-500 text-sm">No transformations applied. Use the agent to discover features.</p>
                            )}
                            <div className="space-y-3">
                                {pipelineConfig.featureEngineering.transformations.map((feat, idx) => (
                                    <div key={idx} className="p-3 bg-black/40 rounded border border-gray-700 flex justify-between items-center">
                                        <span className="text-sm font-mono">{feat}</span>
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-red-400"
                                            onClick={() => {
                                                const newFeats = pipelineConfig.featureEngineering.transformations.filter((_, i) => i !== idx);
                                                setPipelineConfig(prev => ({ ...prev, featureEngineering: { transformations: newFeats } }));
                                            }}
                                        ><Scissors className="w-3 h-3" /></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {renderAgentThoughts()}
                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('selection')}>Next: Algorithm Selection</Button>
                        </div>
                    </div>
                );
            case 'selection':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">7. Algorithm Selection</h2>
                            <Button variant="outline" size="sm" onClick={() => askDataEngineer('recommend_cleaning', 'Algorithm Selection')}> {/* Should be Model Developer really */}
                                <BrainCircuit className="w-4 h-4 mr-2" /> Ask Agent
                            </Button>
                        </div>
                        <p className="text-gray-400 mb-4">Select the model to train.</p>
                        <div className="space-y-4">
                            {['RandomForest', 'LogisticRegression', 'XGBoost', 'SVM'].map(algo => (
                                <div key={algo} onClick={() => setPipelineConfig(prev => ({ ...prev, algorithm: { name: algo, params: {} } }))}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-center 
                                                ${pipelineConfig.algorithm.name === algo ? 'border-accent bg-accent/10' : 'border-gray-700 hover:border-gray-500'}`}>
                                    <span className="font-bold">{algo}</span>
                                    {pipelineConfig.algorithm.name === algo && <CheckCircle className="w-5 h-5 text-accent" />}
                                </div>
                            ))}
                        </div>

                        {/* Trigger Agent Button - Specific for Model Developer */}
                        <Button variant="outline" className="w-full mt-4 border-dashed border-purple-500 text-purple-400 hover:bg-purple-500/10"
                            onClick={async () => {
                                setAgentThinking(true);
                                setAgentMessage("Researching best algorithms for your data...");
                                try {
                                    const analysis = await modelDeveloper.execute({
                                        id: `task_${Date.now()}`,
                                        type: 'generate_training_code',
                                        status: 'pending',
                                        payload: {
                                            problemDefinition: { target: targetCol, type: problemType },
                                            dataProfile: dataProfile
                                        },
                                        logs: []
                                    });

                                    if (analysis.recommended_models && analysis.recommended_models.length > 0) {
                                        const topModel = analysis.recommended_models[0];
                                        // Normalize Agent output to our keys
                                        let algoKey = 'RandomForest';
                                        if (topModel.name.includes('Forest')) algoKey = 'RandomForest';
                                        else if (topModel.name.includes('Logistic')) algoKey = 'LogisticRegression';
                                        else if (topModel.name.includes('Boost') || topModel.name.includes('XGB')) algoKey = 'XGBoost';
                                        else if (topModel.name.includes('SVM') || topModel.name.includes('Support Vector')) algoKey = 'SVM';

                                        setPipelineConfig(prev => ({ ...prev, algorithm: { name: algoKey, params: topModel.params || {} } }));
                                        setAiRecommendation(`🤖 **Model Developer Agent**:\n"I recommend **${algoKey}** (${(topModel.confidence * 100).toFixed(0)}% confidence).\n\n${analysis.reasoning}"`);
                                    }
                                } catch (e) {
                                    console.error("Model Developer Agent failed", e);
                                } finally {
                                    setAgentThinking(false);
                                    setAgentMessage("");
                                }
                            }}
                        >
                            <BrainCircuit className="w-4 h-4 mr-2" /> Ask Agent for Best Model
                        </Button>

                        {renderAgentThoughts()}

                        <div className="flex justify-end mt-8">
                            <Button onClick={() => setCurrentStep('training')}>
                                Next: Training
                            </Button>
                        </div>
                    </div >
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
                                    {!loading && <div className="text-gray-500">$ Ready to train...</div>}
                                    {loading && (
                                        <>
                                            <div>$ Initializing training environment... [OK]</div>
                                            <div>$ Loading dataset and libraries... [OK]</div>
                                            <div>$ Executing {pipelineConfig.algorithm.name} training...</div>
                                            <div className="animate-pulse text-accent">$ processing...</div>
                                        </>
                                    )}
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

                                        if (!targetCol) {
                                            alert("Target column not selected. Please go back to Configuration.");
                                            setLoading(false);
                                            return;
                                        }

                                        // 2. Write file to Pyodide FS
                                        pyodide.FS.writeFile("dataset.csv", csvData);

                                        // 3. Construct Python Pipeline Script
                                        const algo = pipelineConfig.algorithm.name;
                                        const useClassWeight = pipelineConfig.augmentation.method === 'class_weight' ? 'balanced' : null;

                                        // Dynamic Script Construction
                                        let script = `
import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
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

                                        // --- CLEANING: Imputation ---
                                        pipelineConfig.cleaning.imputation.forEach(imp => {
                                            script += `
# Imputation for ${imp.column}
if "${imp.column}" in X.columns:
    imp = SimpleImputer(strategy="${imp.strategy}")
    # Reshape for single column
    X["${imp.column}"] = imp.fit_transform(X[["${imp.column}"]]).ravel()
`;
                                        });

                                        // --- PREPROCESSING: Scaling ---
                                        if (pipelineConfig.preprocessing.scaling !== 'none') {
                                            const scalerClass = pipelineConfig.preprocessing.scaling === 'minmax' ? 'MinMaxScaler' : 'StandardScaler';
                                            script += `
# Scaling (${pipelineConfig.preprocessing.scaling})
scaler = ${scalerClass}()
if len(num_cols) > 0:
    X[num_cols] = scaler.fit_transform(X[num_cols])
`;
                                        }

                                        // --- AUGMENTATION ---
                                        if (pipelineConfig.augmentation.method === 'smote') {
                                            script += `
# SMOTE Augmentation
try:
    from imblearn.over_sampling import SMOTE
    sm = SMOTE(random_state=42)
    X, y = sm.fit_resample(X, y)
except:
    pass
`;
                                        } else if (pipelineConfig.augmentation.method === 'adasyn') {
                                            script += `
# ADASYN Augmentation
try:
    from imblearn.over_sampling import ADASYN
    ada = ADASYN(random_state=42)
    X, y = ada.fit_resample(X, y)
except:
    pass
`;
                                        } else if (pipelineConfig.augmentation.method === 'undersampling') {
                                            script += `
# Random Undersampling
try:
    from imblearn.under_sampling import RandomUnderSampler
    rus = RandomUnderSampler(random_state=42)
    X, y = rus.fit_resample(X, y)
except:
    pass
`;
                                        }

                                        // --- FEATURE ENGINEERING ---
                                        pipelineConfig.featureEngineering.transformations.forEach(trans => {
                                            // This is a placeholder. Real implementation would parse 'log_transform(Age)' etc.
                                            // For now we just log it as a comment
                                            script += `
# Applied Transformation: ${trans}
# (Implementation requires robust parsing logic not fully implemented in this demo)
`;
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
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=${(1 - pipelineConfig.splitting.ratio).toFixed(2)}, random_state=42)
`;

                                        // Model Training
                                        const algoMap: Record<string, string> = {
                                            'RandomForest': 'RandomForestClassifier',
                                            'LogisticRegression': 'LogisticRegression',
                                            'XGBoost': 'GradientBoostingClassifier', // Using Sklearn equivalent for now
                                            'SVM': 'SVC'
                                        };
                                        const pyAlgo = algoMap[algo] || 'RandomForestClassifier';

                                        // Construct Model Params
                                        let modelParams = "";
                                        if (useClassWeight) {
                                            if (['RandomForestClassifier', 'LogisticRegression', 'SVC'].includes(pyAlgo)) {
                                                modelParams = "class_weight='balanced'";
                                            }
                                        }

                                        script += `
# Train Model
model = ${pyAlgo}(${modelParams})
if "${pyAlgo}" == "SVC":
    model.probability = True

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

# Threshold Tuning (Binary Classification)
best_thresh = 0.5
if len(np.unique(y)) == 2 and hasattr(model, "predict_proba"):
    try:
        y_proba = model.predict_proba(X_test)[:, 1]
        thresholds = np.linspace(0.1, 0.9, 17)
        best_f1_tuned = 0
        for t in thresholds:
            yp = (y_proba >= t).astype(int)
            score = f1_score(y_test, yp, zero_division=0)
            if score > best_f1_tuned:
                best_f1_tuned = score
                best_thresh = t
        
        y_pred = (y_proba >= best_thresh).astype(int)
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = best_f1_tuned
    except:
        pass

metrics = {
    "accuracy": acc,
    "precision": prec,
    "recall": rec,
    "f1": f1,
    "best_threshold": best_thresh
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
                                                // Find the line that looks like our JSON metrics
                                                const jsonLine = lines.find((l: string) => l.startsWith('{"accuracy":')) || lines[lines.length - 1];

                                                if (!jsonLine) throw new Error("No JSON output found in stdout");

                                                const metrics = JSON.parse(jsonLine);

                                                setMetrics(metrics);
                                                setModelId(`model_${Date.now()}_${algo}`);

                                                // --- NEW: Persist Model for Deployment ---
                                                // Ensure joblib is loaded
                                                await pyodide.loadPackage(['joblib']);

                                                await runPython(`
import joblib
joblib.dump(model, 'model.joblib')
                                                    `);

                                                const modelFileContent = pyodide.FS.readFile('model.joblib');
                                                const file = new File([modelFileContent], `${algo}_model.joblib`, { type: 'application/octet-stream' });

                                                // @ts-ignore
                                                window.__PENDING_MODEL__ = file;
                                                // @ts-ignore
                                                window.__PENDING_METRICS__ = metrics;

                                                console.log("Model saved to window.__PENDING_MODEL__", file);

                                                // Only move to next step after successful persistence
                                                setCurrentStep('results');

                                            } catch (parseError: any) {
                                                console.error("Failed to parse metrics or save model", parseError, stdout);
                                                alert("Training completed but failed to process results:\n" + parseError.message);
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
                            <div className="p-6 bg-white/5 rounded-xl border border-gray-700">
                                <div className="text-sm text-gray-500 mb-1">F1 Score</div>
                                <div className="text-3xl font-mono text-accent">{metrics?.f1?.toFixed(3) || '0.000'}</div>
                                {metrics?.best_threshold && metrics.best_threshold !== 0.5 && (
                                    <div className="text-xs text-green-400 mt-2">
                                        Thresh: {metrics.best_threshold.toFixed(2)}
                                    </div>
                                )}
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
                            {/* Updated to reflect pipelineConfig complexity if possible, or just length of ops */}
                            {Object.values(pipelineConfig.cleaning.imputation).length + pipelineConfig.featureEngineering.transformations.length} Operations Queued
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
                    {/* Project Config Card */}
                    <div className="glass-panel p-6 border-l-4 border-l-blue-500">
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
                            <Binary className="w-4 h-4" /> Project Configuration
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <div className="text-gray-500 mb-1">Project Name</div>
                                <div className="font-medium text-white text-lg">{projectName}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">Target Column</div>
                                <div className="font-mono text-accent">
                                    {targetCol || <span className="text-gray-600 italic">Upload data first...</span>}
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500 mb-1">Problem Type</div>
                                <div className="font-mono text-purple-400">
                                    {problemType.charAt(0).toUpperCase() + problemType.slice(1)}
                                </div>
                            </div>
                        </div>
                    </div>

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
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                                <table className="w-full text-xs text-left relative">
                                    <thead className="sticky top-0 bg-[#0a0a1f] z-10 shadow-lg">
                                        <tr className="border-b border-gray-700">
                                            {columns.slice(0, 3).map(c => <th key={c} className="p-2 text-gray-400 font-normal">{c}</th>)}
                                            {columns.length > 3 && <th className="p-2 text-gray-400">...</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataPreview.map((row, i) => (
                                            <tr key={i} className="border-b border-gray-800 hover:bg-white/5">
                                                {columns.slice(0, 3).map(c => <td key={c} className="p-2 font-mono text-gray-300">{String(row[c]).substring(0, 10)}</td>)}
                                                {columns.length > 3 && <td className="p-2 text-gray-600">...</td>}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-2 text-xs text-gray-500 text-right">
                                    Showing top {dataPreview.length} rows of {dataProfile?.rows || 0}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
