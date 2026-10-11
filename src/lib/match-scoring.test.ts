import { describe, expect, it } from 'vitest';
import { deriveMatchScore } from './match-scoring';

describe('deriveMatchScore', () => {
  it('counts scoring events, including own goals, for the correct side', () => {
    expect(deriveMatchScore([
      { teamId: 'home', eventType: 'GOAL' },
      { teamId: 'away', eventType: 'FIELD_GOAL_3PT' },
      { teamId: 'home', eventType: 'OWN_GOAL' },
      { teamId: 'unknown', eventType: 'GOAL' },
    ], 'home', 'away')).toEqual({ homeScore: 1, awayScore: 4 });
  });
});
