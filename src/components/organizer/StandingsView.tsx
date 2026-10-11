import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { TableProperties, Info, Radio } from 'lucide-react';
import { calculateStandings } from '../../services/standingsCalculator';
import { SportCode } from '../../types';

export const StandingsView: React.FC = () => {
  const { teams, matches, activeTournament } = useTournament();

  const sportCode: SportCode = (activeTournament.sportCode || (activeTournament as any).sportType || 'FUTSAL') as SportCode;

  const isCricket = sportCode === 'CRICKET';
  const isBasketball = sportCode === 'BASKETBALL';
  const isNetSport = sportCode === 'VOLLEYBALL' || sportCode === 'BADMINTON' || sportCode === 'TABLE_TENNIS';

  // Scoring labels
  const forLabel = isCricket ? 'RF' : isBasketball || isNetSport ? 'PF' : 'GF';
  const againstLabel = isCricket ? 'RA' : isBasketball || isNetSport ? 'PA' : 'GA';
  const diffLabel = isCricket ? 'RD' : isBasketball || isNetSport ? 'PD' : 'GD';

  const forTitle = isCricket ? 'Runs For' : isBasketball || isNetSport ? 'Points For' : 'Goals For';
  const againstTitle = isCricket ? 'Runs Against' : isBasketball || isNetSport ? 'Points Against' : 'Goals Against';
  const diffTitle = isCricket ? 'Run Difference' : isBasketball || isNetSport ? 'Point Difference' : 'Goal Difference';

  const groupAStandings = calculateStandings(
    teams,
    matches,
    activeTournament.pointsForWin,
    activeTournament.pointsForDraw,
    activeTournament.pointsForLoss,
    'group-a',
    true // include live
  );

  const groupBStandings = calculateStandings(
    teams,
    matches,
    activeTournament.pointsForWin,
    activeTournament.pointsForDraw,
    activeTournament.pointsForLoss,
    'group-b',
    true // include live
  );

  const overallStandings = calculateStandings(
    teams,
    matches,
    activeTournament.pointsForWin,
    activeTournament.pointsForDraw,
    activeTournament.pointsForLoss,
    undefined,
    true // include live
  );

  const hasGroups = groupAStandings.length > 0 || groupBStandings.length > 0;
  const isGroupFormat = activeTournament.format === 'GROUP_STAGE_KNOCKOUT' && hasGroups;

  const [activeTab, setActiveTab] = useState<'GROUPS' | 'OVERALL'>(isGroupFormat ? 'GROUPS' : 'OVERALL');

  const liveMatchesCount = matches.filter(m => m.status === 'LIVE' || m.status === 'HALFTIME').length;

  const renderTable = (list: typeof groupAStandings, title?: string) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
      {title && (
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white font-display">{title}</h3>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
              {list.length} Teams
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Top 2 Qualify to Knockout
          </span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/40 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase text-[10px]">
              <th className="py-3 px-4 w-12 text-center">Pos</th>
              <th className="py-3 px-4">Team</th>
              <th className="py-3 px-3 text-center" title="Played">P</th>
              <th className="py-3 px-3 text-center" title="Won">W</th>
              <th className="py-3 px-3 text-center" title="Drawn">D</th>
              <th className="py-3 px-3 text-center" title="Lost">L</th>
              <th className="py-3 px-3 text-center" title={forTitle}>{forLabel}</th>
              <th className="py-3 px-3 text-center" title={againstTitle}>{againstLabel}</th>
              <th className="py-3 px-3 text-center" title={diffTitle}>{diffLabel}</th>
              <th className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white" title="Points">PTS</th>
              <th className="py-3 px-4 text-center">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {list.map((row, idx) => {
              const isQualified = idx < 2; // top 2 advance
              return (
                <tr 
                  key={row.teamId} 
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                    isQualified ? 'bg-emerald-50/20 dark:bg-emerald-950/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 text-center font-mono font-bold">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold ${
                      isQualified ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60' : 'text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {row.teamName}
                  </td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">{row.played}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{row.won}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-amber-600 dark:text-amber-400">{row.drawn}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-rose-600 dark:text-rose-400">{row.lost}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">{row.goalsFor}</td>
                  <td className="py-3.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">{row.goalsAgainst}</td>
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-extrabold text-slate-900 dark:text-white text-sm bg-slate-50/60 dark:bg-slate-800/50">
                    {row.points}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {row.form.length > 0 ? (
                        row.form.map((res, i) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-2xs ${
                              res === 'W' ? 'bg-emerald-600' : res === 'D' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          >
                            {res}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Live Tournament Standings</h2>
            {liveMatchesCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                {liveMatchesCount} Match{liveMatchesCount > 1 ? 'es' : ''} Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Live Standings Sync Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time points table updated instantly with ongoing and completed match scores.
          </p>
        </div>

        {hasGroups && (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('GROUPS')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'GROUPS' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Group Stages
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('OVERALL')}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                activeTab === 'OVERALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overall Table
            </button>
          </div>
        )}
      </div>

      {/* Rules Information Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Scoring System: <strong>Win = {activeTournament.pointsForWin} pts</strong>, <strong>Draw = {activeTournament.pointsForDraw} pt</strong>, <strong>Loss = {activeTournament.pointsForLoss} pts</strong>.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Ranked by: 1. Points • 2. {diffTitle} • 3. {forTitle} • 4. Head-to-Head
        </span>
      </div>

      {/* Render tables */}
      {activeTab === 'GROUPS' && hasGroups ? (
        <div className="space-y-6">
          {groupAStandings.length > 0 && renderTable(groupAStandings, 'Group A')}
          {groupBStandings.length > 0 && renderTable(groupBStandings, 'Group B')}
        </div>
      ) : (
        renderTable(overallStandings, 'Tournament Standings Table')
      )}

    </div>
  );
};
