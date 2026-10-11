import React, { useState, useEffect } from 'react';
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
  PlayCircle,
  Trophy,
  ShieldCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  ChevronsUpDown,
  Sparkles,
  Layers,
  HelpCircle,
  ExternalLink,
  Lock,
  Archive,
  Clock
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { 
    currentView, 
    setCurrentView, 
    activeTournament, 
    tournaments,
    activeTournamentId,
    setActiveTournamentId,
    lifecycleState,
    isReadOnly,
    teams,
    players,
    matches,
    setIsCreateTournamentModalOpen,
    retentionDaysLeft
  } = useTournament();

  const [isTournamentMenuOpen, setIsTournamentMenuOpen] = useState(false);

  // Auto-close tournament switcher dropdown when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#sidebar-tournament-switcher')) {
        setIsTournamentMenuOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  const unpaidTeamsCount = teams.filter(t => t.paymentStatus === 'UNPAID' || t.paymentStatus === 'PARTIALLY_PAID').length;
  const liveMatchesCount = matches.filter(m => m.status === 'LIVE' || m.status === 'HALFTIME').length;

  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { 
          id: 'organizer_dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard,
          badge: null
        },
        { 
          id: 'organizer_teams', 
          label: 'Teams', 
          icon: Users,
          badge: `${teams.length}/${activeTournament.numberOfTeams}`
        },
        { 
          id: 'organizer_players', 
          label: 'Players', 
          icon: UserCheck,
          badge: players.length.toString()
        },
        { 
          id: 'organizer_fixtures', 
          label: 'Fixtures & Schedule', 
          icon: Calendar,
          badge: matches.length > 0 ? `${matches.length}` : null
        },
        { 
          id: 'organizer_match_control', 
          label: 'Court-Side Match Control', 
          icon: PlayCircle,
          isLive: lifecycleState === 'LIVE' || liveMatchesCount > 0,
          badge: liveMatchesCount > 0 ? `${liveMatchesCount} Live` : (lifecycleState === 'LIVE' ? 'Active' : null),
          badgeColor: 'emerald'
        },
        { 
          id: 'organizer_standings', 
          label: 'Standings Table', 
          icon: TableProperties,
          badge: null
        },
        { 
          id: 'organizer_statistics', 
          label: 'Player Stats & Goals', 
          icon: BarChart3,
          badge: null
        }
      ]
    },
    {
      title: 'MANAGEMENT & RETENTION',
      items: [
        { 
          id: 'organizer_registration_payments', 
          label: 'Registration Fees', 
          icon: CreditCard,
          badge: unpaidTeamsCount > 0 ? `${unpaidTeamsCount} Unpaid` : 'All Paid',
          badgeColor: unpaidTeamsCount > 0 ? 'amber' : 'slate'
        },
        { 
          id: 'organizer_export', 
          label: 'Export & Retention', 
          icon: Download,
          badge: lifecycleState === 'RETENTION_GRACE' ? `${retentionDaysLeft}d left` : null,
          badgeColor: 'purple'
        },
        { 
          id: 'organizer_settings', 
          label: 'Tournament Settings', 
          icon: Settings,
          badge: null
        },
        { 
          id: 'organizer_history', 
          label: 'Archived Tournaments', 
          icon: History,
          badge: null
        }
      ]
    },
    {
      title: 'PORTALS & PLATFORM',
      items: [
        { 
          id: 'public_portal', 
          label: 'Public Live Center', 
          icon: Eye,
          badge: 'Spectator',
          badgeColor: 'sky'
        },
        { 
          id: 'admin_dashboard', 
          label: 'Platform Admin', 
          icon: ShieldCheck,
          badge: 'Superadmin',
          badgeColor: 'indigo'
        }
      ]
    }
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col bg-white dark:bg-[#0c101d] border-r border-slate-200 dark:border-white/10 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top App Branding */}
        <div className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-3.5 flex-shrink-0">
          <div 
            onClick={() => handleNavClick('organizer_dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none overflow-hidden"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(37,99,235,0.4)] flex-shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-athletic text-base tracking-tight text-slate-900 dark:text-white font-extrabold">ArenaOps</span>
                  <span className="text-[10px] font-bold text-blue-400 px-1.5 py-0.2 bg-blue-500/10 rounded-full border border-blue-500/20 font-mono">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Tournament Hub</span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button inside Header (if not collapsed) */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tournament Switcher Card / Trigger */}
        <div className="p-3 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
          <div id="sidebar-tournament-switcher" className="relative">
            {!isCollapsed ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsTournamentMenuOpen(!isTournamentMenuOpen)}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {activeTournament.sportCode === 'FUTSAL' ? '⚽' : '🏆'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight font-athletic">
                        {activeTournament.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-blue-400 uppercase font-mono">
                          {activeTournament.sportCode}
                        </span>
                        <span className="text-slate-300 dark:text-white/20">•</span>
                        <StatusBadge status={lifecycleState} size="sm" />
                      </div>
                    </div>
                  </div>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 ml-1 flex-shrink-0" />
                </button>

                {/* Tournament Selector Dropdown */}
                {isTournamentMenuOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#121828] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-athletic uppercase tracking-wider text-slate-400">
                      Switch Tournament
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {tournaments.map(t => {
                        const isCurrent = t.id === activeTournamentId;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setActiveTournamentId(t.id);
                              setIsTournamentMenuOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-between ${
                              isCurrent 
                                ? 'bg-blue-600 text-white font-bold shadow-sm' 
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <span className="truncate">{t.name}</span>
                            <span className="text-[10px] text-slate-400 uppercase ml-2 font-mono">
                              {t.sportCode}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/10 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTournamentMenuOpen(false);
                          setIsCreateTournamentModalOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Create New Tournament</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Collapsed Active Tournament Icon */
              <div className="flex justify-center group relative">
                <button
                  type="button"
                  onClick={() => setIsCollapsed(false)}
                  className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-white flex items-center justify-center font-bold text-sm shadow-xs cursor-pointer hover:scale-105 transition"
                >
                  {activeTournament.sportCode === 'FUTSAL' ? '⚽' : '🏆'}
                </button>
                {/* Floating Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                  {activeTournament.name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-5">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-2.5 text-[10px] font-athletic uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                  {section.title}
                </div>
              ) : (
                <div className="h-px bg-slate-100 dark:bg-white/5 my-2 mx-2" />
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id || 
                  (item.id === 'organizer_dashboard' && (currentView === 'purchase_package' || currentView === 'tournament_setup_wizard')) ||
                  (item.id === 'organizer_fixtures' && currentView === 'organizer_match_control' && false);

                let badgeStyles = 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300';
                if (item.badgeColor === 'emerald') badgeStyles = 'bg-emerald-500/20 text-emerald-400 animate-pulse border border-emerald-500/30';
                if (item.badgeColor === 'amber') badgeStyles = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                if (item.badgeColor === 'purple') badgeStyles = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
                if (item.badgeColor === 'sky') badgeStyles = 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
                if (item.badgeColor === 'indigo') badgeStyles = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';

                return (
                  <div key={item.id} className="relative group">
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-[#2965ff] to-[#1447db] text-white shadow-[0_4px_16px_rgba(41,101,255,0.4)] font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                      } ${isCollapsed ? 'justify-center px-0 h-10' : ''}`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        isActive 
                          ? 'text-white' 
                          : ('isLive' in item && item.isLive)
                            ? 'text-blue-400 animate-pulse' 
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                      }`} />

                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                              isActive ? 'bg-white/20 text-white' : badgeStyles
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>

                    {/* Floating Tooltip in Collapsed Mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50 flex items-center gap-2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${badgeStyles}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Collapse Toggle */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 flex-shrink-0 bg-slate-50/50 dark:bg-black/20">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-medium text-[11px] font-mono">System Live</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 transition cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
