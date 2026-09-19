import { createFileRoute } from '@tanstack/react-router';
import MasterAdminDashboard from '@/components/MasterAdminDashboard';

export const Route = createFileRoute('/master-admin')({
  component: MasterAdminDashboard,
});
