import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Calendar, Clock, AlertTriangle, PlayCircle, Lock, Archive, RefreshCw, ChevronRight, ChevronDown, ChevronUp, FastForward } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const TimeMachineBanner: React.FC = () => {
  const { 
    currentSimulatedDate, 
    setSimulatedDate, 
    lifecycleState, 
    activeTournament, 
    retentionDaysLeft,
    triggerExcelExport,
    executeRetentionPurge,
    resetToInitialDemo
  } = useTournament();

  const [isMinimized, setIsMinimized] = useState(false);

  const formattedDate = new Date(currentSimulatedDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  });

  if (isMinimized) {
    return (
      <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-[11px] py-1 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FastForward className="w-3 h-3 text-sky-400" />
          <span className="text-slate-400 font-medium">Time Simulation:</span>
          <span className="font-mono text-white bg-slate-800 px-1.5 py-0.2 rounded text-[10px] border border-slate-700">
            {formattedDate}
          </span>
          <StatusBadge status={lifecycleState} size="sm" />
        </div>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
        >
          <span>Show Test Scenarios</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs py-2 px-4 transition-all">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        
        {/* Left: Current State & Simulated Clock */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Simulated Date:</span>
            <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {formattedDate} UTC
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase tracking-wider text-[10px]">Lifecycle State:</span>
            <StatusBadge status={lifecycleState} size="sm" />
          </div>

          {lifecycleState === 'PREPARATION' && (
            <span className="text-amber-300 flex items-center gap-1 text-[11px] bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
              <Lock className="w-3 h-3 text-amber-400" />
              Match operations locked until {new Date(activeTournament.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}

          {lifecycleState === 'LIVE' && (
            <span className="text-emerald-300 flex items-center gap-1 text-[11px] bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              <PlayCircle className="w-3 h-3 text-emerald-400 animate-pulse" />
              Court-side live match operations active
            </span>
          )}

          {lifecycleState === 'RETENTION_GRACE' && (
            <span className="text-purple-300 flex items-center gap-1 text-[11px] bg-purple-950/60 border border-purple-800/60 px-2 py-0.5 rounded">
              <Archive className="w-3 h-3 text-purple-400" />
              Read-Only: {retentionDaysLeft} day{retentionDaysLeft === 1 ? '' : 's'} retention grace remaining
            </span>
          )}
        </div>

        {/* Right: Quick Simulation Jump Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[10px] font-medium mr-1 uppercase">Test Scenarios:</span>
          
          <button
            type="button"
            onClick={() => setSimulatedDate('2026-09-16T12:00:00Z')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              lifecycleState === 'PREPARATION' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Sep 16, 2026: Purchase completed. Configure teams, rules & fixtures, but match ops locked."
          >
            1. Prep (Sep 16)
          </button>

          <button
            type="button"
            onClick={() => setSimulatedDate('2026-10-01T10:00:00Z')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              lifecycleState === 'LIVE' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Oct 1, 2026: Tournament begins. Live match scoring, cards, goals and live standings active."
          >
            2. Live (Oct 1)
          </button>

          <button
            type="button"
            onClick={() => setSimulatedDate('2026-10-04T12:00:00Z')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              lifecycleState === 'RETENTION_GRACE' 
                ? 'bg-purple-600 text-white shadow-xs' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Oct 4, 2026: Tournament ended. Operational data becomes read-only for 7 days."
          >
            3. Ended / Grace (Oct 4)
          </button>

          <button
            type="button"
            onClick={() => setSimulatedDate('2026-10-11T12:00:00Z')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              lifecycleState === 'ENDED' || lifecycleState === 'ARCHIVED'
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
            title="Oct 11, 2026: End of 7 days. Automatic Excel export & email notification before data purge."
          >
            4. Post-Grace (Oct 11)
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={resetToInitialDemo}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Reset data back to initial seed"
          >
            <RefreshCw className="w-3 h-3" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer ml-1"
            title="Minimize Simulation Toolbar"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
