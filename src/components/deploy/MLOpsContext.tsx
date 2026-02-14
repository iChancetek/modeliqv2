"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types for our "Real Data" structures
export interface ProjectDefinition {
    name: string;
    problemType: 'classification' | 'regression' | 'clustering';
    targetColumn: string;
    objective: string;
}

export interface DatasetStats {
    rowCount: number;
    columnCount: number;
    columns: string[];
    missingValues: number;
}

export interface ModelArtifact {
    name: string;
    version: string;
    format: 'sklearn' | 'tensorflow' | 'pytorch' | 'onnx';
    sizeBytes: number;
    uploadedAt: Date;
    metrics: Record<string, number>; // e.g., { accuracy: 0.95 }
    file?: File;
}

export interface MonitoringMetric {
    timestamp: number;
    name: string;
    value: number;
    tags?: Record<string, string>;
}

interface MLOpsContextType {
    // State
    definition: ProjectDefinition | null;
    dataset: DatasetStats | null;
    model: ModelArtifact | null;
    metrics: MonitoringMetric[];

    // Actions
    setDefinition: (def: ProjectDefinition) => void;
    setDataset: (stats: DatasetStats) => void;
    setModel: (model: ModelArtifact) => void;
    addMetric: (metric: MonitoringMetric) => void;
    clearMetrics: () => void;
}

const MLOpsContext = createContext<MLOpsContextType | undefined>(undefined);

export function MLOpsProvider({ children }: { children: ReactNode }) {
    const [definition, setDefinition] = useState<ProjectDefinition | null>(null);
    const [dataset, setDataset] = useState<DatasetStats | null>(null);
    const [model, setModel] = useState<ModelArtifact | null>(null);
    const [metrics, setMetrics] = useState<MonitoringMetric[]>([]);

    const addMetric = (metric: MonitoringMetric) => {
        setMetrics(prev => [...prev.slice(-99), metric]); // Keep last 100 points per metric type ideally, but simplified here
    };

    const clearMetrics = () => setMetrics([]);

    return (
        <MLOpsContext.Provider value={{
            definition,
            dataset,
            model,
            metrics,
            setDefinition,
            setDataset,
            setModel,
            addMetric,
            clearMetrics
        }}>
            {children}
        </MLOpsContext.Provider>
    );
}

export function useMLOps() {
    const context = useContext(MLOpsContext);
    if (context === undefined) {
        throw new Error('useMLOps must be used within a MLOpsProvider');
    }
    return context;
}
