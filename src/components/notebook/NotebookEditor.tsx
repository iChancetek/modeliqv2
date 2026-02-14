"use client";

import React, { useState, useEffect } from 'react';
import usePyodide from '@/hooks/usePyodide';
import { Play, Save, Plus, Trash2, RefreshCw, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NotebookCell {
    id: string;
    type: 'code' | 'markdown';
    content: string;
    output?: string;
    stdOut?: string;
    stdErr?: string;
}

export default function NotebookEditor() {
    const { pyodide, isLoading, runPython } = usePyodide();
    const [cells, setCells] = useState<NotebookCell[]>([
        { id: '1', type: 'markdown', content: '# ChanceTEK Notebook\nStart your analysis here.' },
        { id: '2', type: 'code', content: 'import pandas as pd\nimport numpy as np\nprint("ChanceTEK AI Kernel Ready!")' }
    ]);
    const [activeCell, setActiveCell] = useState<string | null>(null);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('modeliq_notebook');
        if (saved) {
            try {
                setCells(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load notebook", e);
            }
        }
    }, []);

    const saveNotebook = () => {
        localStorage.setItem('modeliq_notebook', JSON.stringify(cells));
        alert("Notebook saved successfully!");
    };

    const exportJupyter = () => {
        const notebook = {
            metadata: {
                kernelspec: {
                    display_name: "Python 3 (Pyodide)",
                    language: "python",
                    name: "python3"
                },
                language_info: {
                    codemirror_mode: { name: "ipython", version: 3 },
                    file_extension: ".py",
                    mimetype: "text/x-python",
                    name: "python",
                    console_type: "python3",
                    nbconvert_exporter: "python",
                    pygments_lexer: "ipython3",
                    version: "3.8"
                }
            },
            nbformat: 4,
            nbformat_minor: 5,
            cells: cells.map(cell => ({
                cell_type: cell.type,
                metadata: {},
                source: cell.content.split('\n').map(line => line + '\n'),
                outputs: cell.type === 'code' && (cell.stdOut || cell.output) ? [
                    {
                        name: "stdout",
                        output_type: "stream",
                        text: (cell.stdOut || "") + (cell.output || "")
                    }
                ] : [],
                execution_count: null
            }))
        };

        const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notebook-${new Date().toISOString().slice(0, 10)}.ipynb`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const newNotebook = () => {
        if (confirm("Create new notebook? Unsaved changes will be lost.")) {
            setCells([
                { id: Date.now().toString(), type: 'markdown', content: '# New Notebook' },
                { id: 'code-1', type: 'code', content: '' }
            ]);
            localStorage.removeItem('modeliq_notebook');
        }
    };

    const generateCode = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: aiPrompt })
            });
            const data = await response.json();

            if (data.code) {
                setCells([...cells, {
                    id: Date.now().toString(),
                    type: 'code',
                    content: data.code
                }]);
                setAiPrompt("");
            } else {
                alert("Failed to generate code: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to AI service.");
        } finally {
            setIsGenerating(false);
        }
    };

    const executeCell = async (id: string, code: string) => {
        if (!pyodide) return;
        setActiveCell(id);

        setCells(prev => prev.map(cell =>
            cell.id === id ? { ...cell, output: "Executing..." } : cell
        ));

        const { result, stdout, stderr, error } = await runPython(code);

        setCells(prev => prev.map(cell =>
            cell.id === id ? {
                ...cell,
                output: error ? null : (result?.toString() || ""),
                stdOut: stdout,
                stdErr: stderr || (error ? error.toString() : null)
            } : cell
        ));
        setActiveCell(null);
    };

    const deleteCell = (id: string) => {
        setCells(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center glass-panel p-4 rounded-xl mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                    <span className="text-sm font-mono text-muted-foreground">
                        {isLoading ? "Loading Kernel..." : "Kernel Ready (Pyodide v0.25)"}
                    </span>
                </div>

                {/* AI Assistant */}
                <div className="flex-1 max-w-lg mx-4 flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                        <Input
                            placeholder="Describe logic to generate (e.g., 'Load titanic.csv and plot ages')..."
                            className="pl-9 bg-black/20 border-white/10 focus-visible:ring-accent w-full"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && generateCode()}
                        />
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={generateCode}
                        disabled={isGenerating}
                    >
                        {isGenerating ? "Thinking..." : "Generate"}
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportJupyter} title="Download .ipynb">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={newNotebook}>
                        <RefreshCw className="w-4 h-4 mr-2" /> New
                    </Button>
                    <Button variant="elite" size="sm" onClick={saveNotebook}>
                        <Save className="w-4 h-4 mr-2" /> Save
                    </Button>
                </div>
            </div>

            {/* Cells */}
            <div className="space-y-6">
                {cells.map((cell) => (
                    <div key={cell.id} className="glass-panel p-1 rounded-xl transition-all hover:border-primary/30 relative group">
                        {/* Cell Controls */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                            <button onClick={() => deleteCell(cell.id)} className="p-1 hover:text-red-400 text-muted-foreground transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="bg-black/40 rounded-lg p-4">
                            <div className="flex justify-between mb-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">
                                <span>[{cell.type}]</span>
                                {cell.type === 'code' && (
                                    <button
                                        onClick={() => executeCell(cell.id, cell.content)}
                                        disabled={isLoading || activeCell === cell.id}
                                        className="text-primary hover:text-white transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <Play className="w-3 h-3 fill-current" /> {activeCell === cell.id ? 'Running...' : 'Run'}
                                    </button>
                                )}
                            </div>

                            {cell.type === 'markdown' ? (
                                <textarea
                                    className="w-full bg-transparent border-none text-foreground focus:ring-0 resize-none font-sans min-h-[60px]"
                                    value={cell.content}
                                    onChange={(e) => setCells(prev => prev.map(c => c.id === cell.id ? { ...c, content: e.target.value } : c))}
                                    placeholder="Markdown text..."
                                />
                            ) : (
                                <div className="font-mono">
                                    <textarea
                                        className="w-full bg-[#0d0d14] p-4 rounded-md text-sm text-blue-300 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 min-h-[100px]"
                                        value={cell.content}
                                        onChange={(e) => setCells(prev => prev.map(c => c.id === cell.id ? { ...c, content: e.target.value } : c))}
                                        spellCheck={false}
                                    />

                                    {/* Output Area */}
                                    {(cell.stdOut || cell.output || cell.stdErr) && (
                                        <div className="mt-2 p-4 bg-black/60 rounded-md text-sm font-mono border-t border-white/5">
                                            {cell.stdOut && <div className="text-gray-300 whitespace-pre-wrap">{cell.stdOut}</div>}
                                            {cell.output && <div className="text-green-400 whitespace-pre-wrap mt-1">Out: {cell.output}</div>}
                                            {cell.stdErr && <div className="text-red-400 whitespace-pre-wrap mt-2 border-l-2 border-red-500 pl-2">{cell.stdErr}</div>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Cell Buttons */}
            <div className="flex gap-4 justify-center py-8 relative">
                <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="relative z-10 flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setCells([...cells, { id: Date.now().toString(), type: 'code', content: '' }])}
                        className="rounded-full bg-background border border-white/10 hover:border-primary/50"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Code
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setCells([...cells, { id: Date.now().toString(), type: 'markdown', content: '' }])}
                        className="rounded-full bg-background border border-white/10 hover:border-accent/50"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Text
                    </Button>
                </div>
            </div>
        </div>
    );
}
