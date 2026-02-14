"use client";

import PipelineWizard from '@/components/pipeline/PipelineWizard';
import { BackButton } from '@/components/ui/back-button';

export default function PipelinePage() {
    return (
        <div className="min-h-screen">
            <div className="p-4">
                <BackButton fallbackUrl="/studio" />
            </div>
            <PipelineWizard />
        </div>
    );
}

