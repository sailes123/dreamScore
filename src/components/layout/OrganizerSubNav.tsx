import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  TableProperties, 
  BarChart3, 
  CreditCard, 
  Download, 
  Settings, 
  History,
  PlayCircle
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const OrganizerSubNav: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    activeTournament, 
    lifecycleState,
    isReadOnly 
  } = useTournament();

  const navItems = [
    { id: 'organizer_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'organizer_teams', label: 'Teams', icon: Users },
    { id: 'organizer_players', label: 'Players', icon: UserCheck },
    { id: 'organizer_fixtures', label: 'Fixtures & Results', icon: Calendar },
    { id: 'organizer_standings', label: 'Standings', icon: TableProperties },
    { id: 'organizer_statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'organizer_registration_payments', label: 'Registration Fees', icon: CreditCard },
    { id: 'organizer_export', label: 'Export & Retention', icon: Download },
    { id: 'organizer_settings', label: 'Settings', icon: Settings },
    { id: 'organizer_history', label: 'Archived History', icon: History }
  ];

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-0">
        
        {/* Active Tournament Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {activeTournament.sportCode === 'FUTSAL' ? '⚽' : '🏆'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  {activeTournament.name}
                </h1>
                <StatusBadge status={lifecycleState} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{activeTournament.sportCode}</span>
                <span>•</span>
                <span>{activeTournament.venues[0]?.name || 'Kathmandu'}</span>
                <span>•</span>
                <span>
                  {new Date(activeTournament.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(activeTournament.endDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Match Operator Button if LIVE */}
          {lifecycleState === 'LIVE' && (
            <button
              type="button"
              onClick={() => setCurrentView('organizer_fixtures')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <PlayCircle className="w-4 h-4 animate-pulse" />
              Court-Side Live Match Control
            </button>
          )}

          {isReadOnly && (
            <div className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-md text-slate-600 text-xs font-medium self-start sm:self-auto">
              Read-Only Mode
            </div>
          )}
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-100 pt-1 -mb-px">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
