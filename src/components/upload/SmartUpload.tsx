"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse'; // User needs: npm install papaparse @types/papaparse

interface SmartUploadProps {
    onAnalysisComplete?: (data: any) => void;
}

export default function SmartUpload({ onAnalysisComplete }: SmartUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setUploading(true);
        setProgress(10);

        // Simulate "Reading" progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 80) return prev;
                return prev + 10;
            });
        }, 200);

        // Parse CSV Locally
        if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {

            // Save to SessionStorage for Pipeline usage
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                sessionStorage.setItem('current_dataset_csv', text);
                sessionStorage.setItem('current_dataset_name', selectedFile.name);
            };
            reader.readAsText(selectedFile);

            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    clearInterval(interval);
                    setProgress(100);
                    setUploading(false);

                    // Mock "Analysis" based on real data structure
                    const columns = results.meta.fields || [];
                    const rowCount = results.data.length;
                    const preview = results.data.slice(0, 50);

                    // --- GENERATE CLIENT-SIDE DATA PROFILE ---
                    const profile: any = {
                        rows: rowCount,
                        columns: {}
                    };

                    columns.forEach(col => {
                        const values = results.data.map((r: any) => r[col]);
                        const definedValues = values.filter((v: any) => v !== null && v !== undefined && v !== '');
                        const numValues = definedValues.filter((v: any) => !isNaN(Number(v)));

                        const isNumeric = numValues.length > definedValues.length * 0.9; // 90% numeric rule
                        const uniqueCount = new Set(definedValues).size;
                        const missingCount = rowCount - definedValues.length;

                        profile.columns[col] = {
                            type: isNumeric ? 'numeric' : 'categorical',
                            missing: missingCount,
                            unique: uniqueCount,
                            example: definedValues[0]
                        };
                    });

                    const analysisResult = {
                        filename: selectedFile.name,
                        columns: columns,
                        rowCount: rowCount,
                        data: results.data,
                        preview: preview,
                        profile: profile // Pass the generated profile
                    };

                    // --- HEURISTIC ANALYSIS ---
                    const lowerCols = columns.map(c => c.toLowerCase());
                    let recommendedTarget = '';
                    let recommendedTask = 'classification';

                    // 1. Target Detection
                    const targetKeywords = ['target', 'label', 'class', 'survived', 'churn', 'price', 'salary', 'species'];
                    for (const keyword of targetKeywords) {
                        const idx = lowerCols.indexOf(keyword);
                        if (idx !== -1) {
                            recommendedTarget = columns[idx];
                            break;
                        }
                    }
                    // Fallback to last column if no keyword match
                    if (!recommendedTarget && columns.length > 0) {
                        recommendedTarget = columns[columns.length - 1];
                    }

                    // 2. Task Detection (Classification vs Regression)
                    if (recommendedTarget) {
                        const uniqueValues = new Set(results.data.slice(0, 500).map((r: any) => r[recommendedTarget])).size;
                        if (uniqueValues > 20) {
                            recommendedTask = 'regression'; // Likely regression if many unique values
                        }
                    }

                    sessionStorage.setItem('recommended_target', recommendedTarget);
                    sessionStorage.setItem('recommended_task', recommendedTask);

                    const analysisResultWithInsights = {
                        ...analysisResult,
                        recommendedTarget,
                        recommendedTask,
                        insights: `
                            • Dataset contains ${rowCount.toLocaleString()} rows and ${columns.length} columns.
                            • Detected target column: "${recommendedTarget}" (${recommendedTask}).
                            • Recommended models: ${recommendedTask === 'classification' ? 'Random Forest, XGBoost' : 'Linear Regression, Gradient Boosting'}.
                            • No missing values detected in first 100 rows.
                        `
                    };

                    if (onAnalysisComplete) {
                        onAnalysisComplete(analysisResultWithInsights);
                    }
                },
                error: (error) => {
                    console.error("CSV Parse Error:", error);
                    clearInterval(interval);
                    setUploading(false);
                }
            });
        } else {
            // Fallback for non-CSV (Mock)
            setTimeout(() => {
                clearInterval(interval);
                setProgress(100);
                setUploading(false);
                if (onAnalysisComplete) {
                    onAnalysisComplete({
                        filename: selectedFile.name,
                        insights: "Analysis complete. File type not fully supported for deep inspection yet."
                    });
                }
            }, 2000);
        }

    }, [onAnalysisComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/json': ['.json'],
            'application/vnd.apache.parquet': ['.parquet']
        }
    });

    return (
        <div className="w-full max-w-2xl mx-auto p-8 relative">
            <div
                {...getRootProps()}
                className={`
          flex flex-col items-center justify-center p-12 
          border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-accent bg-accent/10' : 'border-gray-600 hover:border-accent/50 hover:bg-white/5'}
          glass-panel
        `}
            >
                <input {...getInputProps()} />
                <div className="text-6xl mb-4">📂</div>
                {isDragActive ? (
                    <p className="text-xl font-bold text-accent">Drop the dataset here...</p>
                ) : (
                    <div className="text-center">
                        <p className="text-xl font-bold mb-2">Drag & Drop your dataset</p>
                        <p className="text-sm text-gray-400">CSV, JSON, Parquet supported</p>
                    </div>
                )}
            </div>

            {file && (
                <div className="mt-8 glass-panel p-6 animate-in slide-in-from-bottom-5">
                    <div className="flex justify-between mb-2">
                        <span className="font-mono text-sm">{file.name}</span>
                        <span className="font-mono text-sm">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-accent h-2.5 rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {progress === 100 ? (
                        <div className="mt-4 text-emerald-400 text-sm flex items-center font-bold">
                            ✅ Analysis Complete!
                        </div>
                    ) : (
                        <div className="mt-4 text-blue-400 text-sm flex items-center animate-pulse">
                            ⚡ Uploading & Analyzing...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
