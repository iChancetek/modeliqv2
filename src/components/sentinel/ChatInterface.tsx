import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'assistant', content: 'I am Sentinel Copilot. Connectivity is currently limited. Telemetry is being recorded.', timestamp: Date.now() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // TODO: Connect to backend SentinelMonitorAgent
            // For now, we report that the AI agent is not yet connected to this frontend interface.

            setTimeout(() => {
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "The Sentinel AI Agent is currently disconnected. Please configure the backend API to enable real-time analysis.",
                    timestamp: Date.now()
                }]);
                setIsLoading(false);
            }, 500);

        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-black/40 border-white/5 h-[400px] flex flex-col">
            <CardHeader className="py-3 border-b border-white/5">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-400">
                    <Bot className="w-4 h-4" /> Sentinel Copilot
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(m => (
                        <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`p-3 rounded-lg text-sm max-w-[80%] ${m.role === 'user' ? 'bg-purple-500/10 text-purple-100' : 'bg-blue-500/10 text-blue-100'}`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="p-3 rounded-lg text-sm bg-blue-500/10 text-blue-100 italic animate-pulse">
                                Thinking...
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-3 border-t border-white/5 flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about system status..."
                        className="bg-black/50 border-white/10 text-white"
                    />
                    <Button size="icon" onClick={handleSend} disabled={isLoading}>
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
