"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import EliteChart, { DataPoint } from '@/components/viz/EliteChart';
import { BarChart3, ScatterChart, Grid, Loader2 } from 'lucide-react';

interface ExplorationViewProps {
    filename: string;
    columns: string[];
}

type VizType = 'dist' | 'corr' | 'scatter';

export default function ExplorationView({ filename, columns }: ExplorationViewProps) {
    const [vizType, setVizType] = useState<VizType>('dist');
    const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || '');
    const [selectedX, setSelectedX] = useState<string>(columns[0] || '');
    const [selectedY, setSelectedY] = useState<string>(columns[1] || columns[0] || '');
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState<DataPoint[]>([]);

    useEffect(() => {
        if (filename) {
            fetchVizData();
        }
    }, [vizType, selectedColumn, selectedX, selectedY, filename]);

    const fetchVizData = async () => {
        setLoading(true);
        try {
            const body: any = {
                filename,
                type: vizType,
            };

            if (vizType === 'dist') body.column = selectedColumn;
            if (vizType === 'scatter') {
                body.x = selectedX;
                body.y = selectedY;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/visualize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await response.json();

            if (result.data) {
                // Ensure data matches DataPoint interface
                setChartData(result.data);
            }
        } catch (error) {
            console.error("Failed to fetch visualization", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Controls */}
            <div className="glass-panel p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                    <Button
                        variant={vizType === 'dist' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVizType('dist')}
                        className={vizType === 'dist' ? "bg-blue-600 hover:bg-blue-500" : ""}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" /> Distribution
                    </Button>
                    <Button
                        variant={vizType === 'scatter' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVizType('scatter')}
                        className={vizType === 'scatter' ? "bg-blue-600 hover:bg-blue-500" : ""}
                    >
                        <ScatterChart className="w-4 h-4 mr-2" /> Scatter
                    </Button>
                    <Button
                        variant={vizType === 'corr' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVizType('corr')}
                        className={vizType === 'corr' ? "bg-blue-600 hover:bg-blue-500" : ""}
                    >
                        <Grid className="w-4 h-4 mr-2" /> Correlation
                    </Button>
                </div>

                <div className="flex gap-2 items-center">
                    {vizType === 'dist' && (
                        <select
                            className="bg-black/40 border border-white/10 rounded-md px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                        >
                            {columns.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                    )}
                    {vizType === 'scatter' && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">X:</span>
                            <select
                                className="bg-black/40 border border-white/10 rounded-md px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                                value={selectedX}
                                onChange={(e) => setSelectedX(e.target.value)}
                            >
                                {columns.map(col => <option key={col} value={col}>{col}</option>)}
                            </select>
                            <span className="text-gray-500 text-xs">Y:</span>
                            <select
                                className="bg-black/40 border border-white/10 rounded-md px-3 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                                value={selectedY}
                                onChange={(e) => setSelectedY(e.target.value)}
                            >
                                {columns.map(col => <option key={col} value={col}>{col}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                )}

                {vizType === 'dist' && (
                    <EliteChart
                        data={chartData}
                        title={`Distribution of ${selectedColumn}`}
                        type="bar"
                        dataKey="value"
                    />
                )}

                {vizType === 'scatter' && (
                    <EliteChart
                        data={chartData}
                        title={`${selectedY} vs ${selectedX}`}
                        type="scatter"
                        dataKey="y"
                    />
                )}

                {vizType === 'corr' && (
                    <div className="glass-panel p-6 overflow-x-auto">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">Correlation Matrix</h3>
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-2">Feature</th>
                                    {chartData.length > 0 && Object.keys(chartData[0]).filter(k => k !== 'index').map(k => (
                                        <th key={k} className="p-2">{k}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row: any, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="p-2 font-medium text-white">{row['index']}</td>
                                        {Object.keys(row).filter(k => k !== 'index').map((k) => (
                                            <td key={k} className="p-2">
                                                <span className={`
                                                    ${Number(row[k]) > 0.7 ? 'text-emerald-400 font-bold' : ''}
                                                    ${Number(row[k]) < -0.7 ? 'text-red-400 font-bold' : ''}
                                                `}>
                                                    {Number(row[k]).toFixed(2)}
                                                </span>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
