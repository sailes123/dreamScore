import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Trophy, 
  ShieldCheck, 
  User, 
  Eye, 
  ChevronDown, 
  PlusCircle, 
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Laptop,
  LogOut,
  LogIn,
  Settings,
  Sparkles,
  PlayCircle,
  CreditCard,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface NavbarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  mobileSidebarOpen,
  setMobileSidebarOpen
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    availableUsers, 
    currentView, 
    setCurrentView,
    activeTournament,
    lifecycleState,
    setIsCreateTournamentModalOpen,
    setIsPricingModalOpen,
    isLoggedOut,
    logout,
    login,
    setIsAuthModalOpen
  } = useTournament();

  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as HTMLElement)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute view titles for clean breadcrumb
  const getViewTitle = () => {
    switch (currentView) {
      case 'organizer_dashboard': return 'Tournament Dashboard';
      case 'organizer_teams': return 'Teams & Squads';
      case 'organizer_players': return 'Player Directory';
      case 'organizer_fixtures': return 'Fixtures & Results';
      case 'organizer_match_control': return 'Court-Side Live Match Control';
      case 'organizer_standings': return 'Standings & Table';
      case 'organizer_statistics':
      case 'organizer_stats': return 'Statistics & Golden Boot';
      case 'organizer_registration_payments':
      case 'organizer_payments': return 'Registration Fees & Payments';
      case 'organizer_export': return 'Export & Retention Lifecycle';
      case 'organizer_settings': return 'Tournament Settings & Venues';
      case 'organizer_history': return 'Archived Tournaments History';
      case 'public_portal':
      case 'public_overview': return 'Public Live Center';
      case 'admin_dashboard': return 'Platform Superadmin Console';
      case 'purchase_package': return 'Package Licensing';
      case 'tournament_setup_wizard': return 'Setup Wizard';
      default: return 'Tournament Workspace';
    }
  };

  const getUserInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (isLoggedOut) return 'Guest';
    if (currentUser.systemRole === 'PLATFORM_ADMIN') return 'Superadmin';
    if (currentUser.id === 'user-organizer') return 'Owner';
    if (currentUser.id === 'user-manager') return 'Match Official';
    return 'Organizer';
  };

  return (
    <header className="bg-white/90 dark:bg-[#0c101d]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Left: Mobile Drawer Trigger, Desktop Collapse Toggle & Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden transition cursor-pointer"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>

            {/* Breadcrumb / Current View Header */}
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 hidden sm:inline truncate max-w-[140px] md:max-w-[200px] font-athletic">
                {activeTournament.name}
              </span>
              <span className="text-slate-300 dark:text-white/20 hidden sm:inline">/</span>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate font-athletic tracking-wide">
                {getViewTitle()}
              </h2>
              {lifecycleState === 'LIVE' && currentView !== 'organizer_match_control' && (
                <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Live Operations Active
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick Live CTA, Theme Toggle, New Tournament & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Match Shortcut if LIVE */}
            {lifecycleState === 'LIVE' && (
              <button
                type="button"
                onClick={() => setCurrentView('organizer_match_control')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
              >
                <PlayCircle className="w-3.5 h-3.5 animate-pulse" />
                <span>Match Control</span>
              </button>
            )}

            {/* Quick New Tournament Button (Electric blue sports button) */}
            <button
              type="button"
              onClick={() => setIsCreateTournamentModalOpen(true)}
              className="btn-electric inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden md:inline">New Tournament</span>
              <span className="md:hidden">New</span>
            </button>

            {/* Dark Mode / Light Mode Quick Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* User Profile Trigger & Popover */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition cursor-pointer select-none"
              >
                {/* Avatar with Initials */}
                <div className={`w-7 h-7 rounded-lg text-white font-athletic text-xs flex items-center justify-center shadow-xs ${
                  isLoggedOut 
                    ? 'bg-slate-600' 
                    : currentUser.systemRole === 'PLATFORM_ADMIN'
                      ? 'bg-indigo-600'
                      : currentUser.id === 'user-organizer'
                        ? 'bg-blue-600'
                        : 'bg-sky-600'
                }`}>
                  {isLoggedOut ? 'G' : getUserInitials(currentUser.name)}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[110px]">
                    {isLoggedOut ? 'Guest User' : currentUser.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium leading-none">
                    {getRoleLabel()}
                  </span>
                </div>

                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isProfileMenuOpen ? 'rotate-180' : ''
                }`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#121828] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 z-50 p-2 space-y-2.5 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* User Profile Header Card */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl text-white font-athletic text-sm flex items-center justify-center shadow-xs flex-shrink-0 ${
                        isLoggedOut 
                          ? 'bg-slate-600' 
                          : currentUser.systemRole === 'PLATFORM_ADMIN'
                            ? 'bg-indigo-600'
                            : currentUser.id === 'user-organizer'
                              ? 'bg-blue-600'
                              : 'bg-sky-600'
                      }`}>
                        {isLoggedOut ? 'G' : getUserInitials(currentUser.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {isLoggedOut ? 'Guest Spectator' : currentUser.name}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {isLoggedOut ? 'Viewing public live data' : currentUser.email}
                        </p>
                        <div className="mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-blue-300 uppercase tracking-wider">
                            Role: {getRoleLabel()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Theme Selector Pill in Profile Menu */}
                  <div className="px-2 py-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                      Appearance Theme
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          theme === 'light'
                            ? 'bg-white text-slate-900 shadow-xs font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>Light</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Moon className="w-3.5 h-3.5 text-sky-300" />
                        <span>Dark</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          theme === 'system'
                            ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span>System</span>
                      </button>
                    </div>
                  </div>

                  {/* Switch Simulated User Profiles */}
                  <div className="px-2 py-1 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      Switch Simulated Persona
                    </span>
                    {availableUsers.map((u) => {
                      const isCurrent = !isLoggedOut && currentUser.id === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            login(u);
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer flex items-center justify-between ${
                            isCurrent
                              ? 'bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.systemRole === 'PLATFORM_ADMIN' ? 'bg-indigo-500' : 'bg-blue-500'
                            }`} />
                            <span className="truncate">{u.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {u.systemRole === 'PLATFORM_ADMIN' ? 'Admin' : u.id === 'user-organizer' ? 'Owner' : 'Official'}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Shortcuts */}
                  <div className="border-t border-slate-100 dark:border-white/10 pt-1 px-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('organizer_settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                      <span>Workspace Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPricingModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Licensing & Pricing Tiers</span>
                    </button>
                  </div>

                  {/* Log Out / Sign In Button */}
                  <div className="border-t border-slate-100 dark:border-white/10 pt-1 px-1">
                    {!isLoggedOut ? (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of ArenaOps</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-blue-400 hover:bg-blue-500/10 transition cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In / Switch Persona</span>
                      </button>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
