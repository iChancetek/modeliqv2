import DeploymentDashboard from '@/components/deploy/DeploymentDashboard';

// Force dynamic rendering - this page requires user interaction
export const dynamic = 'force-dynamic';

export default function DeployPage() {
    return <DeploymentDashboard />;
}
