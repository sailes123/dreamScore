import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  CreditCard,
  PlayCircle,
  ShieldAlert,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const OrganizerDashboard: React.FC = () => {
  const { 
    activeTournament, 
    teams, 
    players, 
    matches, 
    lifecycleState, 
    canOperateLiveMatch,
    isReadOnly,
    setCurrentView,
    setSelectedMatchId,
    retentionDaysLeft,
    triggerExcelExport
  } = useTournament();

  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const remainingMatches = matches.filter(m => m.status !== 'COMPLETED' && m.status !== 'CANCELLED');
  const liveMatch = matches.find(m => m.status === 'LIVE' || m.status === 'HALFTIME');
  const nextMatch = liveMatch || remainingMatches[0];

  // Registration fee calculations
  const totalFeesExpected = teams.reduce((acc, t) => acc + t.registrationFee, 0);
  const totalFeesCollected = teams.reduce((acc, t) => acc + t.amountReceived, 0);
  const unpaidTeamsCount = teams.filter(t => t.paymentStatus === 'UNPAID' || t.paymentStatus === 'PARTIALLY_PAID').length;

  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  // Determine what the organizer needs to do next based on state and checklist
  let nextActionTitle = '';
  let nextActionDesc = '';
  let nextActionButton = '';
  let nextActionView = '';

  if (lifecycleState === 'PREPARATION') {
    if (teams.length < activeTournament.numberOfTeams) {
      nextActionTitle = `Register Teams (${teams.length}/${activeTournament.numberOfTeams})`;
      nextActionDesc = `You need ${activeTournament.numberOfTeams - teams.length} more teams to reach the target of ${activeTournament.numberOfTeams}.`;
      nextActionButton = 'Add Teams';
      nextActionView = 'organizer_teams';
    } else if (matches.length === 0) {
      nextActionTitle = 'Generate Fixture Schedule';
      nextActionDesc = 'All teams are registered. Automatically generate round-robin groups and match schedule.';
      nextActionButton = 'Generate Fixtures';
      nextActionView = 'organizer_fixtures';
    } else if (unpaidTeamsCount > 0) {
      nextActionTitle = `Collect Pending Fees (${unpaidTeamsCount} teams)`;
      nextActionDesc = `${unpaidTeamsCount} teams have not completed their full registration payments.`;
      nextActionButton = 'View Payments';
      nextActionView = 'organizer_registration_payments';
    } else {
      nextActionTitle = 'Preparation Complete';
      nextActionDesc = `All ${teams.length} teams and ${matches.length} fixtures are configured. Live match operations unlock on ${new Date(activeTournament.startDateTime).toLocaleDateString()}.`;
      nextActionButton = 'Review Schedule';
      nextActionView = 'organizer_fixtures';
    }
  } else if (lifecycleState === 'LIVE') {
    if (liveMatch) {
      nextActionTitle = `Match #${liveMatch.matchNumber} In Progress`;
      nextActionDesc = `${teamMap.get(liveMatch.homeTeamId)} vs ${teamMap.get(liveMatch.awayTeamId)} (${liveMatch.homeScore} - ${liveMatch.awayScore})`;
      nextActionButton = 'Court-side Control';
      nextActionView = 'organizer_match_control';
    } else if (nextMatch) {
      nextActionTitle = `Ready to Start Match #${nextMatch.matchNumber}`;
      nextActionDesc = `${teamMap.get(nextMatch.homeTeamId)} vs ${teamMap.get(nextMatch.awayTeamId)} · ${nextMatch.roundName}`;
      nextActionButton = 'Start Match';
      nextActionView = 'organizer_match_control';
    } else {
      nextActionTitle = 'All Matches Completed';
      nextActionDesc = 'All tournament matches have been completed. Review standings and generate final export.';
      nextActionButton = 'View Standings';
      nextActionView = 'organizer_standings';
    }
  } else {
    nextActionTitle = 'Tournament Concluded (Read-Only)';
    nextActionDesc = `Operational data is preserved for 7 days retention grace (${retentionDaysLeft} days left). Export is ready.`;
    nextActionButton = 'Download Excel';
    nextActionView = 'organizer_export';
  }

  return (
    <div className="space-y-6">
      
      {/* Preparation Guard Notice (Section 2 Rule) */}
      {lifecycleState === 'PREPARATION' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900">
              Tournament in Preparation Mode
            </h4>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              Match operations will become available when the tournament begins on{' '}
              <strong className="font-semibold">{new Date(activeTournament.startDateTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
              During preparation, you can configure tournament structure, register teams, update rosters, generate fixtures, and track registration payments. Match scoring and live events remain locked.
            </p>
          </div>
        </div>
      )}

      {/* Read-Only Notice if Ended (Section 4 Rule) */}
      {isReadOnly && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-slate-900">
              This tournament has ended. Tournament information is now read-only.
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Operational details are retained for 7 days ({retentionDaysLeft} days remaining) for review and reporting. You can inspect teams, results, standings, and download the full Excel export.
            </p>
          </div>
          <button
            type="button"
            onClick={triggerExcelExport}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Download Excel
          </button>
        </div>
      )}

      {/* "What do I need to do next?" Hero Action Card (Section 24) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/80">
              Next Priority Action
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Live Tournament Operations</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display tracking-tight">{nextActionTitle}</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">{nextActionDesc}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (nextActionView === 'organizer_match_control' && nextMatch) {
              setSelectedMatchId(nextMatch.id);
            }
            if (nextActionView === 'organizer_export') {
              triggerExcelExport();
            } else {
              setCurrentView(nextActionView);
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
        >
          <span>{nextActionButton}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metric Counters Grid (Table-first, Section 24 specs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Teams */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Teams</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">{teams.length}</span>
            <span className="text-xs text-slate-400 font-medium">/ {activeTournament.numberOfTeams}</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{teams.filter(t => t.registrationStatus === 'CONFIRMED').length} Confirmed</span>
            <button 
              type="button" 
              onClick={() => setCurrentView('organizer_teams')}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer transition-colors"
            >
              Manage →
            </button>
          </div>
        </div>

        {/* Players */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Players</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">{players.length}</span>
            <span className="text-xs text-slate-400 font-medium">registered</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Avg {teams.length > 0 ? (players.length / teams.length).toFixed(1) : 0}/squad</span>
            <button 
              type="button" 
              onClick={() => setCurrentView('organizer_players')}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer transition-colors"
            >
              Roster →
            </button>
          </div>
        </div>

        {/* Matches */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Matches</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">{matches.length}</span>
            <span className="text-xs text-slate-400 font-medium">scheduled</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{completedMatches.length} Done</span>
            <span className="text-slate-400 dark:text-slate-500 font-medium">{remainingMatches.length} Pending</span>
          </div>
        </div>

        {/* Registration Fees */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fees Collected</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {totalFeesCollected.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">{activeTournament.currency}</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className={unpaidTeamsCount > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
              {unpaidTeamsCount > 0 ? `${unpaidTeamsCount} pending` : '100% Paid'}
            </span>
            <button 
              type="button" 
              onClick={() => setCurrentView('organizer_registration_payments')}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer transition-colors"
            >
              Details →
            </button>
          </div>
        </div>

      </div>

      {/* Operational Warnings Section (Section 24: "Important warnings") */}
      {unpaidTeamsCount > 0 && (
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h5 className="text-xs font-semibold text-rose-900">
                Action Required: {unpaidTeamsCount} teams have not completed their registration payment
              </h5>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Outstanding balance of {(totalFeesExpected - totalFeesCollected).toLocaleString()} {activeTournament.currency} needs manual verification.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentView('organizer_registration_payments')}
            className="px-3 py-1 bg-white border border-rose-300 text-rose-800 rounded-md text-xs font-medium hover:bg-rose-50 transition cursor-pointer shrink-0"
          >
            Review Accounts
          </button>
        </div>
      )}

      {/* Two Column Grid: Next Match / Live Court & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next Scheduled / Active Match */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {liveMatch ? 'Currently Live on Pitch' : 'Next Scheduled Match'}
              </span>
              {nextMatch && <StatusBadge status={nextMatch.status} size="sm" />}
            </div>

            {nextMatch ? (
              <div className="py-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span>{nextMatch.roundName}</span>
                  <span>{nextMatch.courtName}</span>
                </div>

                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-slate-900">{teamMap.get(nextMatch.homeTeamId)}</p>
                    <span className="text-[11px] text-slate-400">Home Team</span>
                  </div>

                  <div className="text-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xl font-bold font-mono text-slate-900">
                      {nextMatch.homeScore} : {nextMatch.awayScore}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {nextMatch.status === 'LIVE' ? "32' Live" : new Date(nextMatch.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex-1 text-right">
                    <p className="text-sm font-bold text-slate-900">{teamMap.get(nextMatch.awayTeamId)}</p>
                    <span className="text-[11px] text-slate-400">Away Team</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Venue: {nextMatch.venueName}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No fixtures scheduled.</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            {nextMatch && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMatchId(nextMatch.id);
                  setCurrentView('organizer_match_control');
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  canOperateLiveMatch 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                {canOperateLiveMatch ? 'Open Match Control' : 'Preview Match Card (Preparation Mode)'}
              </button>
            )}
          </div>
        </div>

        {/* Recent Results */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Recent Completed Results</span>
              <button
                type="button"
                onClick={() => setCurrentView('organizer_fixtures')}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                All Fixtures →
              </button>
            </div>

            {completedMatches.length > 0 ? (
              <div className="divide-y divide-slate-100 py-1">
                {completedMatches.slice(-3).reverse().map(match => (
                  <div key={match.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex-1">
                      <span className="font-medium text-slate-800">{teamMap.get(match.homeTeamId)}</span>
                      <span className="text-slate-400 text-[10px] block">{match.roundName}</span>
                    </div>
                    <div className="px-2.5 py-1 font-mono font-bold text-slate-900 bg-slate-50 rounded border border-slate-200 text-center mx-2">
                      {match.homeScore} - {match.awayScore}
                    </div>
                    <div className="flex-1 text-right">
                      <span className="font-medium text-slate-800">{teamMap.get(match.awayTeamId)}</span>
                      <span className="text-slate-400 text-[10px] block">Full Time</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No matches completed yet. Completed results will appear here automatically.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Standings update automatically after match completion.</span>
            <button
              type="button"
              onClick={() => setCurrentView('organizer_standings')}
              className="font-medium text-slate-900 hover:underline cursor-pointer"
            >
              View Standings Table →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
