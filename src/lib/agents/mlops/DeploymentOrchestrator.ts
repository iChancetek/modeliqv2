import { PackagingAgent } from './PackagingAgent';
import { InfraAgent } from './InfraAgent';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

/**
 * DeploymentOrchestrator - Coordinates the full deployment pipeline
 * Similar to AWS SageMaker's deployment automation
 */

export interface DeploymentRequest {
    modelName: string;
    modelFile: File;
    framework: 'sklearn' | 'tensorflow' | 'pytorch' | 'xgboost';
    cloudProvider: 'gcp' | 'aws' | 'azure';
    computeStrategy: 'serverless' | 'kubernetes' | 'vm';
}

export interface DeploymentStatus {
    id: string;
    status: 'pending' | 'packaging' | 'building' | 'deploying' | 'active' | 'failed';
    progress: number; // 0-100
    logs: string[];
    endpoint?: string;
    error?: string;
}

export class DeploymentOrchestrator {
    private packagingAgent = new PackagingAgent();
    private infraAgent = new InfraAgent();

    async deployModel(request: DeploymentRequest): Promise<string> {
        // 1. Create deployment record in Firestore
        const deploymentRef = await addDoc(collection(db, 'deployments'), {
            modelName: request.modelName,
            status: 'pending',
            progress: 0,
            logs: ['Deployment initiated'],
            createdAt: serverTimestamp(),
            cloudProvider: request.cloudProvider,
            computeStrategy: request.computeStrategy
        });

        const deploymentId = deploymentRef.id;

        // 2. Run deployment pipeline asynchronously
        this.runDeploymentPipeline(deploymentId, request).catch(error => {
            console.error('Deployment failed:', error);
            this.updateDeployment(deploymentId, {
                status: 'failed',
                error: error.message,
                logs: ['Deployment failed: ' + error.message]
            });
        });

        return deploymentId;
    }

    private async runDeploymentPipeline(deploymentId: string, request: DeploymentRequest) {
        try {
            // Step 1: Generate packaging artifacts
            await this.updateDeployment(deploymentId, {
                status: 'packaging',
                progress: 10,
                logs: ['Generating Dockerfile and server code...']
            });

            const packageResult = await this.packagingAgent.generatePackage({
                modelName: request.modelName,
                modelType: 'classification',
                pythonVersion: '3.11',
                requirements: ['scikit-learn', 'fastapi', 'uvicorn', 'numpy', 'requests'],
                framework: request.framework
            });

            await this.updateDeployment(deploymentId, {
                progress: 30,
                logs: ['Packaging complete', 'Generated Dockerfile and FastAPI server']
            });

            // Step 2: Generate infrastructure code
            await this.updateDeployment(deploymentId, {
                status: 'building',
                progress: 40,
                logs: ['Generating infrastructure configuration...']
            });

            const infraResult = await this.infraAgent.generateInfra({
                cloudProvider: request.cloudProvider,
                computeTarget: request.computeStrategy,
                region: 'us-central1',
                autoScaling: true
            });

            await this.updateDeployment(deploymentId, {
                progress: 60,
                logs: ['Infrastructure code generated', 'Provisioning Cloud Run service...']
            });

            // Step 3: Deploy to Cloud Run (via API route)
            await this.updateDeployment(deploymentId, {
                status: 'deploying',
                progress: 70,
                logs: ['Triggering Cloud Run deployment...']
            });

            // Call our deployment API
            const deployResponse = await fetch('/api/deploy/cloud-run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelName: request.modelName,
                    dockerfile: packageResult.dockerfile,
                    serverCode: packageResult.serverCode,
                    region: 'us-central1'
                })
            });

            if (!deployResponse.ok) {
                throw new Error('Cloud Run deployment failed');
            }

            const deployData = await deployResponse.json();

            // Step 4: Mark as active
            await this.updateDeployment(deploymentId, {
                status: 'active',
                progress: 100,
                logs: ['Deployment successful!', `Endpoint: ${deployData.endpoint}`],
                endpoint: deployData.endpoint
            });

        } catch (error: any) {
            throw error;
        }
    }

    private async updateDeployment(id: string, updates: Partial<DeploymentStatus>) {
        const deploymentRef = doc(db, 'deployments', id);
        await updateDoc(deploymentRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    }

    async getDeploymentStatus(id: string): Promise<DeploymentStatus | null> {
        // Retrieved via Firestore real-time listener in UI
        return null;
    }
}
