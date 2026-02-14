"use client";

import React, { useState } from 'react';
import { useMLOps } from './MLOpsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Database, FileCode, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';

// Step 1: Definition
export function ProblemDefinitionStep() {
    const { definition, setDefinition } = useMLOps();
    const [form, setForm] = useState(definition || { name: '', problemType: 'classification', targetColumn: '', objective: '' });

    const handleSave = () => {
        setDefinition(form as any);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Card className="bg-black/40 border-white/5">
                <CardHeader>
                    <CardTitle>1. Define Problem</CardTitle>
                    <CardDescription>Configure the project scope and objectives.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                            id="name"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., Customer Churn Prediction"
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="type">Problem Type</Label>
                        <select
                            id="type"
                            className="bg-black/20 border border-white/10 rounded-md p-2 text-sm"
                            value={form.problemType}
                            onChange={e => setForm({ ...form, problemType: e.target.value as any })}
                        >
                            <option value="classification">Classification</option>
                            <option value="regression">Regression</option>
                            <option value="clustering">Clustering</option>
                        </select>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="target">Target Variable</Label>
                        <Input
                            id="target"
                            value={form.targetColumn}
                            onChange={e => setForm({ ...form, targetColumn: e.target.value })}
                            placeholder="e.g., is_churned"
                            className="bg-white/5 border-white/10"
                        />
                    </div>
                    <Button onClick={handleSave} className="w-full">
                        {definition ? "Update Definition" : "Save Definition"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

// Step 2: Data
export function DataEngineeringStep() {
    const { dataset, setDataset } = useMLOps();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                setDataset({
                    rowCount: results.data.length,
                    columnCount: results.meta.fields?.length || 0,
                    columns: results.meta.fields || [],
                    missingValues: 0 // Simplified for now
                });
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Card className="bg-black/40 border-white/5">
                <CardHeader>
                    <CardTitle>2. Data Collection</CardTitle>
                    <CardDescription>Upload local datasets for analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!dataset ? (
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-10 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Database className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm font-medium">Click to upload CSV</p>
                            <p className="text-xs text-muted-foreground mt-1">Supports up to 50MB</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <Database className="w-8 h-8 text-green-400" />
                                <div>
                                    <div className="font-bold text-green-400">Dataset Loaded</div>
                                    <div className="text-xs text-gray-400">{dataset.rowCount} Rows • {dataset.columnCount} Columns</div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setDataset(null!)} className="ml-auto">
                                    Replace
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-3 rounded bg-white/5">
                                    <span className="text-muted-foreground">Columns:</span>
                                    <div className="font-mono text-xs mt-1 truncate">{dataset.columns.slice(0, 5).join(', ')}...</div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Step 3: Model Development
export function ModelDevelopmentStep() {
    const { model, setModel } = useMLOps();

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simulate reading model metadata
        setModel({
            name: file.name,
            version: 'v1.0.0',
            format: file.name.endsWith('.onnx') ? 'onnx' : 'sklearn',
            sizeBytes: file.size,
            uploadedAt: new Date(),
            metrics: { accuracy: 0.85 + Math.random() * 0.1 } // Simulate initial eval
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <Card className="bg-black/40 border-white/5">
                <CardHeader>
                    <CardTitle>3. Model Registry</CardTitle>
                    <CardDescription>Upload trained model artifacts (.pkl, .onnx, .h5)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!model ? (
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-10 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept=".pkl,.joblib,.onnx,.h5"
                                onChange={handleModelUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <FileCode className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                            <p className="text-sm font-medium">Upload Model Artifact</p>
                            <p className="text-xs text-muted-foreground mt-1">Supported: Scikit-Learn, PyTorch, ONNX</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <CheckCircle2 className="w-8 h-8 text-purple-400" />
                                <div>
                                    <div className="font-bold text-purple-400">{model.name}</div>
                                    <div className="text-xs text-gray-400">
                                        v{model.version} • {(model.sizeBytes / 1024).toFixed(2)} KB • {model.format.toUpperCase()}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setModel(null!)} className="ml-auto">
                                    Remove
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(model.metrics).map(([k, v]) => (
                                    <div key={k} className="p-3 rounded bg-white/5 flex justify-between">
                                        <span className="text-muted-foreground capitalize">{k}</span>
                                        <span className="font-mono font-bold">{(v * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
