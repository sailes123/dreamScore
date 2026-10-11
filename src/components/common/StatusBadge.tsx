import React from 'react';
import { TournamentLifecycleState, MatchStatus, TeamRegistrationStatus, TeamPaymentStatus, PurchasePaymentStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const s = status.toUpperCase();

  let bg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (s === 'PREPARATION') {
    bg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60';
  } else if (s === 'LIVE') {
    bg = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60 font-semibold';
  } else if (s === 'ENDED') {
    bg = 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  } else if (s === 'RETENTION_GRACE') {
    bg = 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
  } else if (s === 'ARCHIVED' || s === 'ARCHIVED / PURGED') {
    bg = 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700';
  } else if (s === 'PAID' || s === 'CONFIRMED' || s === 'COMPLETED' || s === 'APPROVED' || s === 'ACTIVE') {
    bg = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
  } else if (s === 'PARTIALLY_PAID' || s === 'READY' || s === 'SCHEDULED' || s === 'PENDING') {
    bg = 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
  } else if (s === 'UNPAID' || s === 'REJECTED' || s === 'CANCELLED' || s === 'WITHDRAWN' || s === 'DISQUALIFIED') {
    bg = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
  } else if (s === 'WAIVED' || s === 'POSTPONED' || s === 'HALFTIME') {
    bg = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
  }

  const isLive = s === 'LIVE';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-normal transition-colors ${bg} ${
        size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5'
      }`}
    >
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
      {status.replace(/_/g, ' ')}
    </span>
  );
};
