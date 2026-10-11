import { TournamentStatus } from '@prisma/client';

const allowedTransitions: Record<TournamentStatus, TournamentStatus[]> = {
  DRAFT: ['PREPARATION', 'ARCHIVED'],
  PREPARATION: ['DRAFT', 'LIVE', 'ARCHIVED'],
  LIVE: ['ENDED'],
  ENDED: ['RETENTION_GRACE', 'ARCHIVED'],
  RETENTION_GRACE: ['ARCHIVED'],
  ARCHIVED: [],
};

export function canTransitionTournamentStatus(from: TournamentStatus, to: TournamentStatus) {
  return from === to || allowedTransitions[from].includes(to);
}
