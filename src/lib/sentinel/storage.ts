import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { TelemetryPoint, AnomalyAlert } from './types';

/**
 * SentinelStorage - Abstracted Persistence Layer
 * Currently uses Firestore, designed to allow migration to Bigtable or TimeScaleDB.
 */
export class SentinelStorage {
    private telemetryCollection = 'sentinel_telemetry';
    private alertsCollection = 'sentinel_alerts';

    /**
     * Writes a single telemetry point to storage.
     * In high-throughput, this should verify buffering or using a write-behind pattern.
     */
    async writeTelemetry(point: TelemetryPoint): Promise<void> {
        try {
            // Add server timestamp for indexing consistency
            const entry = {
                ...point,
                ingestedAt: Timestamp.now()
            };
            await addDoc(collection(db, this.telemetryCollection), entry);
        } catch (error) {
            console.error("Sentinel Persistence Error:", error);
            // In a real system, write to a local fallback or dead-letter queue
        }
    }

    /**
     * Batch write telemetry points (optimization)
     */
    async writeTelemetryBatch(points: TelemetryPoint[]): Promise<void> {
        const batch = writeBatch(db);
        const colRef = collection(db, this.telemetryCollection);

        points.forEach(point => {
            const docRef = doc(colRef);
            batch.set(docRef, {
                ...point,
                ingestedAt: Timestamp.now()
            });
        });

        await batch.commit();
    }

    /**
     * Retrieve metrics for a specific time range and resource
     */
    async getMetrics(resourceId: string, timeWindowMinutes: number = 60): Promise<TelemetryPoint[]> {
        const startTime = Date.now() - (timeWindowMinutes * 60 * 1000);

        const q = query(
            collection(db, this.telemetryCollection),
            where('modelId', '==', resourceId),
            where('timestamp', '>=', startTime),
            orderBy('timestamp', 'asc'),
            limit(1000) // Safety cap
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => d.data() as TelemetryPoint);
    }

    /**
     * Log an anomaly alert
     */
    async createAlert(alert: AnomalyAlert): Promise<string> {
        const ref = await addDoc(collection(db, this.alertsCollection), alert);
        return ref.id;
    }

    /**
     * Get active alerts
     */
    async getActiveAlerts(resourceId?: string): Promise<AnomalyAlert[]> {
        let constraints = [
            where('status', 'in', ['open', 'investigating']),
            orderBy('timestamp', 'desc'),
            limit(50)
        ];

        if (resourceId) {
            constraints = [
                where('resourceId', '==', resourceId),
                ...constraints
            ];
        }

        // @ts-ignore - spread arguments in constraints can be tricky for TS
        const q = query(collection(db, this.alertsCollection), ...constraints);
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AnomalyAlert));
    }
}

export const sentinelStorage = new SentinelStorage();
