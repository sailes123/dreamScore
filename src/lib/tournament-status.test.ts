import { describe, expect, it } from 'vitest';
import { canTransitionTournamentStatus } from './tournament-status';

describe('canTransitionTournamentStatus', () => {
  it('allows the planned lifecycle and rejects invalid jumps', () => {
    expect(canTransitionTournamentStatus('DRAFT', 'PREPARATION')).toBe(true);
    expect(canTransitionTournamentStatus('PREPARATION', 'LIVE')).toBe(true);
    expect(canTransitionTournamentStatus('LIVE', 'ARCHIVED')).toBe(false);
    expect(canTransitionTournamentStatus('ARCHIVED', 'DRAFT')).toBe(false);
  });
});
