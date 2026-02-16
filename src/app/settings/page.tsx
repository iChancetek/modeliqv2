"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Key, Shield, User } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Settings className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
                    <p className="text-muted-foreground">Manage your Modeliq environment, API keys, and preferences.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* API Services */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-blue-500" /> API Configuration
                        </CardTitle>
                        <CardDescription>
                            Manage connections to external AI and Cloud services.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="openai-key">OpenAI API Key (GPT-5.2)</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="openai-key"
                                    type="password"
                                    placeholder="sk-..."
                                    defaultValue={process.env.NEXT_PUBLIC_OPENAI_API_KEY ? "••••••••••••••••" : ""}
                                    className="font-mono"
                                />
                                <Button variant="secondary">Update</Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Used for Agentic features and Copilot. Currently using <strong>gpt-5.2</strong>.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" /> Security & Access
                        </CardTitle>
                        <CardDescription>
                            Control access to your telemetry and deployment endpoints.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-0.5">
                                <div className="font-medium">Ingestion API Authentication</div>
                                <div className="text-sm text-muted-foreground">
                                    Require <code>x-api-key</code> header for /api/sentinel/ingest
                                </div>
                            </div>
                            <Switch checked={true} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label>Sentinel Ingest Key</Label>
                            <Input
                                readOnly
                                value="sentinel_live_****************"
                                className="font-mono bg-muted"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Account */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-500" /> Account
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                MQ
                            </div>
                            <div>
                                <div className="font-medium">Modeliq Admin</div>
                                <div className="text-sm text-muted-foreground">admin@modeliq.ai</div>
                            </div>
                            <Button variant="outline" className="ml-auto">Sign Out</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
