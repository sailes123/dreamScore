import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Award, 
  Users, 
  Share2, 
  Check, 
  Sparkles, 
  ExternalLink 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { calculateStandings } from '../../services/standingsCalculator';

export const PublicPortalView: React.FC = () => {
  const { 
    activeTournament, 
    teams, 
    matches, 
    players, 
    playerStats, 
    lifecycleState,
    setCurrentView 
  } = useTournament();

  const [activeTab, setActiveTab] = useState<'MATCHES' | 'STANDINGS' | 'STATS' | 'TEAMS'>('MATCHES');
  const [copiedLink, setCopiedLink] = useState(false);

  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const groupAStandings = calculateStandings(
    teams,
    matches,
    activeTournament.pointsForWin,
    activeTournament.pointsForDraw,
    activeTournament.pointsForLoss,
    'group-a'
  );

  const groupBStandings = calculateStandings(
    teams,
    matches,
    activeTournament.pointsForWin,
    activeTournament.pointsForDraw,
    activeTournament.pointsForLoss,
    'group-b'
  );

  const topScorers = [...playerStats].sort((a, b) => b.goals - a.goals).slice(0, 10);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Public Hero Header with Sports Vibe */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12192e] via-[#0d1322] to-[#0a0e19] text-white p-6 sm:p-8 border border-white/10 shadow-2xl">
        {/* Ambient Electric Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[11px] font-bold tracking-wider uppercase border border-blue-500/30">
                ⚽ {activeTournament.sportType}
              </span>
              <StatusBadge status={lifecycleState} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-athletic">
              {activeTournament.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-sans">
              {activeTournament.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-electric inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold tracking-wide cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Live Portal'}</span>
            </button>
          </div>
        </div>

        {/* Quick Venue & Schedule Capsule Info */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Venue</span>
            <span className="font-bold text-white block mt-0.5 truncate">{activeTournament.venues[0]?.name}</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Tournament Dates</span>
            <span className="font-bold text-white block mt-0.5 truncate">
              {new Date(activeTournament.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(activeTournament.endDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Format</span>
            <span className="font-bold text-white block mt-0.5 truncate">{activeTournament.format.replace(/_/g, ' ')}</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Lobbies</span>
            <span className="font-bold text-blue-400 block mt-0.5 truncate">{teams.length} Teams Registered</span>
          </div>
        </div>
      </div>

      {/* Navigation Capsule Bar (Matching uploaded UI reference "Select lobbies: Public | Private") */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="tab-pill-container overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('MATCHES')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'MATCHES' ? 'tab-pill-active' : 'tab-pill-inactive'
            }`}
          >
            Matches & Fixtures ({matches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STANDINGS')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'STANDINGS' ? 'tab-pill-active' : 'tab-pill-inactive'
            }`}
          >
            Standings Table
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STATS')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'STATS' ? 'tab-pill-active' : 'tab-pill-inactive'
            }`}
          >
            Top Scorers & Awards
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TEAMS')}
            className={`px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'TEAMS' ? 'tab-pill-active' : 'tab-pill-inactive'
            }`}
          >
            Teams & Rosters ({teams.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'MATCHES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-athletic uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Season Fixtures & Results
            </h2>
            <span className="text-xs text-slate-500 font-mono">2026/2027</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => {
              const home = teams.find(t => t.id === m.homeTeamId);
              const away = teams.find(t => t.id === m.awayTeamId);
              const isLive = m.status === 'LIVE' || m.status === 'HALFTIME';
              const isCompleted = m.status === 'COMPLETED';

              return (
                <div 
                  key={m.id} 
                  className={`relative overflow-hidden card-sport p-5 transition-all duration-200 hover:border-blue-500/40 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] ${
                    isLive 
                      ? 'border-blue-500/60 ring-2 ring-blue-500/25 bg-[#141b2f]' 
                      : ''
                  }`}
                >
                  {/* Top League / Stage Bar */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {m.roundName} · {activeTournament.sportType}
                    </span>
                    <StatusBadge status={m.status} size="sm" />
                  </div>

                  {/* Matchup Center Section (Leicester vs Liverpool style) */}
                  <div className="py-4 flex items-center justify-between gap-3">
                    {/* Home Team */}
                    <div className="flex-1 flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-athletic text-sm text-white shadow-md mb-2 shrink-0 border border-white/10"
                        style={{ backgroundColor: home?.primaryColor || '#1e40af' }}>
                        {home?.shortName || 'H'}
                      </div>
                      <span className="font-athletic text-sm sm:text-base text-slate-900 dark:text-white truncate block w-full">
                        {home?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Home</span>
                    </div>

                    {/* Central Score & Date Badge */}
                    <div className="flex flex-col items-center justify-center px-4 py-2 bg-[#0e1322] border border-white/10 rounded-2xl min-w-[100px] shadow-inner">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                        {isLive ? 'LIVE' : isCompleted ? 'FT' : 'VS'}
                      </span>
                      {isLive || isCompleted ? (
                        <div className="font-athletic text-2xl sm:text-3xl text-white font-extrabold tracking-wider">
                          {m.homeScore} : {m.awayScore}
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-blue-400 font-mono py-1">
                          {new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(m.scheduledAt).toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex-1 flex flex-col items-center sm:items-end text-center sm:text-right min-w-0">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-athletic text-sm text-white shadow-md mb-2 shrink-0 border border-white/10"
                        style={{ backgroundColor: away?.primaryColor || '#dc2626' }}>
                        {away?.shortName || 'A'}
                      </div>
                      <span className="font-athletic text-sm sm:text-base text-slate-900 dark:text-white truncate block w-full">
                        {away?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Away</span>
                    </div>
                  </div>

                  {/* Pitch / Court Footer */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      {m.courtName}
                    </span>
                    <span className="font-mono text-slate-500">{m.venueName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'STANDINGS' && (
        <div className="space-y-6">
          {[
            { title: 'Group A Table', list: groupAStandings },
            { title: 'Group B Table', list: groupBStandings }
          ].map(({ title, list }) => (
            <div key={title} className="card-sport overflow-hidden">
              <div className="px-5 py-4 bg-[#0d1222] border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-athletic uppercase tracking-wider text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-blue-400" />
                  {title}
                </h3>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  Top 2 Advance
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-white/5 text-slate-400 font-bold border-b border-white/5 text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">Pos</th>
                      <th className="py-3 px-4">Club / Team</th>
                      <th className="py-3 px-3 text-center">P</th>
                      <th className="py-3 px-3 text-center">W</th>
                      <th className="py-3 px-3 text-center">D</th>
                      <th className="py-3 px-3 text-center">L</th>
                      <th className="py-3 px-3 text-center">GD</th>
                      <th className="py-3 px-5 text-center font-bold text-white font-mono">PTS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {list.map((row, idx) => (
                      <tr key={row.teamId} className={`hover:bg-white/5 transition-colors ${idx < 2 ? 'bg-blue-600/5' : ''}`}>
                        <td className="py-3 px-4 text-center">
                          <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-athletic text-xs ${
                            idx === 0 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : idx === 1 
                                ? 'bg-blue-500/20 text-blue-300' 
                                : 'text-slate-400 font-mono'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white font-athletic text-sm">{row.teamName}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{row.played}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{row.won}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{row.drawn}</td>
                        <td className="py-3 px-3 text-center font-mono text-slate-400">{row.lost}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-3 px-5 text-center font-mono font-extrabold text-blue-400 text-sm bg-white/5">
                          {row.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'STATS' && (
        <div className="space-y-6">
          {/* Featured Top Player Spotlight (Exact replica of Jamie Vardy Hero Card in reference image) */}
          {topScorers.length > 0 && (() => {
            const leader = topScorers[0];
            const leaderTeam = teams.find(t => t.name === leader.teamName);
            return (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b3ea8] via-[#122b7a] to-[#0a153a] text-white p-6 sm:p-8 border border-blue-400/30 shadow-2xl">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-6">
                  {/* Player Identity */}
                  <div className="space-y-2 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold uppercase tracking-wider text-blue-200">
                      <span>⚽ {leaderTeam?.shortName || 'LEI'}</span>
                      <span>•</span>
                      <span>Golden Boot Leader</span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl font-extrabold font-athletic tracking-tight text-white drop-shadow-md">
                      {leader.displayName}
                    </h2>
                    <p className="text-xs sm:text-sm text-blue-200 font-medium">
                      forward, #{leader.jerseyNumber} · {leader.teamName}
                    </p>
                  </div>

                  {/* Player Avatar / Kit Display */}
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 p-1 shadow-2xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#0e1630] flex flex-col items-center justify-center border border-white/20">
                        <span className="text-2xl sm:text-3xl font-athletic text-white">#{leader.jerseyNumber}</span>
                        <span className="text-[10px] uppercase font-bold text-blue-300 font-mono">{leaderTeam?.shortName || 'PRO'}</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center shadow-lg border-2 border-[#122b7a]">
                      🥇
                    </div>
                  </div>
                </div>

                {/* Capsule Stat Metric Widget (Exact Jamie Vardy 9 goals | 1 assists | 16 matches | 6 wins strip) */}
                <div className="relative z-10 metric-capsule p-4 grid grid-cols-4 divide-x divide-white/10 text-center shadow-xl">
                  <div>
                    <span className="font-athletic text-2xl sm:text-4xl text-white font-extrabold block">
                      {leader.goals}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">
                      goals
                    </span>
                  </div>
                  <div>
                    <span className="font-athletic text-2xl sm:text-4xl text-white font-extrabold block">
                      {leader.assists}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">
                      assists
                    </span>
                  </div>
                  <div>
                    <span className="font-athletic text-2xl sm:text-4xl text-white font-extrabold block">
                      {leader.yellowCards}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">
                      cards
                    </span>
                  </div>
                  <div>
                    <span className="font-athletic text-2xl sm:text-4xl text-white font-extrabold block">
                      {leader.redCards}
                    </span>
                    <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">
                      reds
                    </span>
                  </div>
                </div>

                {/* Sub-nav Tabs (Overview | Stats | Matches) */}
                <div className="relative z-10 flex items-center justify-center md:justify-start gap-8 pt-6 border-t border-white/10 text-xs font-bold tracking-wider uppercase">
                  <span className="text-slate-400 hover:text-white cursor-pointer transition">Overview</span>
                  <span className="text-white font-athletic border-b-2 border-blue-400 pb-1 cursor-pointer">Stats & Records</span>
                  <span className="text-slate-400 hover:text-white cursor-pointer transition">Matches</span>
                </div>
              </div>
            );
          })()}

          {/* Leaderboard Table (with highlighted user row like Thomas Anderson 500 pts in reference image) */}
          <div className="card-sport overflow-hidden">
            <div className="px-5 py-4 bg-[#0d1222] border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-athletic uppercase tracking-wider text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Tournament Golden Boot Leaderboard
              </h3>
              <span className="text-xs text-slate-400 font-mono">Top Goalscorers</span>
            </div>

            <div className="divide-y divide-white/5 text-xs">
              {topScorers.map((p, idx) => {
                // Give top 3 or selected user the glowing electric blue row style from screenshot
                const isHighlighted = idx === 0;

                return (
                  <div 
                    key={p.playerId} 
                    className={`px-5 py-4 flex items-center justify-between transition-colors ${
                      isHighlighted 
                        ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg' 
                        : 'hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-athletic text-xs ${
                        isHighlighted 
                          ? 'bg-white text-blue-700 font-extrabold shadow-sm' 
                          : idx === 1 
                            ? 'bg-amber-400/20 text-amber-300 font-bold'
                            : idx === 2 
                              ? 'bg-slate-400/20 text-slate-300 font-bold'
                              : 'text-slate-500 font-mono'
                      }`}>
                        {idx + 1}
                      </span>
                      
                      {/* Avatar initials circle */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-athletic text-xs ${
                        isHighlighted ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-white/10'
                      }`}>
                        {p.displayName.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <span className={`font-athletic text-sm block ${isHighlighted ? 'text-white' : 'text-white'}`}>
                          {p.displayName}
                        </span>
                        <span className={`text-[11px] ${isHighlighted ? 'text-blue-100' : 'text-slate-400'}`}>
                          {p.teamName} · #{p.jerseyNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-athletic text-base px-3 py-1 rounded-xl shadow-xs ${
                        isHighlighted 
                          ? 'bg-white/20 text-white border border-white/20' 
                          : 'bg-white/5 text-blue-400 font-bold border border-white/10'
                      }`}>
                        {p.goals} Goals
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TEAMS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-athletic uppercase tracking-wider text-slate-400">
              Registered Teams & Squad Lobbies
            </h2>
            <span className="text-xs text-slate-500 font-mono">{teams.length} Clubs</span>
          </div>

          {/* Teams Grid (Matching CHELSEA FANS GROUP / GAME ROOM 28 GROUP style from reference image) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {teams.map((team, idx) => {
              const teamPlayers = players.filter(p => p.teamId === team.id);
              const isFeatured = idx === 0;

              return (
                <div 
                  key={team.id} 
                  className={`rounded-3xl p-5 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between ${
                    isFeatured 
                      ? 'card-sport-gradient shadow-[0_12px_32px_rgba(37,99,235,0.4)]' 
                      : 'card-sport hover:border-blue-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Member Count Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        isFeatured 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/5 text-slate-400 border border-white/5'
                      }`}>
                        <Users className="w-3 h-3" />
                        {teamPlayers.length} Members
                      </span>

                      <span className={`text-[10px] font-bold font-mono uppercase ${
                        isFeatured ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {team.groupId ? `GROUP ${team.groupId.toUpperCase()}` : 'MAIN'}
                      </span>
                    </div>

                    {/* Team Crest & Name */}
                    <div className="flex items-center gap-3 pt-1">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-athletic text-base text-white shadow-md border border-white/20"
                        style={{ backgroundColor: team.primaryColor }}
                      >
                        {team.shortName}
                      </div>
                      <div>
                        <h4 className="font-athletic text-base tracking-tight text-white leading-tight">
                          {team.name}
                        </h4>
                        <span className={`text-xs ${isFeatured ? 'text-blue-100' : 'text-slate-400'}`}>
                          Official Tournament Squad
                        </span>
                      </div>
                    </div>

                    {/* Overlapping Avatar Stacks (Exact visual from screenshot) */}
                    <div className="pt-2">
                      <span className={`text-[10px] uppercase font-bold block mb-1.5 ${
                        isFeatured ? 'text-blue-100' : 'text-slate-400'
                      }`}>
                        Squad Roster
                      </span>
                      <div className="flex items-center -space-x-2 overflow-hidden py-1">
                        {teamPlayers.slice(0, 5).map((p, i) => (
                          <div 
                            key={p.id}
                            className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#121828] text-white flex items-center justify-center font-athletic text-[11px] shadow-sm"
                            title={p.displayName}
                          >
                            {p.displayName.slice(0, 1)}
                          </div>
                        ))}
                        {teamPlayers.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#121828] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                            +{teamPlayers.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Jersey: #{teamPlayers[0]?.jerseyNumber || '1'}
                    </span>
                    <span className={`text-xs font-bold ${
                      isFeatured ? 'text-white' : 'text-blue-400'
                    }`}>
                      View Roster →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prominent Action Button (Like "Add members and proceed" in the reference image) */}
          <div className="pt-4 flex justify-center">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-electric w-full max-w-md py-4 rounded-2xl font-athletic text-sm uppercase tracking-wider text-center cursor-pointer shadow-xl"
            >
              Share & Invite Members to Tournament
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="pt-8 border-t border-white/10 text-center text-xs text-slate-500">
        <p>Live Tournament Operations powered by <strong className="text-blue-400 font-athletic">ArenaOps SaaS</strong></p>
      </div>

    </div>
  );
};
