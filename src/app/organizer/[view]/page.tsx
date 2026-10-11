import App from '@/App';
import { requirePageUser } from '@/lib/page-access';
import { redirect } from 'next/navigation';

const views: Record<string, string> = {
  dashboard: 'organizer_dashboard', teams: 'organizer_teams', players: 'organizer_players',
  fixtures: 'organizer_fixtures', 'match-control': 'organizer_match_control', standings: 'organizer_standings',
  statistics: 'organizer_statistics', payments: 'organizer_registration_payments', export: 'organizer_export',
  settings: 'organizer_settings', history: 'organizer_history', purchase: 'purchase_package', setup: 'tournament_setup_wizard',
};

export default async function OrganizerPage({ params }: { params: Promise<{ view: string }> }) {
  await requirePageUser();
  const { view } = await params;
  if (view === 'dashboard') redirect('/organizer/dashboard');
  if (view === 'standings') redirect('/organizer/standings');
  if (view === 'match-control') redirect('/organizer/match-control');
  if (view === 'purchase') redirect('/organizer/purchase');
  return <App initialView={views[view] ?? 'organizer_dashboard'} />;
}
