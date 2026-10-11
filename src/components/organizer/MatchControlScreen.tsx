import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Clock, 
  Flag, 
  Award,
  Lock,
  ArrowLeftRight,
  RotateCcw,
  Target,
  Shield,
  Zap,
  Activity,
  UserCheck
} from 'lucide-react';
import { Match, MatchEvent, MatchEventType, Player, SportCode } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

interface QuickActionConfig {
  eventType: MatchEventType;
  label: string;
  points?: number;
  icon: React.ReactNode;
  btnClass: string;
}

export const MatchControlScreen: React.FC = () => {
  const { 
    matches, 
    teams, 
    players, 
    matchEvents, 
    selectedMatchId, 
    setSelectedMatchId,
    activeTournament, 
    lifecycleState,
    canOperateLiveMatch,
    isReadOnly,
    startMatch,
    completeMatch,
    updateMatch,
    updateMatchScore,
    addMatchEvent,
    deleteMatchEvent,
    setCurrentView
  } = useTournament();

  const match = matches.find(m => m.id === selectedMatchId) || matches[0];

  // Active sport from tournament
  const sportCode: SportCode = (activeTournament.sportCode || (activeTournament as any).sportType || 'FUTSAL') as SportCode;

  // Modals state
  const [activeEventModal, setActiveEventModal] = useState<MatchEventType | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [secondaryPlayerId, setSecondaryPlayerId] = useState<string>('');
  const [eventMinute, setEventMinute] = useState<number>(15);
  const [eventPeriod, setEventPeriod] = useState<number>(1);
  const [eventNotes, setEventNotes] = useState('');

  // Substitution Modal state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subTeamId, setSubTeamId] = useState<string>('');
  const [subPlayerOutId, setSubPlayerOutId] = useState<string>('');
  const [subPlayerInId, setSubPlayerInId] = useState<string>('');
  const [subMinute, setSubMinute] = useState<number>(20);
  const [subPeriod, setSubPeriod] = useState<number>(1);
  const [subReason, setSubReason] = useState<string>('Tactical Rotation');

  // End Match in-app confirmation modal state
  const [isConfirmEndModalOpen, setIsConfirmEndModalOpen] = useState(false);

  // Score override modal
  const [isEditScoreModalOpen, setIsEditScoreModalOpen] = useState(false);
  const [editHomeScore, setEditHomeScore] = useState(0);
  const [editAwayScore, setEditAwayScore] = useState(0);

  if (!match) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No match selected.</p>
        <button
          onClick={() => setCurrentView('organizer_fixtures')}
          className="mt-3 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium"
        >
          Return to Fixtures
        </button>
      </div>
    );
  }

  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);

  const homePlayers = players.filter(p => p.teamId === match.homeTeamId);
  const awayPlayers = players.filter(p => p.teamId === match.awayTeamId);

  const currentMatchEvents = matchEvents
    .filter(e => e.matchId === match.id)
    .sort((a, b) => b.minute - a.minute);

  const playerMap = new Map<string, Player>();
  players.forEach(p => playerMap.set(p.id, p));

  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const isMatchLive = match.status === 'LIVE' || match.status === 'HALFTIME';
  const isMatchCompleted = match.status === 'COMPLETED';

  // Sport-specific event actions builder
  const getSportActions = (code: SportCode): QuickActionConfig[] => {
    switch (code) {
      case 'CRICKET':
        return [
          { eventType: 'RUN_1', label: '+1 Single Run', points: 1, icon: <Activity className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'RUN_2', label: '+2 Double Runs', points: 2, icon: <Activity className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'BOUNDARY_4', label: '+4 Boundary Four', points: 4, icon: <Zap className="w-4 h-4 text-sky-600" />, btnClass: 'border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 text-sky-900' },
          { eventType: 'BOUNDARY_6', label: '+6 Maximum Six', points: 6, icon: <Award className="w-4 h-4 text-indigo-600" />, btnClass: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900' },
          { eventType: 'EXTRA_RUN', label: '+1 Extra / Wide', points: 1, icon: <Plus className="w-4 h-4 text-slate-600" />, btnClass: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900' },
          { eventType: 'WICKET', label: '+ Wicket Dismissal', icon: <Target className="w-4 h-4 text-rose-600" />, btnClass: 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-900' },
        ];
      case 'BASKETBALL':
        return [
          { eventType: 'FIELD_GOAL_2PT', label: '+2 PTS Field Goal', points: 2, icon: <Award className="w-4 h-4 text-orange-600" />, btnClass: 'border-orange-200 bg-orange-50/50 hover:bg-orange-100/70 text-orange-900' },
          { eventType: 'FIELD_GOAL_3PT', label: '+3 PTS 3-Pointer', points: 3, icon: <Zap className="w-4 h-4 text-indigo-600" />, btnClass: 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900' },
          { eventType: 'FREE_THROW', label: '+1 PT Free Throw', points: 1, icon: <Plus className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'FOUL', label: '+ Personal Foul', icon: <Flag className="w-4 h-4 text-slate-600" />, btnClass: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900' },
          { eventType: 'TIMEOUT', label: 'Timeout Called', icon: <Clock className="w-4 h-4 text-amber-600" />, btnClass: 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900' },
        ];
      case 'VOLLEYBALL':
        return [
          { eventType: 'POINT_ATTACK', label: '+ Spike Kill Point', points: 1, icon: <Zap className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'POINT_BLOCK', label: '+ Block Point', points: 1, icon: <Shield className="w-4 h-4 text-sky-600" />, btnClass: 'border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 text-sky-900' },
          { eventType: 'POINT_ACE', label: '+ Service Ace', points: 1, icon: <Award className="w-4 h-4 text-purple-600" />, btnClass: 'border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900' },
          { eventType: 'OPPONENT_ERROR', label: '+ Opponent Error', points: 1, icon: <Plus className="w-4 h-4 text-slate-600" />, btnClass: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900' },
          { eventType: 'FAULT', label: '+ Net / Line Fault', icon: <Flag className="w-4 h-4 text-amber-600" />, btnClass: 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900' },
        ];
      case 'BADMINTON':
      case 'TABLE_TENNIS':
        return [
          { eventType: 'POINT_WINNER', label: '+ Winner Point', points: 1, icon: <Award className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'POINT_ACE', label: '+ Service Ace', points: 1, icon: <Zap className="w-4 h-4 text-purple-600" />, btnClass: 'border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900' },
          { eventType: 'OPPONENT_ERROR', label: '+ Opponent Error', points: 1, icon: <Plus className="w-4 h-4 text-slate-600" />, btnClass: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900' },
          { eventType: 'FAULT', label: '+ Fault Infraction', icon: <Flag className="w-4 h-4 text-amber-600" />, btnClass: 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900' },
        ];
      case 'MARATHON':
        return [
          { eventType: 'CHECKPOINT', label: '+ Checkpoint Pass', icon: <Target className="w-4 h-4 text-sky-600" />, btnClass: 'border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 text-sky-900' },
          { eventType: 'FINISH_RANK', label: '+ Runner Finished', points: 1, icon: <Award className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'DNF', label: '+ DNF (Did Not Finish)', icon: <AlertCircle className="w-4 h-4 text-rose-600" />, btnClass: 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-900' },
        ];
      case 'FOOTBALL':
        return [
          { eventType: 'GOAL', label: '+ Goal & Assist', points: 1, icon: <Award className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'PENALTY_GOAL', label: '+ Penalty Goal', points: 1, icon: <Target className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'YELLOW_CARD', label: '+ Yellow Card', icon: <div className="w-3.5 h-4.5 bg-amber-400 rounded-xs border border-amber-500" />, btnClass: 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900' },
          { eventType: 'RED_CARD', label: '+ Red Card', icon: <div className="w-3.5 h-4.5 bg-rose-600 rounded-xs border border-rose-700" />, btnClass: 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-900' },
          { eventType: 'FOUL', label: '+ Foul / Infraction', icon: <Flag className="w-4 h-4 text-slate-600" />, btnClass: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900' },
        ];
      case 'FUTSAL':
      default:
        return [
          { eventType: 'GOAL', label: '+ Goal & Assist', points: 1, icon: <Award className="w-4 h-4 text-emerald-600" />, btnClass: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900' },
          { eventType: 'YELLOW_CARD', label: '+ Yellow Card', icon: <div className="w-3.5 h-4.5 bg-amber-400 rounded-xs border border-amber-500" />, btnClass: 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-amber-900' },
          { eventType: 'RED_CARD', label: '+ Red Card', icon: <div className="w-3.5 h-4.5 bg-rose-600 rounded-xs border border-rose-700" />, btnClass: 'border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-900' },
          { eventType: 'FOUL', label: '+ Accumulated Foul', icon: <Flag className="w-4 h-4 text-slate-600" />, btnClass: 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-900' },
        ];
    }
  };

  const currentSportActions = getSportActions(sportCode);

  const openEventModal = (type: MatchEventType) => {
    setActiveEventModal(type);
    setSelectedTeamId(match.homeTeamId);
    setSelectedPlayerId(homePlayers[0]?.id || '');
    setSecondaryPlayerId('');
    setEventMinute(match.currentMinute || 20);
    setEventPeriod(match.currentPeriod || 1);
    setEventNotes('');
  };

  const openSubModal = () => {
    const initTeamId = match.homeTeamId;
    const teamPlayers = homePlayers;
    setSubTeamId(initTeamId);
    setSubPlayerOutId(teamPlayers[0]?.id || '');
    setSubPlayerInId(teamPlayers[1]?.id || teamPlayers[0]?.id || '');
    setSubMinute(match.currentMinute || 20);
    setSubPeriod(match.currentPeriod || 1);
    setSubReason('Tactical Substitution');
    setIsSubModalOpen(true);
  };

  const handleRecordEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventModal || !selectedPlayerId) return;

    addMatchEvent({
      matchId: match.id,
      teamId: selectedTeamId,
      playerId: selectedPlayerId,
      secondaryPlayerId: secondaryPlayerId || undefined,
      eventType: activeEventModal,
      minute: Number(eventMinute),
      period: Number(eventPeriod),
      notes: eventNotes || undefined
    });

    setActiveEventModal(null);
  };

  const handleRecordSubstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subPlayerInId || !subPlayerOutId) return;

    addMatchEvent({
      matchId: match.id,
      teamId: subTeamId,
      playerId: subPlayerInId, // Player coming IN
      secondaryPlayerId: subPlayerOutId, // Player coming OUT
      eventType: 'SUBSTITUTION',
      minute: Number(subMinute),
      period: Number(subPeriod),
      notes: subReason || 'Substitution'
    });

    setIsSubModalOpen(false);
  };

  const handleConfirmEndMatch = () => {
    completeMatch(match.id);
    setIsConfirmEndModalOpen(false);
  };

  const handleReopenMatch = () => {
    updateMatch(match.id, { 
      status: 'LIVE',
      actualEnd: undefined 
    });
  };

  const handleManualScoreUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMatchScore(match.id, editHomeScore, editAwayScore);
    setIsEditScoreModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top navigation bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentView('organizer_fixtures')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Fixtures
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
            {sportCode}
          </span>
          <span className="text-xs text-slate-500 font-medium">{match.roundName}</span>
          <StatusBadge status={match.status} />
        </div>
      </div>

      {/* Completed Match Banner */}
      {isMatchCompleted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Match Finished (Full Time)
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Final Result: <strong>{homeTeam?.name} {match.homeScore} — {match.awayScore} {awayTeam?.name}</strong>. Standings and player statistics are finalized.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReopenMatch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition cursor-pointer shrink-0 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Re-open Match
          </button>
        </div>
      )}

      {/* Preparation Guard Notice if match is not playable yet */}
      {!canOperateLiveMatch && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Match Operations Locked
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Tournament lifecycle state is currently in preparation. To test live operations, use the simulated date control in the top bar.
            </p>
          </div>
        </div>
      )}

      {/* Main Scoreboard Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-all">
        
        {/* Court / Match Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {match.venueName} · <span className="text-slate-900 dark:text-white font-bold">{match.courtName || 'Court 1'}</span>
          </span>
          <span className="font-mono">
            Scheduled: {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Live Score Display */}
        <div className="py-6 flex items-center justify-between gap-4">
          
          {/* Home Team */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-1">
              <div 
                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" 
                style={{ backgroundColor: homeTeam?.primaryColor || '#0284c7' }} 
              />
              <span className="text-sm md:text-lg font-bold text-slate-900 dark:text-white block truncate">
                {homeTeam?.name || 'Home Team'}
              </span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono block">Home</span>
          </div>

          {/* Score Numbers */}
          <div className="text-center px-6 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-inner min-w-[140px] border border-slate-800 dark:border-slate-700">
            <div className="text-3xl md:text-5xl font-bold font-mono tracking-wider flex items-center justify-center gap-3">
              <span>{match.homeScore}</span>
              <span className="text-slate-600 dark:text-slate-400">:</span>
              <span>{match.awayScore}</span>
            </div>
            <div className="text-[11px] text-slate-300 dark:text-slate-300 font-mono mt-1 uppercase tracking-wider flex items-center justify-center gap-1.5">
              {isMatchLive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>Period {match.currentPeriod || 1} · {match.currentMinute || 20}&apos;</span>
                </>
              ) : isMatchCompleted ? (
                <span className="text-emerald-400 font-bold">Full Time</span>
              ) : (
                <span>Not Started</span>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2.5 mb-1">
              <span className="text-sm md:text-lg font-bold text-slate-900 dark:text-white block truncate">
                {awayTeam?.name || 'Away Team'}
              </span>
              <div 
                className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700 shrink-0" 
                style={{ backgroundColor: awayTeam?.primaryColor || '#dc2626' }} 
              />
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono block">Away</span>
          </div>

        </div>

        {/* Primary Match Status Controls */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 flex-wrap">
            {canOperateLiveMatch && match.status === 'SCHEDULED' && (
              <button
                type="button"
                onClick={() => startMatch(match.id)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <PlayCircle className="w-4 h-4" />
                Start Match
              </button>
            )}

            {/* End Match button with clean in-app confirmation */}
            {canOperateLiveMatch && !isMatchCompleted && (
              <button
                type="button"
                onClick={() => setIsConfirmEndModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                End Match (Full Time)
              </button>
            )}

            {canOperateLiveMatch && (
              <button
                type="button"
                onClick={() => {
                  setEditHomeScore(match.homeScore);
                  setEditAwayScore(match.awayScore);
                  setIsEditScoreModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 transition cursor-pointer"
              >
                Direct Score Override
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Format: {activeTournament.format.replace(/_/g, ' ')} · {activeTournament.matchDurationMinutes} min
          </div>
        </div>

      </div>

      {/* Quick Event Actions (Tailored by Sport) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Quick Match Event Actions ({sportCode})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Instant court-side recording. Scores and statistics update in real-time.
            </p>
          </div>

          {/* Quick Substitution Button */}
          <button
            type="button"
            disabled={!canOperateLiveMatch || isMatchCompleted}
            onClick={openSubModal}
            className="px-3 py-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowLeftRight className="w-4 h-4 text-purple-600" />
            <span>+ Record Substitution</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {currentSportActions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              disabled={!canOperateLiveMatch || isMatchCompleted}
              onClick={() => openEventModal(action.eventType)}
              className={`p-3 rounded-lg border font-semibold text-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-1.5 shadow-2xs ${action.btnClass}`}
            >
              {action.icon}
              <span className="truncate text-center">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Match Event Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Live Match Timeline ({currentMatchEvents.length} Events)
          </h3>
          <span className="text-[11px] text-slate-400">Chronological Event Log</span>
        </div>

        {currentMatchEvents.length > 0 ? (
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {currentMatchEvents.map((event) => {
              const player = playerMap.get(event.playerId);
              const secondaryPlayer = event.secondaryPlayerId ? playerMap.get(event.secondaryPlayerId) : null;
              const teamName = teamMap.get(event.teamId);

              const isSub = event.eventType === 'SUBSTITUTION';

              let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
              if (event.eventType === 'GOAL' || event.eventType === 'PENALTY_GOAL' || event.eventType === 'BOUNDARY_4' || event.eventType === 'BOUNDARY_6') {
                badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
              } else if (event.eventType === 'YELLOW_CARD') {
                badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
              } else if (event.eventType === 'RED_CARD' || event.eventType === 'WICKET') {
                badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
              } else if (isSub) {
                badgeColor = 'bg-purple-100 text-purple-800 border-purple-300';
              }

              return (
                <div key={event.id} className="relative flex items-center justify-between group">
                  
                  {/* Timeline dot */}
                  <div className="absolute -left-[19px] w-3 h-3 rounded-full bg-white border-2 border-slate-400 group-hover:border-slate-800" />

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-xs text-slate-900 min-w-[32px]">
                      {event.minute}&apos;
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wider ${badgeColor}`}>
                      {event.eventType.replace(/_/g, ' ')}
                    </span>

                    <div className="text-xs">
                      {isSub ? (
                        <span className="font-semibold text-purple-950 flex items-center gap-1.5 flex-wrap">
                          <span className="text-emerald-700 font-bold">▲ {player?.displayName || 'Incoming Player'}</span>
                          <span className="text-slate-400 text-[10px]">REPLACED</span>
                          <span className="text-rose-700 font-bold">▼ {secondaryPlayer?.displayName || 'Outgoing Player'}</span>
                          {event.notes && <span className="text-slate-500 font-normal italic">({event.notes})</span>}
                        </span>
                      ) : (
                        <>
                          <span className="font-semibold text-slate-900">
                            {player?.displayName || 'Player'}
                          </span>
                          {secondaryPlayer && (
                            <span className="text-slate-500 ml-1">
                              (Assist: {secondaryPlayer.displayName})
                            </span>
                          )}
                          {event.notes && (
                            <span className="text-slate-400 ml-1 italic">
                              · {event.notes}
                            </span>
                          )}
                        </>
                      )}
                      <span className="text-slate-400 text-[11px] ml-2 font-medium">
                        — {teamName}
                      </span>
                    </div>
                  </div>

                  {canOperateLiveMatch && !isReadOnly && (
                    <button
                      type="button"
                      onClick={() => deleteMatchEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Undo / Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            No match events recorded yet. Use the quick action buttons above to record scoring and events.
          </p>
        )}
      </div>

      {/* Record Match Event Modal */}
      <Modal
        isOpen={activeEventModal !== null}
        onClose={() => setActiveEventModal(null)}
        title={`Record ${activeEventModal?.replace(/_/g, ' ')}`}
        subtitle={`Match #${match.matchNumber}: ${homeTeam?.name} vs ${awayTeam?.name}`}
      >
        <form onSubmit={handleRecordEvent} className="space-y-4">
          
          {/* Select Team */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Team *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTeamId(match.homeTeamId);
                  setSelectedPlayerId(homePlayers[0]?.id || '');
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition cursor-pointer ${
                  selectedTeamId === match.homeTeamId 
                    ? 'border-slate-900 bg-slate-50 text-slate-900' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: homeTeam?.primaryColor }} />
                  <span className="truncate">{homeTeam?.name}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedTeamId(match.awayTeamId);
                  setSelectedPlayerId(awayPlayers[0]?.id || '');
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition cursor-pointer ${
                  selectedTeamId === match.awayTeamId 
                    ? 'border-slate-900 bg-slate-50 text-slate-900' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: awayTeam?.primaryColor }} />
                  <span className="truncate">{awayTeam?.name}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Primary Player */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Player *
            </label>
            <select
              required
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {(selectedTeamId === match.homeTeamId ? homePlayers : awayPlayers).map(p => (
                <option key={p.id} value={p.id}>
                  #{p.jerseyNumber} — {p.displayName} ({p.position})
                </option>
              ))}
            </select>
          </div>

          {/* Secondary Player (Assist Provider if Goal) */}
          {(activeEventModal === 'GOAL' || activeEventModal === 'PENALTY_GOAL') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assist Provider (Optional)
              </label>
              <select
                value={secondaryPlayerId}
                onChange={(e) => setSecondaryPlayerId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="">None (Solo / unassisted)</option>
                {(selectedTeamId === match.homeTeamId ? homePlayers : awayPlayers)
                  .filter(p => p.id !== selectedPlayerId)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      #{p.jerseyNumber} — {p.displayName}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Minute & Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Match Minute *
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={eventMinute ?? 1}
                onChange={(e) => setEventMinute(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Period / Half
              </label>
              <select
                value={eventPeriod}
                onChange={(e) => setEventPeriod(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value={1}>1st Period / Half</option>
                <option value={2}>2nd Period / Half</option>
                <option value={3}>3rd Period</option>
                <option value={4}>4th Period / Extra</option>
              </select>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Notes (Optional)
            </label>
            <input
              type="text"
              value={eventNotes}
              onChange={(e) => setEventNotes(e.target.value)}
              placeholder="e.g. Header, Free kick, Unforced error"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveEventModal(null)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
            >
              Confirm & Record Event
            </button>
          </div>
        </form>
      </Modal>

      {/* Substitution Dedicated Modal */}
      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title="Record Player Substitution"
        subtitle={`Match #${match.matchNumber}: ${homeTeam?.name} vs ${awayTeam?.name}`}
      >
        <form onSubmit={handleRecordSubstitution} className="space-y-4">
          
          {/* Select Team */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Team Making Substitution *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubTeamId(match.homeTeamId);
                  setSubPlayerOutId(homePlayers[0]?.id || '');
                  setSubPlayerInId(homePlayers[1]?.id || homePlayers[0]?.id || '');
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition cursor-pointer ${
                  subTeamId === match.homeTeamId 
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: homeTeam?.primaryColor }} />
                  <span className="truncate">{homeTeam?.name}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubTeamId(match.awayTeamId);
                  setSubPlayerOutId(awayPlayers[0]?.id || '');
                  setSubPlayerInId(awayPlayers[1]?.id || awayPlayers[0]?.id || '');
                }}
                className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition cursor-pointer ${
                  subTeamId === match.awayTeamId 
                    ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: awayTeam?.primaryColor }} />
                  <span className="truncate">{awayTeam?.name}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Sub Out and Sub In Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/40">
              <label className="block text-xs font-bold text-rose-800 mb-1 flex items-center gap-1">
                <span>▼ Player Coming OFF (Out) *</span>
              </label>
              <select
                required
                value={subPlayerOutId}
                onChange={(e) => setSubPlayerOutId(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-rose-300 rounded-lg bg-white"
              >
                {(subTeamId === match.homeTeamId ? homePlayers : awayPlayers).map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} — {p.displayName} ({p.position})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                <span>▲ Player Coming ON (In) *</span>
              </label>
              <select
                required
                value={subPlayerInId}
                onChange={(e) => setSubPlayerInId(e.target.value)}
                className="w-full px-2.5 py-2 text-xs border border-emerald-300 rounded-lg bg-white"
              >
                {(subTeamId === match.homeTeamId ? homePlayers : awayPlayers).map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.jerseyNumber} — {p.displayName} ({p.position})
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Minute & Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Match Minute *
              </label>
              <input
                type="number"
                required
                min={1}
                max={120}
                value={subMinute ?? 1}
                onChange={(e) => setSubMinute(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Period / Half
              </label>
              <select
                value={subPeriod}
                onChange={(e) => setSubPeriod(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value={1}>1st Half / Period</option>
                <option value={2}>2nd Half / Period</option>
                <option value={3}>Extra Time</option>
              </select>
            </div>
          </div>

          {/* Reason / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Substitution Type / Reason
            </label>
            <input
              type="text"
              value={subReason}
              onChange={(e) => setSubReason(e.target.value)}
              placeholder="e.g. Tactical, Injury, Fatigue"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSubModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-900 hover:bg-purple-800 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Confirm Substitution
            </button>
          </div>
        </form>
      </Modal>

      {/* In-App End Match Confirmation Modal (No window.confirm!) */}
      <Modal
        isOpen={isConfirmEndModalOpen}
        onClose={() => setIsConfirmEndModalOpen(false)}
        title="Finalize & End Match"
        subtitle={`Match #${match.matchNumber}: ${homeTeam?.name} vs ${awayTeam?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 text-white text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">
              Current Final Score
            </span>
            <div className="text-3xl font-bold font-mono">
              {match.homeScore} : {match.awayScore}
            </div>
            <div className="text-xs text-slate-300 mt-2 font-medium">
              {homeTeam?.name} ({match.homeScore}) vs {awayTeam?.name} ({match.awayScore})
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Ending this match will mark the fixture as <strong>Completed (Full Time)</strong>.
            The final score will be locked, and tournament standings, points, and player stats will be immediately updated.
          </p>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConfirmEndModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmEndMatch}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & End Match
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Score Override Modal */}
      <Modal
        isOpen={isEditScoreModalOpen}
        onClose={() => setIsEditScoreModalOpen(false)}
        title="Direct Score Override"
        subtitle="Adjust scoreboard numbers manually if needed"
      >
        <form onSubmit={handleManualScoreUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 truncate">
                {homeTeam?.name}
              </label>
              <input
                type="number"
                min={0}
                value={editHomeScore ?? 0}
                onChange={(e) => setEditHomeScore(Number(e.target.value))}
                className="w-full py-3 text-2xl font-bold font-mono text-center border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 truncate">
                {awayTeam?.name}
              </label>
              <input
                type="number"
                min={0}
                value={editAwayScore ?? 0}
                onChange={(e) => setEditAwayScore(Number(e.target.value))}
                className="w-full py-3 text-2xl font-bold font-mono text-center border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditScoreModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
            >
              Save New Score
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
