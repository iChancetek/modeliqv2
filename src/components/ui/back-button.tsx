"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface BackButtonProps {
    label?: string;
    fallbackUrl?: string;
}

export function BackButton({ label = "Back", fallbackUrl = "/" }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else if (fallbackUrl) {
            router.push(fallbackUrl);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 text-gray-400 hover:text-white hover:bg-white/10"
        >
            <ArrowLeft className="w-4 h-4" />
            {label}
        </Button>
    );
}
