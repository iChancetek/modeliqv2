"use client";

import { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        loadPyodide: any;
    }
}

export default function usePyodide() {
    const [pyodide, setPyodide] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [output, setOutput] = useState<string[]>([]);
    const pyodideRef = useRef<any>(null);

    useEffect(() => {
        const load = async () => {
            if (pyodideRef.current) return;

            try {
                // Dynamically import script if not already present
                if (!document.getElementById('pyodide-script')) {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
                    script.id = 'pyodide-script';
                    script.async = true;
                    document.body.appendChild(script);

                    await new Promise((resolve) => {
                        script.onload = resolve;
                    });
                }

                const pyodideInstance = await window.loadPyodide();

                // Load packages: pandas, numpy, scikit-learn, matplotlib, seaborn
                // Note: 'micropip' is standard, we load 'pandas' etc.
                await pyodideInstance.loadPackage(['micropip', 'pandas', 'numpy', 'scikit-learn', 'matplotlib', 'seaborn']);

                // Auto-Import common libraries and PySpark Shim
                await pyodideInstance.runPythonAsync(`
                    import sys
                    import io
                    import types
                    import pandas as pd
                    import numpy as np
                    import matplotlib.pyplot as plt
                    import seaborn as sns
                    import sklearn

                    # --- PySpark Shim ---
                    class SparkSessionShim:
                        class Builder:
                            def getOrCreate(self):
                                return SparkSessionShim()
                            def appName(self, name):
                                return self
                            def master(self, master):
                                return self
                            
                        builder = Builder()

                        def createDataFrame(self, data, schema=None):
                            if isinstance(data, pd.DataFrame):
                                return DataFrameShim(data)
                            return DataFrameShim(pd.DataFrame(data, columns=schema))

                        def sql(self, query):
                            # Very basic SQL support via duckdb if available, or just error
                            print("SQL not fully supported in browser shim yet.")
                            return DataFrameShim(pd.DataFrame())

                    class DataFrameShim:
                        def __init__(self, pandas_df):
                            self._df = pandas_df

                        def show(self, n=20, truncate=True):
                            print(self._df.head(n))

                        def count(self):
                            return len(self._df)

                        def select(self, *cols):
                            return DataFrameShim(self._df[list(cols)])
                        
                        def toPandas(self):
                            return self._df
                        
                        def printSchema(self):
                            print(self._df.info())

                    # Register Shim
                    pyspark = types.ModuleType("pyspark")
                    pyspark.sql = types.ModuleType("pyspark.sql")
                    pyspark.sql.SparkSession = SparkSessionShim
                    sys.modules["pyspark"] = pyspark
                    sys.modules["pyspark.sql"] = pyspark.sql
                    # --------------------
                    
                    # Setup standard IO capture
                    sys.stdout = io.StringIO()
                    sys.stderr = io.StringIO()
                    
                    print("Auto-imported: pandas, numpy, matplotlib, seaborn, sklearn")
                    print("PySpark Shim loaded: Use 'from pyspark.sql import SparkSession'")
                `);

                pyodideRef.current = pyodideInstance;
                setPyodide(pyodideInstance);
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load Pyodide:", error);
                setIsLoading(false);
            }
        };

        load();
    }, []);

    const runPython = async (code: string) => {
        if (!pyodide) return { result: null, error: "Pyodide not loaded" };

        try {
            // Reset standard output buffers
            pyodide.runPython(`
                import sys
                import io
                sys.stdout = io.StringIO()
                sys.stderr = io.StringIO()
            `);

            // Check if plt is used and setup figure
            const isPlotting = code.includes('plt.') || code.includes('sns.');
            if (isPlotting) {
                pyodide.runPython("plt.clf()"); // Clear previous plots
            }

            const result = await pyodide.runPythonAsync(code);

            const stdout = pyodide.runPython("sys.stdout.getvalue()");
            const stderr = pyodide.runPython("sys.stderr.getvalue()");

            // Handle Plot Image output if generated
            // This is a naive implementation; better entails wrapping in a helper
            // For now, we rely on stdout. In a real integration, we'd check for active figures.

            return { result, stdout, stderr, error: null };
        } catch (error: any) {
            return { result: null, error: error.message };
        }
    };

    return { pyodide, isLoading, runPython };
}
