export type ResultMatch = { homeTeamId: string | null; awayTeamId: string | null; homeScore: number; awayScore: number; status: string };
export type StandingTeam = { id: string; name: string; shortName: string; groupCode: string | null };

export function calculateStandings(teams: StandingTeam[], matches: ResultMatch[], points: { win: number; draw: number; loss: number }) {
  const table = new Map(teams.map((team) => [team.id, { ...team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0 }]));
  for (const match of matches) {
    if (match.status !== 'COMPLETED' || !match.homeTeamId || !match.awayTeamId) continue;
    const home = table.get(match.homeTeamId); const away = table.get(match.awayTeamId); if (!home || !away) continue;
    home.played++; away.played++; home.goalsFor += match.homeScore; home.goalsAgainst += match.awayScore; away.goalsFor += match.awayScore; away.goalsAgainst += match.homeScore;
    if (match.homeScore > match.awayScore) { home.won++; away.lost++; home.points += points.win; away.points += points.loss; }
    else if (match.homeScore < match.awayScore) { away.won++; home.lost++; away.points += points.win; home.points += points.loss; }
    else { home.drawn++; away.drawn++; home.points += points.draw; away.points += points.draw; }
  }
  return [...table.values()].map((row) => ({ ...row, goalDifference: row.goalsFor - row.goalsAgainst })).sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor || a.name.localeCompare(b.name));
}
