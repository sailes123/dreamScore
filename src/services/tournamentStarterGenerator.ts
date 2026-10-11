import { Team, Player, Match, Tournament } from '../types';

export function generateStarterDataForTournament(
  tournament: Tournament
): { teams: Team[]; players: Player[]; matches: Match[] } {
  const sport = tournament.sportCode;
  const now = new Date();
  const regDate = now.toISOString().slice(0, 10);

  // Sport-themed team names and colors
  let sampleTeamDefs: Array<{ name: string; shortName: string; primary: string; secondary: string }> = [];

  switch (sport) {
    case 'CRICKET':
      sampleTeamDefs = [
        { name: 'Kathmandu Kings XI', shortName: 'KKX', primary: '#dc2626', secondary: '#ffffff' },
        { name: 'Pokhara Rhinos Club', shortName: 'PRC', primary: '#2563eb', secondary: '#facc15' },
        { name: 'Lalitpur Patriots', shortName: 'LPT', primary: '#059669', secondary: '#ffffff' },
        { name: 'Biratnagar Warriors', shortName: 'BWR', primary: '#7c3aed', secondary: '#ffffff' },
      ];
      break;
    case 'BASKETBALL':
      sampleTeamDefs = [
        { name: 'Valley Vipers Hoops', shortName: 'VVH', primary: '#ea580c', secondary: '#1e293b' },
        { name: 'Himalayan Dunkers', shortName: 'HDK', primary: '#2563eb', secondary: '#ffffff' },
        { name: 'Timberwolves Club', shortName: 'TWB', primary: '#0f766e', secondary: '#ffffff' },
        { name: 'Apex Ballers', shortName: 'ABL', primary: '#b91c1c', secondary: '#facc15' },
      ];
      break;
    case 'VOLLEYBALL':
      sampleTeamDefs = [
        { name: 'Spikers United', shortName: 'SPU', primary: '#0284c7', secondary: '#ffffff' },
        { name: 'Summit Blockers', shortName: 'SBL', primary: '#d97706', secondary: '#ffffff' },
        { name: 'Everest Aces Club', shortName: 'EAC', primary: '#4f46e5', secondary: '#ffffff' },
        { name: 'Valley Smashers', shortName: 'VSM', primary: '#16a34a', secondary: '#ffffff' },
      ];
      break;
    case 'BADMINTON':
      sampleTeamDefs = [
        { name: 'Smash Academy', shortName: 'SMA', primary: '#0d9488', secondary: '#ffffff' },
        { name: 'Shuttle Masters', shortName: 'SHM', primary: '#7c3aed', secondary: '#ffffff' },
        { name: 'Net Rackets Club', shortName: 'NRC', primary: '#e11d48', secondary: '#ffffff' },
        { name: 'Ace Shuttlers', shortName: 'ACS', primary: '#2563eb', secondary: '#ffffff' },
      ];
      break;
    case 'TABLE_TENNIS':
      sampleTeamDefs = [
        { name: 'Spin Masters Club', shortName: 'SMC', primary: '#be123c', secondary: '#ffffff' },
        { name: 'Topspin Warriors', shortName: 'TPW', primary: '#1d4ed8', secondary: '#ffffff' },
        { name: 'Loopers Elite', shortName: 'LPE', primary: '#047857', secondary: '#ffffff' },
        { name: 'Ping Pong Pioneers', shortName: 'PPP', primary: '#b45309', secondary: '#ffffff' },
      ];
      break;
    case 'FOOTBALL':
      sampleTeamDefs = [
        { name: 'Kathmandu City FC', shortName: 'KMC', primary: '#b91c1c', secondary: '#ffffff' },
        { name: 'Himalayan Tigers FC', shortName: 'HTF', primary: '#0369a1', secondary: '#facc15' },
        { name: 'Valley United FC', shortName: 'VUF', primary: '#15803d', secondary: '#ffffff' },
        { name: 'Lakeside Stars FC', shortName: 'LSF', primary: '#6d28d9', secondary: '#ffffff' },
      ];
      break;
    case 'MARATHON':
      sampleTeamDefs = [
        { name: 'Kathmandu Striders', shortName: 'KST', primary: '#0284c7', secondary: '#ffffff' },
        { name: 'Himalayan Harriers', shortName: 'HH', primary: '#ea580c', secondary: '#ffffff' },
        { name: 'Valley Trailblazers', shortName: 'VTB', primary: '#16a34a', secondary: '#ffffff' },
        { name: 'Everest Pace Team', shortName: 'EPT', primary: '#9333ea', secondary: '#ffffff' },
      ];
      break;
    case 'FUTSAL':
    default:
      sampleTeamDefs = [
        { name: 'Apex Futsal Club', shortName: 'AFC', primary: '#0284c7', secondary: '#ffffff' },
        { name: 'Velocity Five', shortName: 'VFV', primary: '#e11d48', secondary: '#ffffff' },
        { name: 'Neon Strikers FC', shortName: 'NSF', primary: '#10b981', secondary: '#0f172a' },
        { name: 'Phoenix Futsal', shortName: 'PF', primary: '#f59e0b', secondary: '#1e293b' },
      ];
      break;
  }

  const generatedTeams: Team[] = sampleTeamDefs.map((def, idx) => ({
    id: `team-${tournament.id}-${idx + 1}`,
    tournamentId: tournament.id,
    name: def.name,
    shortName: def.shortName,
    groupId: idx < 2 ? 'group-a' : 'group-b',
    registrationStatus: 'CONFIRMED',
    paymentStatus: idx === 0 ? 'PAID' : idx === 1 ? 'PARTIALLY_PAID' : 'UNPAID',
    registrationFee: tournament.teamRegistrationFee,
    amountReceived: idx === 0 ? tournament.teamRegistrationFee : idx === 1 ? Math.floor(tournament.teamRegistrationFee / 2) : 0,
    paymentMethod: idx === 0 ? 'BANK_TRANSFER' : idx === 1 ? 'DIGITAL_WALLET' : undefined,
    paymentReference: idx === 0 ? `TRX-${tournament.id}-001` : idx === 1 ? `ESEWA-${tournament.id}-002` : undefined,
    primaryColor: def.primary,
    secondaryColor: def.secondary,
    managerName: `Manager ${idx + 1}`,
    managerPhone: `+977-980000000${idx + 1}`,
    managerEmail: `team${idx + 1}@arenaops.io`,
    registrationDate: regDate,
  }));

  // Generate 4 players per team
  const generatedPlayers: Player[] = [];
  const playerNames = [
    [['Aarav', 'Sharma'], ['Bikash', 'Thapa'], ['Roshan', 'Shrestha'], ['Pradeep', 'Gurung']],
    [['Sujan', 'Magar'], ['Dipen', 'Rai'], ['Kiran', 'Lama'], ['Manish', 'Adhikari']],
    [['Nabin', 'Karki'], ['Bibek', 'Bista'], ['Santosh', 'Tamang'], ['Anil', 'KC']],
    [['Rabin', 'Basnet'], ['Dipesh', 'Shah'], ['Suman', 'GC'], ['Prakash', 'Khatri']],
  ];

  generatedTeams.forEach((team, tIdx) => {
    const names = playerNames[tIdx] || playerNames[0];
    names.forEach(([first, last], pIdx) => {
      generatedPlayers.push({
        id: `ply-${tournament.id}-${tIdx + 1}-${pIdx + 1}`,
        tournamentId: tournament.id,
        teamId: team.id,
        firstName: first,
        lastName: last,
        displayName: `${first} ${last}`,
        jerseyNumber: (pIdx + 1) * 7 % 23 + 1,
        position: pIdx === 0 ? 'Pivot / Forward' : pIdx === 1 ? 'Flanker / Winger' : pIdx === 2 ? 'Defender' : 'Goalkeeper',
        isCaptain: pIdx === 0,
        isGoalkeeper: pIdx === 3,
      });
    });
  });

  // Generate 2 opening matches
  const venueName = tournament.venues?.[0]?.name || 'Sports Arena';
  const courtName = tournament.venues?.[0]?.courts?.[0] || 'Court 1';
  const startMatchTime = new Date(tournament.startDateTime).toISOString();
  const secondMatchTime = new Date(new Date(tournament.startDateTime).getTime() + 60 * 60 * 1000).toISOString();

  const generatedMatches: Match[] = [
    {
      id: `mat-${tournament.id}-01`,
      tournamentId: tournament.id,
      matchNumber: 1,
      stage: 'GROUP_STAGE',
      roundName: 'Group Stage - Matchday 1',
      homeTeamId: generatedTeams[0].id,
      awayTeamId: generatedTeams[1].id,
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED',
      scheduledAt: startMatchTime,
      venueName,
      courtName,
      currentPeriod: 1,
      currentMinute: 0,
    },
    {
      id: `mat-${tournament.id}-02`,
      tournamentId: tournament.id,
      matchNumber: 2,
      stage: 'GROUP_STAGE',
      roundName: 'Group Stage - Matchday 1',
      homeTeamId: generatedTeams[2].id,
      awayTeamId: generatedTeams[3].id,
      homeScore: 0,
      awayScore: 0,
      status: 'SCHEDULED',
      scheduledAt: secondMatchTime,
      venueName,
      courtName,
      currentPeriod: 1,
      currentMinute: 0,
    }
  ];

  return {
    teams: generatedTeams,
    players: generatedPlayers,
    matches: generatedMatches,
  };
}
