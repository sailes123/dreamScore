import React, { useState, useMemo } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  Calendar, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  PlayCircle, 
  Edit2, 
  Trash2, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { Match, MatchStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { detectSchedulingConflicts, generateTournamentFixtures } from '../../services/fixtureGenerator';

export const FixturesManager: React.FC = () => {
  const { 
    matches, 
    teams, 
    activeTournament, 
    isReadOnly, 
    canOperateLiveMatch,
    addMatch, 
    updateMatch, 
    deleteMatch, 
    setMatches,
    setSelectedMatchId,
    setCurrentView 
  } = useTournament();

  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAutoGenerateModalOpen, setIsAutoGenerateModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Manual Match form states
  const [homeTeamId, setHomeTeamId] = useState(teams[0]?.id || '');
  const [awayTeamId, setAwayTeamId] = useState(teams[1]?.id || '');
  const [stage, setStage] = useState<Match['stage']>('GROUP_STAGE');
  const [roundName, setRoundName] = useState('Matchday 1');
  const [groupId, setGroupId] = useState<'group-a' | 'group-b' | ''>('group-a');
  const [matchNumber, setMatchNumber] = useState(matches.length + 1);
  const [venueName, setVenueName] = useState(activeTournament.venues[0]?.name || 'National Sports Complex Arena');
  const [courtName, setCourtName] = useState('Court 1 (Main Pitch)');
  const [scheduledDate, setScheduledDate] = useState(activeTournament.startDateTime.slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState('10:00');

  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  // Detect scheduling conflicts (Section 16)
  const conflicts = useMemo(() => {
    return detectSchedulingConflicts(matches, teams, activeTournament.matchDurationMinutes);
  }, [matches, teams, activeTournament.matchDurationMinutes]);

  const filteredMatches = matches.filter(m => {
    if (selectedStageFilter === 'ALL') return true;
    return m.stage === selectedStageFilter;
  });

  const openAddModal = () => {
    setHomeTeamId(teams[0]?.id || '');
    setAwayTeamId(teams[1]?.id || '');
    setStage('GROUP_STAGE');
    setRoundName('Group Match');
    setGroupId('group-a');
    setMatchNumber(matches.length + 1);
    setVenueName(activeTournament.venues[0]?.name || 'National Sports Complex Arena');
    setCourtName('Court 1 (Main Pitch)');
    setScheduledDate(activeTournament.startDateTime.slice(0, 10));
    setScheduledTime('10:00');
    setIsAddModalOpen(true);
  };

  const openEditModal = (match: Match) => {
    setEditingMatch(match);
    setHomeTeamId(match.homeTeamId);
    setAwayTeamId(match.awayTeamId);
    setStage(match.stage);
    setRoundName(match.roundName || '');
    setGroupId((match.groupId as any) || '');
    setMatchNumber(match.matchNumber ?? 1);
    setVenueName(match.venueName || '');
    setCourtName(match.courtName || '');
    const d = new Date(match.scheduledAt);
    setScheduledDate(match.scheduledAt.slice(0, 10));
    setScheduledTime(d.toISOString().slice(11, 16));
  };

  const handleSaveMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeTeamId === awayTeamId) {
      alert('Home team and Away team cannot be identical.');
      return;
    }

    const scheduledIso = new Date(`${scheduledDate}T${scheduledTime}:00Z`).toISOString();

    if (editingMatch) {
      updateMatch(editingMatch.id, {
        homeTeamId,
        awayTeamId,
        stage,
        roundName,
        groupId: groupId || undefined,
        matchNumber,
        venueName,
        courtName,
        scheduledAt: scheduledIso
      });
      setEditingMatch(null);
    } else {
      addMatch({
        matchNumber,
        stage,
        roundName,
        groupId: groupId || undefined,
        homeTeamId,
        awayTeamId,
        venueName,
        courtName,
        scheduledAt: scheduledIso,
        homeScore: 0,
        awayScore: 0,
        status: 'SCHEDULED'
      });
      setIsAddModalOpen(false);
    }
  };

  const handleAutoGenerate = () => {
    const generated = generateTournamentFixtures(
      activeTournament.format,
      teams,
      activeTournament.id,
      activeTournament.venues[0]?.name || 'Arena Pitch',
      'Court 1 (Main Pitch)',
      activeTournament.startDateTime,
      activeTournament.matchDurationMinutes
    );
    setMatches(generated);
    setIsAutoGenerateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Fixtures & Match Schedule</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Automated round-robin pairings, group schedules, court allocations, and live score operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Stage Filter */}
          <select
            value={selectedStageFilter}
            onChange={(e) => setSelectedStageFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-2xs"
          >
            <option value="ALL">All Stages ({matches.length})</option>
            <option value="GROUP_STAGE">Group Stage</option>
            <option value="SEMI_FINAL">Semi-Finals</option>
            <option value="FINAL">Grand Final</option>
          </select>

          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => setIsAutoGenerateModalOpen(true)}
                disabled={teams.length < 2}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Auto-Generate
              </button>

              <button
                type="button"
                onClick={openAddModal}
                disabled={teams.length < 2}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Manual Fixture
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scheduling Conflicts Warning Banner (Section 16) */}
      {conflicts.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Scheduling Conflict Warning Detected ({conflicts.length})
              </h4>
              <ul className="mt-1 space-y-1 text-xs text-amber-800">
                {conflicts.map((c, i) => (
                  <li key={i} className="list-disc list-inside">
                    {c.message}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-700 mt-2">
                Recommendation: Edit kickoff times or court slots to avoid back-to-back overlaps for the same team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fixtures Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        {filteredMatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Stage & Round</th>
                  <th className="py-3 px-4">Matchup (Home vs Away)</th>
                  <th className="py-3 px-4">Date & Kickoff</th>
                  <th className="py-3 px-4">Venue & Court</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Court Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredMatches.map((match) => {
                  const isLive = match.status === 'LIVE' || match.status === 'HALFTIME';
                  const isCompleted = match.status === 'COMPLETED';

                  return (
                    <tr 
                      key={match.id} 
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isLive ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                      }`}
                    >
                      
                      {/* Match Number */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-400">
                        {match.matchNumber}
                      </td>

                      {/* Stage / Round */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{match.roundName}</span>
                        {match.groupId && (
                          <span className="text-[10px] text-slate-500 font-medium px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 inline-block mt-0.5">
                            {match.groupId.toUpperCase().replace('-', ' ')}
                          </span>
                        )}
                      </td>

                      {/* Matchup */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {teamMap.get(match.homeTeamId) || match.homeTeamId}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">vs</span>
                          <span className="font-medium text-slate-900">
                            {teamMap.get(match.awayTeamId) || match.awayTeamId}
                          </span>
                        </div>
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {new Date(match.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(match.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Venue & Court */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-800 block truncate max-w-[160px]" title={match.venueName}>
                          {match.courtName}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                          {match.venueName}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        <span className={`px-2.5 py-1 rounded border ${
                          isLive 
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                            : isCompleted 
                              ? 'bg-slate-100 text-slate-900 border-slate-200' 
                              : 'text-slate-400 bg-slate-50 border-slate-200'
                        }`}>
                          {match.homeScore} : {match.awayScore}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={match.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* Court-side scoring trigger */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMatchId(match.id);
                              setCurrentView('organizer_match_control');
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
                              isLive 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                                : canOperateLiveMatch
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title={canOperateLiveMatch ? 'Open court-side match operator' : 'Preview match details (Locked during Preparation)'}
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            {isLive ? 'Control' : canOperateLiveMatch ? 'Start' : 'View Card'}
                          </button>

                          {!isReadOnly && !isLive && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(match)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                                title="Edit schedule"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove fixture Match #${match.matchNumber}?`)) {
                                    deleteMatch(match.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                title="Delete fixture"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No fixtures scheduled"
            description="Generate round-robin pairings or create custom fixtures to set the tournament schedule."
            actionLabel={!isReadOnly && teams.length >= 2 ? 'Auto-Generate Schedule' : undefined}
            onAction={() => setIsAutoGenerateModalOpen(true)}
          />
        )}
      </div>

      {/* Auto-Generate Modal */}
      <Modal
        isOpen={isAutoGenerateModalOpen}
        onClose={() => setIsAutoGenerateModalOpen(false)}
        title="Auto-Generate Tournament Schedule"
        subtitle={`Algorithm: ${activeTournament.format.replace(/_/g, ' ')} (${teams.length} Teams)`}
      >
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
            <p className="text-slate-700">
              This will automatically calculate pairings based on tournament format:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li><strong>Group Stage:</strong> Round-robin pairings inside Group A and Group B</li>
              <li><strong>Knockouts:</strong> Semi-final 1 (1st A vs 2nd B), Semi-final 2 (1st B vs 2nd A), and Grand Final</li>
              <li><strong>Time intervals:</strong> Staggered by {activeTournament.matchDurationMinutes + 15} minutes to avoid court overlaps</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAutoGenerateModalOpen(false)}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate All Fixtures
            </button>
          </div>
        </div>
      </Modal>

      {/* Manual Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || editingMatch !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMatch(null);
        }}
        title={editingMatch ? 'Edit Match Fixture' : 'Create Custom Match'}
        subtitle="Configure teams, schedule, and court pitch"
      >
        <form onSubmit={handleSaveMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Home Team *
              </label>
              <select
                required
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Away Team *
              </label>
              <select
                required
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="GROUP_STAGE">Group Stage</option>
                <option value="QUARTER_FINAL">Quarter-Final</option>
                <option value="SEMI_FINAL">Semi-Final</option>
                <option value="THIRD_PLACE">Third Place Match</option>
                <option value="FINAL">Grand Final</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Round / Matchday Label *
              </label>
              <input
                type="text"
                required
                value={roundName || ''}
                onChange={(e) => setRoundName(e.target.value)}
                placeholder="e.g. Group A · Matchday 1"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Group
              </label>
              <select
                value={groupId || ''}
                onChange={(e) => setGroupId(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="group-a">Group A</option>
                <option value="group-b">Group B</option>
                <option value="">None / Knockout</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Match Number
              </label>
              <input
                type="number"
                required
                min={1}
                value={matchNumber ?? 1}
                onChange={(e) => setMatchNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date (UTC)
              </label>
              <input
                type="date"
                required
                value={scheduledDate || ''}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kickoff Time
              </label>
              <input
                type="time"
                required
                value={scheduledTime || '10:00'}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Court / Pitch
              </label>
              <div className="space-y-1.5">
                <input
                  type="text"
                  required
                  list="tournament-courts-list"
                  value={courtName || ''}
                  onChange={(e) => setCourtName(e.target.value)}
                  placeholder="e.g. Court 1"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                />
                <datalist id="tournament-courts-list">
                  {(activeTournament.venues?.[0]?.courts || ['Court 1']).map((c, i) => (
                    <option key={i} value={c} />
                  ))}
                </datalist>
                {(activeTournament.venues?.[0]?.courts || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(activeTournament.venues?.[0]?.courts || []).map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCourtName(c)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                          courtName === c
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue
              </label>
              <input
                type="text"
                required
                value={venueName || ''}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingMatch(null);
              }}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
            >
              {editingMatch ? 'Save Fixture' : 'Schedule Match'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
