"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import EliteChart, { DataPoint } from '@/components/viz/EliteChart';
import { BarChart3, ScatterChart, Grid, Loader2, Table as TableIcon, ChevronDown } from 'lucide-react';

interface ExplorationViewProps {
    filename: string;
    columns: string[];
    data: any[]; // Full dataset
}

type VizType = 'dist' | 'corr' | 'scatter' | 'data';

export default function ExplorationView({ filename, columns, data }: ExplorationViewProps) {
    const [vizType, setVizType] = useState<VizType>('data'); // Default to data view
    const [selectedColumn, setSelectedColumn] = useState<string>(columns[0] || '');
    const [selectedX, setSelectedX] = useState<string>(columns[0] || '');
    const [selectedY, setSelectedY] = useState<string>(columns[1] || columns[0] || '');
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState<DataPoint[]>([]);

    // Pagination for Data tab
    const [visibleRows, setVisibleRows] = useState(50);

    useEffect(() => {
        if (!data || data.length === 0) return;
        // Reset valid selections if columns change
        if (!columns.includes(selectedColumn)) setSelectedColumn(columns[0]);
        if (!columns.includes(selectedX)) setSelectedX(columns[0]);
        if (!columns.includes(selectedY)) setSelectedY(columns[1] || columns[0]);

        computeVizData();
    }, [vizType, selectedColumn, selectedX, selectedY, data]);

    const computeVizData = async () => {
        if (vizType === 'data') return; // No custom computation needed for raw data view

        setLoading(true);
        // Simulate async processing for UI responsiveness
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            let processedData: DataPoint[] = [];

            if (vizType === 'dist' && selectedColumn) {
                // Compute Frequency Distribution
                const counts: Record<string, number> = {};
                data.forEach(row => {
                    const val = row[selectedColumn];
                    if (val !== undefined && val !== null) {
                        const key = String(val);
                        counts[key] = (counts[key] || 0) + 1;
                    }
                });

                // Convert to DataPoint array and slice top 20 to avoid overcrowding
                processedData = Object.entries(counts)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 20);

            } else if (vizType === 'scatter' && selectedX && selectedY) {
                // Map X-Y values
                processedData = data
                    .filter(row => row[selectedX] != null && row[selectedY] != null) // Filter nulls
                    .slice(0, 500) // Limit points for performance
                    .map((row, i) => ({
                        name: `Pt${i}`,
                        x: Number(row[selectedX]) || 0,
                        y: Number(row[selectedY]) || 0,
                        value: 1 // Dummy value for size
                    }));

            } else if (vizType === 'corr') {
                // Compute Simple Correlation Matrix (only for numeric columns)
                // This is a heavy operation, so we limit to first 10 numeric columns
                const numericCols = columns.filter(col => {
                    const val = Number(data[0]?.[col]);
                    return !isNaN(val);
                }).slice(0, 10);

                // Initialize matrix
                const matrix: any[] = [];

                numericCols.forEach(col1 => {
                    const rowObj: any = { index: col1 };
                    const values1 = data.map(r => Number(r[col1]) || 0);

                    numericCols.forEach(col2 => {
                        const values2 = data.map(r => Number(r[col2]) || 0);
                        const corr = calculateCorrelation(values1, values2);
                        rowObj[col2] = corr;
                    });
                    matrix.push(rowObj);
                });
                processedData = matrix;
            }

            setChartData(processedData);
        } catch (error) {
            console.error("Viz Computation Error", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Pearson Correlation
    const calculateCorrelation = (x: number[], y: number[]) => {
        const n = x.length;
        if (n === 0) return 0;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
        const sumX2 = x.reduce((a, b) => a + b * b, 0);
        const sumY2 = y.reduce((a, b) => a + b * b, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    };

    return (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Controls */}
            <div className="glass-panel p-4 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                    <Button
                        variant={vizType === 'data' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setVizType('data')}
                        className={vizType === 'data' ? "bg-blue-600 hover:bg-blue-500" : ""}
                    >
                        <TableIcon className="w-4 h-4 mr-2" /> Data Preview
                    </Button>
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

            {/* Chart/Data Area */}
            <div className="relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                )}

                {/* Data Preview Table */}
                {vizType === 'data' && (
                    <div className="glass-panel overflow-x-auto rounded-xl">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-black/30 text-gray-200 uppercase font-bold sticky top-0">
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col} className="p-3 whitespace-nowrap">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.slice(0, visibleRows).map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        {columns.map((col) => (
                                            <td key={`${i}-${col}`} className="p-3 whitespace-nowrap">
                                                {row[col] !== null && row[col] !== undefined ? String(row[col]) : ''}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Footer / Load More */}
                        <div className="p-4 border-t border-white/5 flex flex-col items-center gap-2 bg-black/20">
                            <div className="text-xs text-muted-foreground">
                                Showing {Math.min(visibleRows, data.length)} of {data.length.toLocaleString()} rows
                            </div>
                            {visibleRows < data.length && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setVisibleRows(prev => prev + 25)}
                                    className="border-white/10 hover:bg-white/5"
                                >
                                    Load More (+25) <ChevronDown className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {!loading && chartData.length === 0 && vizType !== 'data' && (
                    <div className="flex items-center justify-center h-[400px] text-gray-500">
                        No data available for visualization
                    </div>
                )}

                {vizType === 'dist' && chartData.length > 0 && (
                    <EliteChart
                        data={chartData}
                        title={`Distribution of ${selectedColumn}`}
                        type="bar"
                        dataKey="value"
                    />
                )}

                {vizType === 'scatter' && chartData.length > 0 && (
                    <EliteChart
                        data={chartData}
                        title={`${selectedY} vs ${selectedX}`}
                        type="scatter"
                        dataKey="y"
                    />
                )}

                {vizType === 'corr' && chartData.length > 0 && (
                    <div className="glass-panel p-6 overflow-x-auto">
                        <h3 className="text-xl font-bold mb-4 text-blue-400">Correlation Matrix</h3>
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="p-2">Feature</th>
                                    {Object.keys(chartData[0]).filter(k => k !== 'index').map(k => (
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
