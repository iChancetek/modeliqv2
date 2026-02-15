import { DriftResult } from '../types';

/**
 * DriftEngine - Detects data distribution shifts.
 * Implements simplified PSI (Population Stability Index).
 */
export class DriftEngine {

    /**
     * Calculates drift between a baseline distribution and current distribution window.
     * simplified implementation assuming binned data or raw values.
     */
    detectDrift(baselineValues: number[], currentValues: number[], featureName: string): DriftResult {
        // Safe check
        if (baselineValues.length === 0 || currentValues.length === 0) {
            return { featureName, driftScore: 0, method: 'PSI', hasDrift: false, severity: 'low' };
        }

        // 1. Create Bins (Deciles) based on baseline
        const bins = this.createBins(baselineValues);

        // 2. Calculate Distributions
        const baselineDist = this.calculateDistribution(baselineValues, bins);
        const currentDist = this.calculateDistribution(currentValues, bins);

        // 3. Calculate PSI
        let psi = 0;
        for (let i = 0; i < bins.length; i++) {
            const actualB = baselineDist[i] === 0 ? 0.0001 : baselineDist[i]; // Avoid division by zero
            const actualC = currentDist[i] === 0 ? 0.0001 : currentDist[i];

            psi += (actualC - actualB) * Math.log(actualC / actualB);
        }

        const score = Math.max(0, psi); // PSI cannot be negative theoretically but floating point issues

        return {
            featureName,
            driftScore: score,
            method: 'PSI',
            hasDrift: score > 0.1,
            severity: score > 0.2 ? 'high' : score > 0.1 ? 'medium' : 'low'
        };
    }

    private createBins(values: number[], binCount = 10): number[] {
        const sorted = [...values].sort((a, b) => a - b);
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const step = (max - min) / binCount;

        const bins = [];
        for (let i = 0; i < binCount; i++) {
            bins.push(min + (step * (i + 1)));
        }
        return bins;
    }

    private calculateDistribution(values: number[], bins: number[]): number[] {
        const counts = new Array(bins.length).fill(0);
        let total = 0;

        values.forEach(v => {
            for (let i = 0; i < bins.length; i++) {
                if (v <= bins[i]) {
                    counts[i]++;
                    total++;
                    break;
                }
            }
        });

        // Normalize
        return counts.map(c => total === 0 ? 0 : c / total);
    }
}

export const driftEngine = new DriftEngine();
