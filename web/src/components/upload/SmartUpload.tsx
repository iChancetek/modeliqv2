"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone'; // User needs to install this: npm install react-dropzone

interface SmartUploadProps {
    onAnalysisComplete?: (data: any) => void;
}

export default function SmartUpload({ onAnalysisComplete }: SmartUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setUploading(true);
        setProgress(10);

        // Simulation of progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 10;
            });
        }, 500);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setProgress(100);
                if (onAnalysisComplete) {
                    onAnalysisComplete(data);
                }
            } else {
                console.error('Upload failed', data);
            }
        } catch (error) {
            console.error('Error uploading:', error);
        } finally {
            clearInterval(interval);
            setUploading(false);
        }
    }, [onAnalysisComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'], 'application/json': ['.json'], 'application/vnd.apache.parquet': ['.parquet'] } });

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
