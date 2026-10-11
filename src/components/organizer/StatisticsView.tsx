import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Award, Flame, ShieldAlert, Zap, ArrowLeftRight, Target, Activity } from 'lucide-react';
import { SportCode } from '../../types';

export const StatisticsView: React.FC = () => {
  const { playerStats, teams, activeTournament } = useTournament();

  const sportCode: SportCode = (activeTournament.sportCode || (activeTournament as any).sportType || 'FUTSAL') as SportCode;

  // Multi-sport metric helpers
  const isCricket = sportCode === 'CRICKET';
  const isBasketball = sportCode === 'BASKETBALL';
  const isNetSport = sportCode === 'VOLLEYBALL' || sportCode === 'BADMINTON' || sportCode === 'TABLE_TENNIS';

  // Sort top performers by primary metric
  const topPrimary = [...playerStats].sort((a, b) => {
    if (isCricket) return b.runs - a.runs;
    if (isBasketball || isNetSport) return b.points - a.points;
    return b.goals - a.goals;
  }).slice(0, 10);

  const topSecondary = [...playerStats].sort((a, b) => {
    if (isCricket) return b.wickets - a.wickets;
    if (isNetSport) return b.aces - a.aces;
    return b.assists - a.assists;
  }).slice(0, 10);

  const topDiscipline = [...playerStats].sort((a, b) => {
    return (b.yellowCards + b.redCards * 2 + b.fouls) - (a.yellowCards + a.redCards * 2 + a.fouls);
  }).slice(0, 10);

  // Labels based on sport
  const primaryTitle = isCricket ? 'Top Run Scorers' : isBasketball ? 'Top Points Scorers' : isNetSport ? 'Top Point Scorers' : 'Top Goalscorers';
  const primaryMetricLabel = isCricket ? 'Runs' : isBasketball || isNetSport ? 'PTS' : 'Goals';

  const secondaryTitle = isCricket ? 'Top Wicket Takers' : isNetSport ? 'Top Service Aces' : 'Top Playmakers (Assists)';
  const secondaryMetricLabel = isCricket ? 'Wickets' : isNetSport ? 'Aces' : 'Assists';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Player & Tournament Statistics</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
              {sportCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time performance metrics derived from court match events, substitutions, and live scoring.
          </p>
        </div>
      </div>

      {/* Top Performers Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Primary Metric (Goals / Runs / Points) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{primaryTitle}</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">{primaryMetricLabel}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topPrimary.slice(0, 5).map((player, idx) => {
              const val = isCricket ? player.runs : isBasketball || isNetSport ? player.points : player.goals;
              return (
                <div key={player.playerId} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      idx === 0 ? 'bg-amber-100 text-amber-800' : 'text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 block">{player.displayName}</span>
                      <span className="text-[11px] text-slate-400">{player.teamName} (#{player.jerseyNumber})</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Secondary Metric (Assists / Wickets / Aces) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider">
              {isCricket ? <Target className="w-4 h-4 text-sky-600" /> : <Flame className="w-4 h-4 text-sky-600" />}
              <span>{secondaryTitle}</span>
            </div>
            <span className="text-[11px] font-mono text-sky-700 font-semibold">{secondaryMetricLabel}</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topSecondary.slice(0, 5).map((player, idx) => {
              const val = isCricket ? player.wickets : isNetSport ? player.aces : player.assists;
              return (
                <div key={player.playerId} className="px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] text-slate-400">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 block">{player.displayName}</span>
                      <span className="text-[11px] text-slate-400">{player.teamName} (#{player.jerseyNumber})</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Discipline & Fouls */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Discipline & Infractions</span>
            </div>
            <span className="text-[11px] font-mono text-rose-700 font-semibold">Cards / Fouls</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topDiscipline.slice(0, 5).map((player, idx) => (
              <div key={player.playerId} className="px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] text-slate-400">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900 block">{player.displayName}</span>
                    <span className="text-[11px] text-slate-400">{player.teamName} (#{player.jerseyNumber})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                  {player.yellowCards > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      {player.yellowCards} Y
                    </span>
                  )}
                  {player.redCards > 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
                      {player.redCards} R
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[11px]">
                    {player.fouls} fouls
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Complete Player Statistics Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Complete Player Records ({playerStats.length})
          </h3>
          <span className="text-[11px] text-slate-500">Live updated from court match events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 px-4">Player</th>
                <th className="py-2.5 px-4">Team</th>
                <th className="py-2.5 px-3 text-center">Matches</th>
                
                {/* Dynamic sport metric columns */}
                {isCricket ? (
                  <>
                    <th className="py-2.5 px-3 text-center text-emerald-700 font-bold">Runs</th>
                    <th className="py-2.5 px-3 text-center text-rose-700 font-bold">Wickets</th>
                  </>
                ) : isBasketball || isNetSport ? (
                  <>
                    <th className="py-2.5 px-3 text-center text-emerald-700 font-bold">Points</th>
                    {isNetSport && <th className="py-2.5 px-3 text-center text-purple-700">Aces</th>}
                    {!isNetSport && <th className="py-2.5 px-3 text-center text-sky-700">Assists</th>}
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 text-center text-emerald-700 font-bold">Goals</th>
                    <th className="py-2.5 px-3 text-center text-sky-700 font-bold">Assists</th>
                  </>
                )}

                {/* Substitutions */}
                <th className="py-2.5 px-3 text-center text-purple-700 font-semibold" title="Times involved in substitutions">
                  Subs
                </th>

                <th className="py-2.5 px-3 text-center text-amber-700">Yellows</th>
                <th className="py-2.5 px-3 text-center text-rose-700">Reds</th>
                <th className="py-2.5 px-3 text-center">Fouls</th>
                {!isCricket && !isBasketball && !isNetSport && (
                  <th className="py-2.5 px-3 text-center text-slate-400">Own Goals</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {playerStats.map((p) => (
                <tr key={p.playerId} className="hover:bg-slate-50/75 transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {p.displayName} <span className="text-slate-400 font-mono font-normal">#{p.jerseyNumber}</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 font-medium">{p.teamName}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-700">{p.matchesPlayed}</td>
                  
                  {isCricket ? (
                    <>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{p.runs}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">{p.wickets}</td>
                    </>
                  ) : isBasketball || isNetSport ? (
                    <>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{p.points}</td>
                      {isNetSport && <td className="py-2.5 px-3 text-center font-mono text-purple-700">{p.aces}</td>}
                      {!isNetSport && <td className="py-2.5 px-3 text-center font-mono text-sky-700">{p.assists}</td>}
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">{p.goals}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-sky-700">{p.assists}</td>
                    </>
                  )}

                  {/* Substitution count */}
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-700 bg-purple-50/30">
                    {p.substitutions || 0}
                  </td>

                  <td className="py-2.5 px-3 text-center font-mono text-amber-700">{p.yellowCards}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-700">{p.redCards}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600">{p.fouls}</td>
                  {!isCricket && !isBasketball && !isNetSport && (
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">{p.ownGoals}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
