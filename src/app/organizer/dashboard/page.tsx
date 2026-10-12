import App from '@/App';
import { requirePageUser } from '@/lib/page-access';

export default async function OrganizerDashboardPage() {
  await requirePageUser();
  return <App initialView="organizer_dashboard" />;
}
