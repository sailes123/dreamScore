import { Match, Team, TeamStanding } from '../types';

export function calculateStandings(
  teams: Team[], 
  matches: Match[], 
  pointsForWin = 3, 
  pointsForDraw = 1, 
  pointsForLoss = 0,
  groupId?: string,
  includeLive = true
): TeamStanding[] {
  const filteredTeams = groupId ? teams.filter(t => t.groupId === groupId) : teams;
  const filteredMatches = matches.filter(m => 
    (m.status === 'COMPLETED' || (includeLive && (m.status === 'LIVE' || m.status === 'HALFTIME'))) && 
    (!groupId || m.groupId === groupId)
  );

  const standingsMap = new Map<string, TeamStanding>();

  // Initialize
  filteredTeams.forEach(team => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      shortName: team.shortName,
      groupId: team.groupId,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: []
    });
  });

  // Calculate from completed matches
  filteredMatches.forEach(match => {
    const home = standingsMap.get(match.homeTeamId);
    const away = standingsMap.get(match.awayTeamId);

    if (!home || !away) return;

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      home.points += pointsForWin;
      home.form.push('W');
      away.lost += 1;
      away.points += pointsForLoss;
      away.form.push('L');
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      away.points += pointsForWin;
      away.form.push('W');
      home.lost += 1;
      home.points += pointsForLoss;
      home.form.push('L');
    } else {
      home.drawn += 1;
      home.points += pointsForDraw;
      home.form.push('D');
      away.drawn += 1;
      away.points += pointsForDraw;
      away.form.push('D');
    }

    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;
  });

  const list = Array.from(standingsMap.values());

  // Sort by: 1. Points, 2. Goal Difference, 3. Goals For, 4. Head-to-Head
  list.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    // Head-to-head check
    const h2hMatch = filteredMatches.find(m => 
      (m.homeTeamId === a.teamId && m.awayTeamId === b.teamId) ||
      (m.homeTeamId === b.teamId && m.awayTeamId === a.teamId)
    );
    if (h2hMatch) {
      const aScore = h2hMatch.homeTeamId === a.teamId ? h2hMatch.homeScore : h2hMatch.awayScore;
      const bScore = h2hMatch.homeTeamId === b.teamId ? h2hMatch.homeScore : h2hMatch.awayScore;
      if (bScore !== aScore) return bScore - aScore;
    }

    return a.teamName.localeCompare(b.teamName);
  });

  return list;
}
