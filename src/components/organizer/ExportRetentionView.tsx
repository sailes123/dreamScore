import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  FileSpreadsheet, 
  Download, 
  Mail, 
  Archive, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

export const ExportRetentionView: React.FC = () => {
  const { 
    activeTournament, 
    retentionDaysLeft, 
    lifecycleState, 
    exportRecords, 
    triggerExcelExport, 
    executeRetentionPurge,
    setCurrentView 
  } = useTournament();

  const [isExporting, setIsExporting] = useState(false);
  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      triggerExcelExport();
      setIsExporting(false);
    }, 400);
  };

  const hasSuccessfulExport = exportRecords.some(
    r => r.tournamentId === activeTournament.id && r.emailStatus === 'SENT'
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">Tournament Data Export & 7-Day Retention Lifecycle</h2>
        <p className="text-xs text-slate-500">
          Automated multi-sheet Excel (.xlsx) workbook export, email delivery dispatch, and post-retention archival.
        </p>
      </div>

      {/* Main Export Card (Section 32) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Complete Tournament Excel Workbook</h3>
          </div>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Generates a standard 9-sheet <strong className="font-semibold text-slate-900">.xlsx spreadsheet</strong> including: 
            Tournament Overview, Teams, Players, Fixtures, Results, Standings, Player Statistics, Match Events, and Registration Payments.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
            <span>• Frozen Headers</span>
            <span>• Formatted Dates</span>
            <span>• Human-Readable Names</span>
            <span>• Standings Formulas</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating Workbook...' : 'Export to Excel (.xlsx)'}</span>
        </button>
      </div>

      {/* 7-Day Retention Policy & Workflow (Section 5) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              7-Day Post-Tournament Retention Lifecycle
            </h3>
          </div>
          <StatusBadge status={lifecycleState} size="sm" />
        </div>

        {/* Visual Progress Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 py-2 text-xs">
          
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Step 1</span>
            <p className="font-semibold text-slate-800">Tournament Ends</p>
            <span className="text-[11px] text-slate-500 block">
              {new Date(activeTournament.endDateTime).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-slate-400 block">Status becomes ENDED / READ-ONLY</span>
          </div>

          <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 space-y-1">
            <span className="text-[10px] font-bold uppercase text-purple-600">Step 2 (Active)</span>
            <p className="font-semibold text-purple-900">7-Day Retention Grace</p>
            <span className="text-[11px] text-purple-700 font-medium block">
              {retentionDaysLeft} day{retentionDaysLeft === 1 ? '' : 's'} remaining
            </span>
            <span className="text-[10px] text-purple-600 block">Data remains fully inspectable</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Step 3</span>
            <p className="font-semibold text-slate-800">Automated Export & Email</p>
            <span className="text-[11px] text-slate-500 block">
              Sent to: {activeTournament.ownerEmail}
            </span>
            <span className="text-[10px] text-slate-400 block">Delivery verified before purge</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Step 4</span>
            <p className="font-semibold text-slate-800">Operational Purge & History</p>
            <span className="text-[11px] text-slate-500 block">
              Archived to History
            </span>
            <span className="text-[10px] text-slate-400 block">Lightweight audit card retained</span>
          </div>

        </div>

        {/* Safe Purge Guard Rule (Section 5 Rule: "Never permanently delete tournament data before the export succeeds.") */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className={`w-5 h-5 ${hasSuccessfulExport ? 'text-emerald-600' : 'text-amber-500'}`} />
            <div>
              <p className="font-semibold text-slate-900">
                {hasSuccessfulExport ? 'Export Verified & Dispatched' : 'Export Required Before Purge'}
              </p>
              <p className="text-slate-500 text-[11px]">
                {hasSuccessfulExport 
                  ? 'The tournament Excel export has been recorded. The tournament is now eligible for operational purge when the 7-day retention period concludes.' 
                  : 'Safety mandate: Operational tournament data cannot be deleted until an export has been successfully generated and delivered.'}
              </p>
            </div>
          </div>

          {hasSuccessfulExport && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Execute operational data purge and archive this tournament into lightweight history?')) {
                  executeRetentionPurge(activeTournament.id);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs cursor-pointer shrink-0"
            >
              Simulate Retention Purge
            </button>
          )}
        </div>

      </div>

      {/* Export & Email Dispatch History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Export & Email Dispatch Logs ({exportRecords.length})
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Background Delivery Queue</span>
        </div>

        {exportRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-2.5 px-4">Filename</th>
                  <th className="py-2.5 px-4">Generated Date</th>
                  <th className="py-2.5 px-4">Dispatched To</th>
                  <th className="py-2.5 px-4">Email Status</th>
                  <th className="py-2.5 px-4">Purge Eligible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exportRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{rec.filename}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {new Date(rec.generatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {rec.emailSentTo}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Delivered
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px] border border-emerald-200">
                        ELIGIBLE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No exports recorded yet for this tournament. Click &quot;Export to Excel&quot; above to generate the workbook.
          </div>
        )}
      </div>

    </div>
  );
};
