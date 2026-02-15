import SentinelDashboard from '@/components/sentinel/SentinelDashboard';

export const dynamic = 'force-dynamic';

export default function SentinelPage() {
    return (
        <main className="min-h-screen bg-black/95 text-white">
            <div className="p-6">
                <SentinelDashboard />
            </div>
        </main>
    );
}
