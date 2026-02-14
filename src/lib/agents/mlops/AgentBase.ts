import { OpenAI } from 'openai';

// --- Base Types ---

export type AgentRole =
    | 'ProblemDefiner'
    | 'DataEngineer'
    | 'ModelDeveloper'
    | 'Validator'
    | 'Deployer'
    | 'SentinelMonitor'
    | 'Retrainer';

export interface AgentMessage {
    role: AgentRole;
    content: string;
    timestamp: number;
    metadata?: any;
}

export interface AgentTask {
    id: string;
    type: string;
    payload: any;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: any;
    logs: string[];
}

// --- Base Agent Class ---

export abstract class BaseAgent {
    protected openai: OpenAI;
    protected model: string = 'gpt-5.2'; // Upgrading to GPT-5.2 as requested

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true // Allowed for this client-side demo
        });
    }

    abstract getRole(): AgentRole;
    abstract execute(task: AgentTask): Promise<any>;

    protected async think(prompt: string, context?: any): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: `You are the ${this.getRole()} Agent. ${this.getPersona()}` },
                    { role: 'user', content: JSON.stringify({ prompt, context }) }
                ]
            });
            return response.choices[0].message.content || '';
        } catch (error) {
            console.error(`${this.getRole()} Thought Error:`, error);
            throw error;
        }
    }

    protected abstract getPersona(): string;
}

// --- Agent Orchestrator ---

export class AgentOrchestrator {
    private agents: Map<AgentRole, BaseAgent> = new Map();
    private eventLog: AgentMessage[] = [];
    private listeners: ((log: AgentMessage) => void)[] = [];

    constructor() {
        // Agents will be registered here
    }

    public registerAgent(agent: BaseAgent) {
        this.agents.set(agent.getRole(), agent);
    }

    public async dispatchTask(role: AgentRole, task: AgentTask): Promise<any> {
        const agent = this.agents.get(role);
        if (!agent) throw new Error(`Agent ${role} not found`);

        this.log(role, `Starting task: ${task.type}`);

        try {
            const result = await agent.execute(task);
            this.log(role, `Completed task: ${task.type}`, result);
            return result;
        } catch (error: any) {
            this.log(role, `Task failed: ${error.message}`);
            throw error;
        }
    }

    private log(role: AgentRole, content: string, metadata?: any) {
        const message: AgentMessage = {
            role,
            content,
            timestamp: Date.now(),
            metadata
        };
        this.eventLog.push(message);
        this.listeners.forEach(l => l(message));
    }

    public subscribe(callback: (log: AgentMessage) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    public getLogs() {
        return this.eventLog;
    }
}
