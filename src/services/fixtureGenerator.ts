import { Match, Team, TournamentFormat } from '../types';

export interface ScheduleConflict {
  teamId: string;
  teamName: string;
  matchIdA: string;
  matchIdB: string;
  timeA: string;
  timeB: string;
  message: string;
}

export function generateRoundRobinFixtures(
  teams: Team[],
  tournamentId: string,
  venueName: string,
  courtName: string,
  startDateTime: string,
  matchDurationMinutes: number,
  groupId?: string,
  groupLabel?: string,
  startingMatchNumber = 1
): Match[] {
  if (teams.length < 2) return [];

  const teamList = [...teams];
  // If odd number of teams, add a dummy team for bye
  const hasDummy = teamList.length % 2 !== 0;
  if (hasDummy) {
    teamList.push({ id: '__BYE__', name: 'BYE' } as Team);
  }

  const numTeams = teamList.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;
  const generatedMatches: Match[] = [];

  let matchCounter = startingMatchNumber;
  const baseDate = new Date(startDateTime);

  for (let round = 0; round < numRounds; round++) {
    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const homeIdx = (round + matchIdx) % (numTeams - 1);
      let awayIdx = (numTeams - 1 - matchIdx + round) % (numTeams - 1);

      if (matchIdx === 0) {
        awayIdx = numTeams - 1;
      }

      const homeTeam = teamList[homeIdx];
      const awayTeam = teamList[awayIdx];

      // Skip bye matches
      if (homeTeam.id === '__BYE__' || awayTeam.id === '__BYE__') {
        continue;
      }

      // Stagger match time by round and match
      const matchTime = new Date(baseDate.getTime() + (round * 120 + matchIdx * (matchDurationMinutes + 15)) * 60 * 1000);

      generatedMatches.push({
        id: `match-gen-${tournamentId}-${matchCounter}`,
        tournamentId,
        matchNumber: matchCounter,
        stage: 'GROUP_STAGE',
        roundName: groupLabel ? `${groupLabel} · Matchday ${round + 1}` : `Matchday ${round + 1}`,
        groupId,
        homeTeamId: round % 2 === 0 ? homeTeam.id : awayTeam.id,
        awayTeamId: round % 2 === 0 ? awayTeam.id : homeTeam.id,
        venueName,
        courtName,
        scheduledAt: matchTime.toISOString(),
        homeScore: 0,
        awayScore: 0,
        status: 'SCHEDULED'
      });

      matchCounter++;
    }
  }

  return generatedMatches;
}

