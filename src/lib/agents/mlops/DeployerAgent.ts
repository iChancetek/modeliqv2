import { BaseAgent, AgentRole, AgentTask } from './AgentBase';
import { PackagingAgent } from './PackagingAgent';
import { InfraAgent } from './InfraAgent';

export class DeployerAgent extends BaseAgent {
    private packagingAgent: PackagingAgent;
    private infraAgent: InfraAgent;

    constructor() {
        super();
        this.packagingAgent = new PackagingAgent();
        this.infraAgent = new InfraAgent();
    }

    getRole(): AgentRole {
        return 'Deployer';
    }

    protected getPersona(): string {
        return "You are a Senior DevOps/MLOps Engineer. You orchestrate the deployment process, managing containerization and infrastructure provisioning.";
    }

    async execute(task: AgentTask): Promise<any> {
        if (task.type === 'orchestrate_deployment') {
            const { modelName, modelType, requirements } = task.payload;

            // 1. Generate Packaging (delegating to sub-agent logic, but coordinating here)
            // In a full agentic system, these might be sub-calls or we re-use the existing classes
            // For now, we wrap the existing tools to make them "Agentic"

            const packageRes = await this.packagingAgent.generatePackage({
                modelName, modelType, pythonVersion: '3.11',
                requirements: [...requirements, 'requests'], // Ensure telemetry hook
                framework: 'sklearn'
            });

            const infraRes = await this.infraAgent.generateInfra({
                cloudProvider: 'gcp',
                resourceType: 'serverless', // Defaulting for this demo
                appName: modelName,
                region: 'us-central1'
            });

            return {
                deploymentStrategy: 'Blue/Green',
                artifacts: packageRes,
                infrastructure: infraRes,
                deployedUrl: `https://${modelName.toLowerCase()}-api.modeliq.ai` // Simulated result
            };
        }
        throw new Error(`Unknown task type: ${task.type}`);
    }
}
