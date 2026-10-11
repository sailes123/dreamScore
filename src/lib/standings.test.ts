import { describe, expect, it } from 'vitest';
import { calculateStandings } from './standings';

describe('calculateStandings', () => {
  const teams = [
    { id: 'a', name: 'Alpha', shortName: 'A', groupCode: null },
    { id: 'b', name: 'Bravo', shortName: 'B', groupCode: null },
    { id: 'c', name: 'Charlie', shortName: 'C', groupCode: null },
  ];

  it('derives totals from completed matches and ignores unfinished fixtures', () => {
    const rows = calculateStandings(teams, [
      { homeTeamId: 'a', awayTeamId: 'b', homeScore: 2, awayScore: 1, status: 'COMPLETED' },
      { homeTeamId: 'b', awayTeamId: 'c', homeScore: 0, awayScore: 0, status: 'COMPLETED' },
      { homeTeamId: 'c', awayTeamId: 'a', homeScore: 9, awayScore: 0, status: 'LIVE' },
    ], { win: 3, draw: 1, loss: 0 });
    expect(rows.map((row) => row.id)).toEqual(['a', 'c', 'b']);
    expect(rows[0]).toMatchObject({ played: 1, won: 1, goalsFor: 2, goalsAgainst: 1, goalDifference: 1, points: 3 });
    expect(rows[1]).toMatchObject({ played: 1, drawn: 1, points: 1 });
    expect(rows[2]).toMatchObject({ played: 2, drawn: 1, lost: 1, points: 1 });
  });
});