export function generateTournamentFixtures(
  format: TournamentFormat,
  teams: Team[],
  tournamentId: string,
  venueName: string,
  courtName: string,
  startDateTime: string,
  matchDurationMinutes: number
): Match[] {
  if (format === 'ROUND_ROBIN') {
    return generateRoundRobinFixtures(
      teams,
      tournamentId,
      venueName,
      courtName,
      startDateTime,
      matchDurationMinutes,
      undefined,
      'League Round'
    );
  }

  if (format === 'GROUP_STAGE_KNOCKOUT') {
    const groupA = teams.filter(t => t.groupId === 'group-a');
    const groupB = teams.filter(t => t.groupId === 'group-b');

    const groupAMatches = generateRoundRobinFixtures(
      groupA.length > 0 ? groupA : teams.slice(0, Math.ceil(teams.length / 2)),
      tournamentId,
      venueName,
      courtName,
      startDateTime,
      matchDurationMinutes,
      'group-a',
      'Group A',
      1
    );

    const groupBMatches = generateRoundRobinFixtures(
      groupB.length > 0 ? groupB : teams.slice(Math.ceil(teams.length / 2)),
      tournamentId,
      venueName,
      courtName,
      startDateTime,
      matchDurationMinutes,
      'group-b',
      'Group B',
      groupAMatches.length + 1
    );

    // Add Knockout slots (Semi-finals & Final)
    const baseDate = new Date(startDateTime);
    const knockoutDate = new Date(baseDate.getTime() + 48 * 60 * 60 * 1000); // 2 days later

    const semi1: Match = {
      id: `match-gen-${tournamentId}-sf1`,
      tournamentId,
      matchNumber: groupAMatches.length + groupBMatches.length + 1,
      stage: 'SEMI_FINAL',
      roundName: 'Semi-Final 1 (1st Group A vs 2nd Group B)',
      homeTeamId: groupA[0]?.id || teams[0]?.id || 'TBD-A1',
      awayTeamId: groupB[1]?.id || teams[3]?.id || 'TBD-B2',
      venueName,
      courtName,
      scheduledAt: new Date(knockoutDate.getTime()).toISOString(),
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED'
    };

    const semi2: Match = {
      id: `match-gen-${tournamentId}-sf2`,
      tournamentId,
      matchNumber: groupAMatches.length + groupBMatches.length + 2,
      stage: 'SEMI_FINAL',
      roundName: 'Semi-Final 2 (1st Group B vs 2nd Group A)',
      homeTeamId: groupB[0]?.id || teams[1]?.id || 'TBD-B1',
      awayTeamId: groupA[1]?.id || teams[2]?.id || 'TBD-A2',
      venueName,
      courtName,
      scheduledAt: new Date(knockoutDate.getTime() + 90 * 60 * 1000).toISOString(),
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED'
    };

    const finalMatch: Match = {
      id: `match-gen-${tournamentId}-final`,
      tournamentId,
      matchNumber: groupAMatches.length + groupBMatches.length + 3,
      stage: 'FINAL',
      roundName: 'Grand Final',
      homeTeamId: semi1.homeTeamId,
      awayTeamId: semi2.homeTeamId,
      venueName,
      courtName,
      scheduledAt: new Date(knockoutDate.getTime() + 240 * 60 * 1000).toISOString(),
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED'
    };

    return [...groupAMatches, ...groupBMatches, semi1, semi2, finalMatch];
  }

  // Knockout single elimination
  const knockoutMatches: Match[] = [];
  const baseDate = new Date(startDateTime);

  for (let i = 0; i < teams.length; i += 2) {
    const home = teams[i];
    const away = teams[i + 1];
    if (home && away) {
      knockoutMatches.push({
        id: `match-ko-${tournamentId}-${i / 2 + 1}`,
        tournamentId,
        matchNumber: i / 2 + 1,
        stage: teams.length <= 4 ? 'SEMI_FINAL' : 'QUARTER_FINAL',
        roundName: teams.length <= 4 ? `Semi-Final ${i / 2 + 1}` : `Quarter-Final ${i / 2 + 1}`,
        homeTeamId: home.id,
        awayTeamId: away.id,
        venueName,
        courtName,
        scheduledAt: new Date(baseDate.getTime() + (i / 2) * (matchDurationMinutes + 20) * 60 * 1000).toISOString(),
        homeScore: 0,
        awayScore: 0,
        status: 'SCHEDULED'
      });
    }
  }

  return knockoutMatches;
}

export function detectSchedulingConflicts(matches: Match[], teams: Team[], matchDurationMinutes = 40): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  for (let i = 0; i < matches.length; i++) {
    for (let j = i + 1; j < matches.length; j++) {
      const mA = matches[i];
      const mB = matches[j];

      if (mA.status === 'CANCELLED' || mB.status === 'CANCELLED') continue;

      const timeA = new Date(mA.scheduledAt).getTime();
      const timeB = new Date(mB.scheduledAt).getTime();

      // Check time overlap within match duration window
      const overlapThreshold = (matchDurationMinutes + 10) * 60 * 1000;
      const isTimeOverlapping = Math.abs(timeA - timeB) < overlapThreshold;

      if (isTimeOverlapping) {
        // Check if same team is playing in both
        const teamsInA = [mA.homeTeamId, mA.awayTeamId];
        const teamsInB = [mB.homeTeamId, mB.awayTeamId];

        teamsInA.forEach(teamId => {
          if (teamsInB.includes(teamId)) {
            conflicts.push({
              teamId,
              teamName: teamMap.get(teamId) || 'Unknown Team',
              matchIdA: mA.id,
              matchIdB: mB.id,
              timeA: mA.scheduledAt,
              timeB: mB.scheduledAt,
              message: `Team "${teamMap.get(teamId)}" is scheduled for Match #${mA.matchNumber} and Match #${mB.matchNumber} at overlapping times!`
            });
          }
        });
      }
    }
  }

  return conflicts;
}
