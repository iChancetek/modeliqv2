import { DriftResult } from './types';

/**
 * Modeliq Sentinel - Drift Detection Engine
 * Implements Population Stability Index (PSI) and basic distribution comparison.
 */

export class DriftEngine {
    private baselineDistributions: Map<string, number[]> = new Map();
    private currentWindowSize = 100;

    constructor(baseline?: Record<string, number[]>) {
        if (baseline) {
            Object.entries(baseline).forEach(([k, v]) => this.baselineDistributions.set(k, v));
        }
    }

    /**
     * Set the baseline distribution (e.g., from training data)
     */
    setBaseline(feature: string, values: number[]) {
        this.baselineDistributions.set(feature, values);
    }

    /**
     * Detect drift for a specific feature using PSI
     * @param feature Feature name
     * @param currentValues Recent production values
     */
    detectDrift(feature: string, currentValues: number[]): DriftResult {
        const baseline = this.baselineDistributions.get(feature);

        if (!baseline || baseline.length === 0 || currentValues.length === 0) {
            return {
                featureName: feature,
                driftScore: 0,
                method: 'PSI',
                hasDrift: false,
                severity: 'low'
            };
        }

        const psi = this.calculatePSI(baseline, currentValues);

        // PSI Thresholds: < 0.1 (No Drift), 0.1-0.2 (Minor), > 0.2 (Significant)
        let severity: 'low' | 'medium' | 'high' = 'low';
        let hasDrift = false;

        if (psi > 0.2) {
            severity = 'high';
            hasDrift = true;
        } else if (psi > 0.1) {
            severity = 'medium';
            hasDrift = true;
        }

        return {
            featureName: feature,
            driftScore: psi,
            method: 'PSI',
            hasDrift,
            severity
        };
    }

    /**
     * Calculate Population Stability Index (PSI)
     */
    private calculatePSI(expected: number[], actual: number[], buckets = 10): number {
        // 1. Define bucket ranges based on expected distribution
        const min = Math.min(...expected);
        const max = Math.max(...expected);
        const range = max - min;
        const bucketSize = range / buckets;

        const expectedCounts = new Array(buckets).fill(0);
        const actualCounts = new Array(buckets).fill(0);

        // 2. Bin the data
        const getBucket = (val: number) => Math.min(Math.floor((val - min) / bucketSize), buckets - 1);

        expected.forEach(v => expectedCounts[getBucket(v)]++);
        actual.forEach(v => {
            // Handle values outside baseline range safely
            if (v < min) actualCounts[0]++;
            else if (v > max) actualCounts[buckets - 1]++;
            else actualCounts[getBucket(v)]++;
        });

        // 3. Calculate proportions
        const expectedTotal = expected.length;
        const actualTotal = actual.length;
        const epsilon = 0.0001; // Avoid division by zero

        let psi = 0;
        for (let i = 0; i < buckets; i++) {
            const pctExpected = (expectedCounts[i] / expectedTotal) + epsilon;
            const pctActual = (actualCounts[i] / actualTotal) + epsilon;

            psi += (pctActual - pctExpected) * Math.log(pctActual / pctExpected);
        }

        return psi;
    }
}
