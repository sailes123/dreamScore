"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { ThemeProvider } from './context/ThemeContext';
import { TimeMachineBanner } from './components/layout/TimeMachineBanner';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { OrganizerDashboard } from './components/organizer/OrganizerDashboard';
import { TeamsManager } from './components/organizer/TeamsManager';
import { PlayersManager } from './components/organizer/PlayersManager';
import { FixturesManager } from './components/organizer/FixturesManager';
import { MatchControlScreen } from './components/organizer/MatchControlScreen';
import { StandingsView } from './components/organizer/StandingsView';
import { StatisticsView } from './components/organizer/StatisticsView';
import { RegistrationPaymentsView } from './components/organizer/RegistrationPaymentsView';
import { ExportRetentionView } from './components/organizer/ExportRetentionView';
import { TournamentSettingsView } from './components/organizer/TournamentSettingsView';
import { HistoryView } from './components/organizer/HistoryView';
import { PublicPortalView } from './components/public/PublicPortalView';
import { PricingModal } from './components/pricing/PricingModal';
import { CreateTournamentModal } from './components/organizer/CreateTournamentModal';
import { AuthModal } from './components/common/AuthModal';
import { PlatformAdminView } from './components/admin/PlatformAdminView';

const SIDEBAR_STORAGE_KEY = 'arenaops_sidebar_collapsed';

const AppContent: React.FC = () => {
  const { currentView } = useTournament();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    }
    return false;
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, isSidebarCollapsed ? 'true' : 'false');
  }, [isSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Simulation Bar for Testing Date & Lifecycle Transitions */}
      <TimeMachineBanner />

      {/* Main SaaS Shell: Left Collapsible Sidebar + Right Work Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Collapsible Navigation Sidebar */}
        <Sidebar 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Right Main Column: Top Navbar + Selected View Component */}
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-2.5rem)] overflow-y-auto">
          
          {/* Top Navbar with Profile, Logout, Dark Mode & Actions */}
          <Navbar 
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
          />

          {/* Main Selected Component Canvas */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {(currentView === 'organizer_dashboard' || currentView === 'purchase_package' || currentView === 'tournament_setup_wizard') && <OrganizerDashboard />}
            {currentView === 'organizer_teams' && <TeamsManager />}
            {currentView === 'organizer_players' && <PlayersManager />}
            {currentView === 'organizer_fixtures' && <FixturesManager />}
            {currentView === 'organizer_match_control' && <MatchControlScreen />}
            {currentView === 'organizer_standings' && <StandingsView />}
            {(currentView === 'organizer_statistics' || currentView === 'organizer_stats') && <StatisticsView />}
            {(currentView === 'organizer_registration_payments' || currentView === 'organizer_payments') && <RegistrationPaymentsView />}
            {currentView === 'organizer_export' && <ExportRetentionView />}
            {currentView === 'organizer_settings' && <TournamentSettingsView />}
            {currentView === 'organizer_history' && <HistoryView />}
            {(currentView === 'public_portal' || currentView === 'public_overview') && <PublicPortalView />}
            {currentView === 'admin_dashboard' && <PlatformAdminView />}
          </main>
        </div>

      </div>

      {/* Global Modals */}
      <PricingModal />
      <CreateTournamentModal />
      <AuthModal />

    </div>
  );
};

export default function App({ initialView }: { initialView?: string }) {
  return (
    <ThemeProvider>
      <TournamentProvider initialView={initialView}>
        <AppContent />
      </TournamentProvider>
    </ThemeProvider>
  );
}

