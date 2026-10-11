import { MatchEvent, Player, PlayerStatistic, Team } from '../types';

export function calculatePlayerStatistics(
  players: Player[],
  teams: Team[],
  events: MatchEvent[],
  completedMatchPlayerIds: Set<string>
): PlayerStatistic[] {
  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const statsMap = new Map<string, PlayerStatistic>();

  players.forEach(p => {
    statsMap.set(p.id, {
      playerId: p.id,
      displayName: p.displayName,
      jerseyNumber: p.jerseyNumber,
      teamId: p.teamId,
      teamName: teamMap.get(p.teamId) || 'Unknown Team',
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      ownGoals: 0,
      yellowCards: 0,
      redCards: 0,
      fouls: 0,
      points: 0,
      runs: 0,
      wickets: 0,
      aces: 0,
      substitutions: 0
    });
  });

  events.forEach(event => {
    const primary = statsMap.get(event.playerId);
    if (primary) {
      switch (event.eventType) {
        case 'GOAL':
        case 'PENALTY_GOAL':
          primary.goals += 1;
          primary.points += 1;
          break;
        case 'OWN_GOAL':
          primary.ownGoals += 1;
          break;
        case 'YELLOW_CARD':
          primary.yellowCards += 1;
          break;
        case 'RED_CARD':
        case 'SECOND_YELLOW_RED':
          primary.redCards += 1;
          break;
        case 'FOUL':
        case 'FAULT':
          primary.fouls += 1;
          break;
        // Basketball points
        case 'FIELD_GOAL_2PT':
          primary.points += 2;
          break;
        case 'FIELD_GOAL_3PT':
          primary.points += 3;
          break;
        case 'FREE_THROW':
          primary.points += 1;
          break;
        // Cricket runs & wickets
        case 'RUN_1':
          primary.runs += 1;
          break;
        case 'RUN_2':
          primary.runs += 2;
          break;
        case 'BOUNDARY_4':
          primary.runs += 4;
          break;
        case 'BOUNDARY_6':
          primary.runs += 6;
          break;
        case 'EXTRA_RUN':
          primary.runs += 1;
          break;
        case 'WICKET':
          primary.wickets += 1;
          break;
        // Volleyball / Badminton / Table Tennis
        case 'POINT_ATTACK':
        case 'POINT_BLOCK':
        case 'POINT_WINNER':
          primary.points += 1;
          break;
        case 'POINT_ACE':
          primary.points += 1;
          primary.aces += 1;
          break;
        case 'SUBSTITUTION':
          primary.substitutions += 1;
          break;
      }
    }

    if (event.secondaryPlayerId) {
      const secondary = statsMap.get(event.secondaryPlayerId);
      if (secondary) {
        if (event.eventType === 'GOAL' || event.eventType === 'ASSIST' || event.eventType === 'FIELD_GOAL_2PT' || event.eventType === 'FIELD_GOAL_3PT') {
          secondary.assists += 1;
        } else if (event.eventType === 'SUBSTITUTION') {
          secondary.substitutions += 1;
        }
      }
    }
  });

  // Calculate matches played from completed match involvement
  completedMatchPlayerIds.forEach(pId => {
    const stat = statsMap.get(pId);
    if (stat) stat.matchesPlayed += 1;
  });

  return Array.from(statsMap.values()).sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.points !== a.points) return b.points - a.points;
    if (b.runs !== a.runs) return b.runs - a.runs;
    if (b.wickets !== a.wickets) return b.wickets - a.wickets;
    if (b.assists !== a.assists) return b.assists - a.assists;
    return a.displayName.localeCompare(b.displayName);
  });
}
