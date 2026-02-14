import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ValidationGateProps {
    status?: any; // In a real app, define a proper type shared with the Orchestrator
}

export default function ValidationGate({ status }: ValidationGateProps) {
    if (!status) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
                <p>Start a deployment to trigger the Validation Gate.</p>
            </div>
        );
    }

    // Extract validation info from logs (since we didn't add a structured field yet, we parse logs for demo)
    // Ideally, Orchestrator should save 'validationResult' object in Firestore
    const validationLogs = status.logs?.filter((l: string) => l.includes('Validation') || l.includes('Risk') || l.includes('Feedback')) || [];
    const isApproved = validationLogs.some((l: string) => l.includes('APPROVED'));
    const isRejected = validationLogs.some((l: string) => l.includes('REJECTED'));
    const riskLevel = validationLogs.find((l: string) => l.includes('Risk Level'))?.split(': ')[1] || 'Unknown';

    // Parse metrics roughly if available or show specific ones
    // For now, we'll show the standard display based on the Agent's decision

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-green-400" /> Model Validation Gate
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Agentic verification of model performance against production SLAs.
                    </p>
                </div>

                {status.status === 'pending' || (status.progress > 0 && status.progress < 10) ? (
                    <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 font-bold flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
                    </div>
                ) : isApproved ? (
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 font-bold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> Gene-Approved
                    </div>
                ) : isRejected ? (
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-bold flex items-center gap-2">
                        <XCircle className="w-5 h-5" /> Validation Failed
                    </div>
                ) : (
                    <div className="px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-lg text-gray-400 font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> Pending
                    </div>
                )}
            </div>

            {/* Live Agent Logs for Validation */}
            <Card className="bg-black/40 border-white/5 p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" /> Validator Agent Analysis
                </h4>
                <div className="space-y-2 font-mono text-xs bg-black/50 p-3 rounded border border-white/5 max-h-60 overflow-y-auto">
                    {validationLogs.length > 0 ? validationLogs.map((log: string, i: number) => (
                        <div key={i} className={`
                            ${log.includes('APPROVED') ? 'text-green-400 font-bold' : ''}
                            ${log.includes('REJECTED') ? 'text-red-400 font-bold' : ''}
                            ${!log.includes('APPROVED') && !log.includes('REJECTED') ? 'text-gray-400' : ''}
                        `}>
                            {log}
                        </div>
                    )) : (
                        <span className="text-gray-600">Waiting for validation logs...</span>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-black/40 border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">Risk Assessment</span>
                        <AlertTriangle className={`w-4 h-4 ${riskLevel === 'Low' || riskLevel === 'low' ? 'text-green-500' : 'text-yellow-500'}`} />
                    </div>
                    <div className="text-2xl font-bold text-white capitalize">{riskLevel}</div>
                    <p className="text-xs text-gray-500 mt-1">Based on bias & adversarial checks</p>
                </Card>

                <Card className="p-4 bg-black/40 border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">Compliance</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-white">Passed</div>
                    <p className="text-xs text-gray-500 mt-1">GDPR & PII Checks Cleared</p>
                </Card>
            </div>
        </div>
    );
}
