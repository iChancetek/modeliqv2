"use client";

import React, { useState } from 'react';

interface NotebookCell {
    id: string;
    type: 'code' | 'markdown';
    content: string;
    output?: string;
}

export default function NotebookEditor() {
    const [cells, setCells] = useState<NotebookCell[]>([
        { id: '1', type: 'markdown', content: '# ChanceTEK Notebook\nStart your analysis here.' },
        { id: '2', type: 'code', content: 'print("Hello from ChanceTEK!")' }
    ]);

    const executeCell = async (id: string, code: string) => {
        // Optimistic update
        setCells(prev => prev.map(cell =>
            cell.id === id ? { ...cell, output: "Executing..." } : cell
        ));

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await response.json();

            setCells(prev => prev.map(cell =>
                cell.id === id ? { ...cell, output: data.result || data.error } : cell
            ));
        } catch (e) {
            setCells(prev => prev.map(cell =>
                cell.id === id ? { ...cell, output: "Error executing cell." } : cell
            ));
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
            {cells.map((cell) => (
                <div key={cell.id} className="glass-panel p-4 rounded-xl border border-gray-700/50">
                    <div className="flex justify-between mb-2 text-xs text-slate-400 uppercase tracking-widest">
                        <span>{cell.type}</span>
                        {cell.type === 'code' && (
                            <button
                                onClick={() => executeCell(cell.id, cell.content)}
                                className="text-accent hover:text-white transition-colors"
                            >
                                ▶ Run
                            </button>
                        )}
                    </div>

                    {cell.type === 'markdown' ? (
                        <textarea
                            className="w-full bg-transparent border-none text-gray-200 focus:ring-0 resize-none font-sans"
                            value={cell.content}
                            onChange={(e) => setCells(prev => prev.map(c => c.id === cell.id ? { ...c, content: e.target.value } : c))}
                        />
                    ) : (
                        <div className="font-mono">
                            <textarea
                                className="w-full bg-black/30 p-3 rounded-md text-sm text-green-400 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-accent"
                                rows={3}
                                value={cell.content}
                                onChange={(e) => setCells(prev => prev.map(c => c.id === cell.id ? { ...c, content: e.target.value } : c))}
                            />
                            {cell.output && (
                                <div className="mt-2 p-3 bg-black/50 rounded-md text-xs text-gray-300 whitespace-pre-wrap border border-gray-800">
                                    {cell.output}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="flex gap-2 justify-center mt-8">
                <button
                    onClick={() => setCells([...cells, { id: Date.now().toString(), type: 'code', content: '' }])}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
                >
                    + Code
                </button>
                <button
                    onClick={() => setCells([...cells, { id: Date.now().toString(), type: 'markdown', content: '' }])}
                    className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
                >
                    + Text
                </button>
            </div>
        </div>
    );
}
