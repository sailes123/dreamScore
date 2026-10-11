export const scoringPoints: Record<string, number> = {
  GOAL: 1, PENALTY_GOAL: 1, FREE_THROW: 1, RUN_1: 1, EXTRA_RUN: 1,
  POINT_ATTACK: 1, POINT_BLOCK: 1, POINT_ACE: 1, POINT_WINNER: 1,
  OPPONENT_ERROR: 1, FIELD_GOAL_2PT: 2, RUN_2: 2, FIELD_GOAL_3PT: 3,
  BOUNDARY_4: 4, BOUNDARY_6: 6,
};

type ScoringEvent = { teamId: string; eventType: string };

export function deriveMatchScore(
  events: ScoringEvent[],
  homeTeamId: string | null,
  awayTeamId: string | null,
) {
  let homeScore = 0;
  let awayScore = 0;

  for (const event of events) {
    const points = scoringPoints[event.eventType] ?? 0;
    if (event.eventType === 'OWN_GOAL') {
      if (event.teamId === homeTeamId) awayScore += 1;
      if (event.teamId === awayTeamId) homeScore += 1;
    } else if (event.teamId === homeTeamId) {
      homeScore += points;
    } else if (event.teamId === awayTeamId) {
      awayScore += points;
    }
  }

  return { homeScore, awayScore };
}
