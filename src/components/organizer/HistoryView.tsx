import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  Archive, 
  Trophy, 
  Calendar, 
  FileSpreadsheet, 
  Download, 
  Award, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export const HistoryView: React.FC = () => {
  const { 
    archivedTournaments = [], 
    activeTournament, 
    lifecycleState, 
    triggerExcelExport 
  } = useTournament();

  const safeArchivedList = archivedTournaments || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">Archived Tournament Records</h2>
        <p className="text-xs text-slate-500">
          Permanent post-retention summary records, championship podiums, and historical Excel export backups.
        </p>
      </div>

      {/* Current Active Tournament Lifecycle Status */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Active Tournament</span>
          <p className="font-bold text-slate-900 mt-0.5">{activeTournament?.name || 'Tournament'}</p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Current status: <span className="font-medium text-slate-700">{(lifecycleState || 'PREPARATION').replace(/_/g, ' ')}</span>.
            Archival occurs automatically 7 days after tournament completion.
          </p>
        </div>
        <StatusBadge status={lifecycleState || 'PREPARATION'} size="sm" />
      </div>

      {/* Archived Cards List */}
      {safeArchivedList.length > 0 ? (
        <div className="space-y-4">
          {safeArchivedList.map((record) => (
            <div 
              key={record.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{record.name}</h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Archived on {new Date(record.archivedAt).toLocaleDateString()} · {record.sportType}
                    </span>
                  </div>
                </div>

                <StatusBadge status="ARCHIVED" size="sm" />
              </div>

              {/* Tournament Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 text-[11px] block">Champion (1st Place)</span>
                  <span className="font-bold text-amber-700 block mt-0.5 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    {record.winnerTeamName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Runner-Up (2nd Place)</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">
                    {record.runnerUpTeamName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Golden Boot MVP</span>
                  <span className="font-semibold text-slate-700 block mt-0.5">
                    {record.goldenBootPlayer} ({record.goldenBootGoals} goals)
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Stats Snapshot</span>
                  <span className="font-mono text-slate-700 block mt-0.5">
                    {record.totalTeams} teams · {record.totalMatches} matches · {record.totalGoals} goals
                  </span>
                </div>
              </div>

              {/* Excel Backup Download */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Excel Archive: <strong>{record.exportRecordFilename}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={triggerExcelExport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Historical Excel Backup</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Archive}
          title="No archived tournaments yet"
          description="Tournaments enter the historical archive after concluding their 7-day retention grace period and generating their master Excel report."
        />
      )}

    </div>
  );
};
