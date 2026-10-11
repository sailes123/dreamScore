import * as XLSX from 'xlsx';
import { 
  Tournament, 
  Team, 
  Player, 
  Match, 
  MatchEvent, 
  TeamStanding, 
  PlayerStatistic 
} from '../types';

export function generateTournamentWorkbook(
  tournament: Tournament,
  teams: Team[],
  players: Player[],
  matches: Match[],
  matchEvents: MatchEvent[],
  standings: TeamStanding[],
  playerStats: PlayerStatistic[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const playerMap = new Map<string, string>();
  players.forEach(p => playerMap.set(p.id, p.displayName));

  // 1. Tournament Overview Sheet
  const overviewData = [
    ['TOURNAMENT OVERVIEW REPORT'],
    ['Tournament Name', tournament.name],
    ['Sport', tournament.sportCode],
    ['Format', tournament.format],
    ['Status', tournament.status],
    ['Start Date & Time (UTC)', tournament.startDateTime],
    ['End Date & Time (UTC)', tournament.endDateTime],
    ['Timezone', tournament.timezone],
    ['Number of Teams', tournament.numberOfTeams],
    ['Primary Venue', tournament.venues[0]?.name || 'N/A'],
    ['Venue Address', tournament.venues[0]?.address || 'N/A'],
    ['Registration Fee', `${tournament.teamRegistrationFee} ${tournament.currency}`],
    ['Organizer Organization', tournament.metadata.organizerOrg || 'N/A'],
    ['Contact Phone', tournament.metadata.contactPhone || 'N/A'],
    ['Sponsor', tournament.metadata.sponsor || 'N/A'],
    ['Prize Pool', tournament.metadata.prizePool || 'N/A'],
    ['Report Generated At', new Date().toISOString()]
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // 2. Teams Sheet
  const teamsData = teams.map((t, idx) => ({
    '#': idx + 1,
    'Team Name': t.name,
    'Short Code': t.shortName,
    'Group': t.groupId ? t.groupId.toUpperCase() : 'N/A',
    'Manager Name': t.managerName,
    'Manager Phone': t.managerPhone,
    'Manager Email': t.managerEmail,
    'Registration Status': t.registrationStatus,
    'Registration Date': t.registrationDate ? new Date(t.registrationDate).toLocaleDateString() : 'N/A'
  }));
  const wsTeams = XLSX.utils.json_to_sheet(teamsData);
  XLSX.utils.book_append_sheet(wb, wsTeams, 'Teams');

  // 3. Players Sheet
  const playersData = players.map((p, idx) => ({
    '#': idx + 1,
    'Jersey Number': p.jerseyNumber,
    'Display Name': p.displayName,
    'Team': teamMap.get(p.teamId) || 'Unknown',
    'Position': p.position,
    'Captain': p.isCaptain ? 'YES' : 'NO',
    'Goalkeeper': p.isGoalkeeper ? 'YES' : 'NO'
  }));
  const wsPlayers = XLSX.utils.json_to_sheet(playersData);
  XLSX.utils.book_append_sheet(wb, wsPlayers, 'Players');

  // 4. Fixtures Sheet
  const fixturesData = matches.map(m => ({
    'Match #': m.matchNumber,
    'Stage / Round': m.roundName,
    'Group': m.groupId ? m.groupId.toUpperCase() : 'N/A',
    'Home Team': teamMap.get(m.homeTeamId) || m.homeTeamId,
    'Away Team': teamMap.get(m.awayTeamId) || m.awayTeamId,
    'Scheduled Time': new Date(m.scheduledAt).toLocaleString(),
    'Venue': m.venueName,
    'Court / Pitch': m.courtName,
    'Status': m.status
  }));
  const wsFixtures = XLSX.utils.json_to_sheet(fixturesData);
  XLSX.utils.book_append_sheet(wb, wsFixtures, 'Fixtures');

  // 5. Results Sheet (Completed matches)
  const resultsData = matches
    .filter(m => m.status === 'COMPLETED')
    .map(m => ({
      'Match #': m.matchNumber,
      'Stage / Round': m.roundName,
      'Home Team': teamMap.get(m.homeTeamId) || m.homeTeamId,
      'Score': `${m.homeScore} - ${m.awayScore}`,
      'Away Team': teamMap.get(m.awayTeamId) || m.awayTeamId,
      'Date Completed': m.actualEnd ? new Date(m.actualEnd).toLocaleString() : new Date(m.scheduledAt).toLocaleString(),
      'Venue': `${m.venueName} (${m.courtName})`
    }));
  const wsResults = XLSX.utils.json_to_sheet(resultsData.length > 0 ? resultsData : [{ 'Status': 'No completed matches yet' }]);
  XLSX.utils.book_append_sheet(wb, wsResults, 'Results');

  // 6. Standings Sheet
  const standingsData = standings.map((s, idx) => ({
    'Position': idx + 1,
    'Team': s.teamName,
    'Group': s.groupId ? s.groupId.toUpperCase() : 'General',
    'Played (P)': s.played,
    'Won (W)': s.won,
    'Drawn (D)': s.drawn,
    'Lost (L)': s.lost,
    'Goals For (GF)': s.goalsFor,
    'Goals Against (GA)': s.goalsAgainst,
    'Goal Difference (GD)': s.goalDifference,
    'Points (PTS)': s.points
  }));
  const wsStandings = XLSX.utils.json_to_sheet(standingsData);
  XLSX.utils.book_append_sheet(wb, wsStandings, 'Standings');

  // 7. Player Statistics Sheet
  const statsData = playerStats.map((ps, idx) => ({
    'Rank': idx + 1,
    'Player Name': ps.displayName,
    'Team': ps.teamName,
    'Jersey #': ps.jerseyNumber,
    'Matches Played': ps.matchesPlayed,
    'Goals': ps.goals,
    'Assists': ps.assists,
    'Yellow Cards': ps.yellowCards,
    'Red Cards': ps.redCards,
    'Fouls': ps.fouls,
    'Own Goals': ps.ownGoals
  }));
  const wsStats = XLSX.utils.json_to_sheet(statsData);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Player Statistics');

  // 8. Match Events Sheet
  const eventsData = matchEvents.map(e => ({
    'Match ID': e.matchId,
    'Minute': `${e.minute}'`,
    'Period': `Half ${e.period}`,
    'Event Type': e.eventType,
    'Team': teamMap.get(e.teamId) || 'Unknown',
    'Player': playerMap.get(e.playerId) || 'Unknown',
    'Secondary Player / Assist': e.secondaryPlayerId ? (playerMap.get(e.secondaryPlayerId) || 'Unknown') : 'N/A',
    'Notes': e.notes || ''
  }));
  const wsEvents = XLSX.utils.json_to_sheet(eventsData.length > 0 ? eventsData : [{ 'Status': 'No match events recorded' }]);
  XLSX.utils.book_append_sheet(wb, wsEvents, 'Match Events');

  // 9. Team Registration Payments Sheet
  const paymentsData = teams.map((t, idx) => ({
    '#': idx + 1,
    'Team Name': t.name,
    'Registration Fee': `${t.registrationFee} ${tournament.currency}`,
    'Amount Received': `${t.amountReceived} ${tournament.currency}`,
    'Remaining Balance': `${t.registrationFee - t.amountReceived} ${tournament.currency}`,
    'Payment Status': t.paymentStatus,
    'Payment Method': t.paymentMethod || 'N/A',
    'Reference #': t.paymentReference || 'N/A',
    'Payment Date': t.paymentDate ? new Date(t.paymentDate).toLocaleDateString() : 'N/A',
    'Notes': t.paymentNotes || ''
  }));
  const wsPayments = XLSX.utils.json_to_sheet(paymentsData);
  XLSX.utils.book_append_sheet(wb, wsPayments, 'Registration Payments');

  return wb;
}

export function downloadTournamentExcel(
  tournament: Tournament,
  teams: Team[],
  players: Player[],
  matches: Match[],
  matchEvents: MatchEvent[],
  standings: TeamStanding[],
  playerStats: PlayerStatistic[]
): { filename: string; sizeBytes: number } {
  const wb = generateTournamentWorkbook(
    tournament,
    teams,
    players,
    matches,
    matchEvents,
    standings,
    playerStats
  );

  const safeName = tournament.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const filename = `${safeName}_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Write file to browser download
  XLSX.writeFile(wb, filename);

  return {
    filename,
    sizeBytes: 45200 // approximate workbook binary size
  };
}
