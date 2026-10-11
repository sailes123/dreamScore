import { 
  SportConfiguration, 
  TournamentPackage, 
  TournamentPackagePrice, 
  TournamentPurchase, 
  Tournament, 
  Team, 
  Player, 
  Match, 
  MatchEvent, 
  TournamentMember,
  LightweightTournamentHistory,
  AuditLogEntry,
  User,
  ArchivedTournamentRecord
} from '../types';

export const INITIAL_SPORTS: SportConfiguration[] = [
  {
    id: 'sport-futsal',
    code: 'FUTSAL',
    name: 'Futsal (FIFA 5v5)',
    playersOnField: 5,
    maxSquadSize: 14,
    defaultMatchDurationMinutes: 40,
    periods: 2,
    periodName: 'Half (20 mins)',
    extraTimeMinutes: 10,
    hasPenalties: true,
    scoringType: 'GOALS',
    availableEventTypes: ['GOAL', 'ASSIST', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'PENALTY_GOAL', 'PENALTY_MISS', 'FOUL'],
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0
  },
  {
    id: 'sport-football',
    code: 'FOOTBALL',
    name: 'Football (11v11)',
    playersOnField: 11,
    maxSquadSize: 23,
    defaultMatchDurationMinutes: 90,
    periods: 2,
    periodName: 'Half (45 mins)',
    extraTimeMinutes: 30,
    hasPenalties: true,
    scoringType: 'GOALS',
    availableEventTypes: ['GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'PENALTY_GOAL', 'FOUL'],
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0
  },
  {
    id: 'sport-basketball',
    code: 'BASKETBALL',
    name: 'Basketball',
    playersOnField: 5,
    maxSquadSize: 15,
    defaultMatchDurationMinutes: 40,
    periods: 4,
    periodName: 'Quarter (10 mins)',
    extraTimeMinutes: 5,
    hasPenalties: false,
    scoringType: 'POINTS',
    availableEventTypes: ['FIELD_GOAL_2PT', 'FIELD_GOAL_3PT', 'FREE_THROW', 'FOUL', 'TIMEOUT', 'SUBSTITUTION'],
    pointsForWin: 2,
    pointsForDraw: 0,
    pointsForLoss: 1
  },
  {
    id: 'sport-volleyball',
    code: 'VOLLEYBALL',
    name: 'Volleyball',
    playersOnField: 6,
    maxSquadSize: 14,
    defaultMatchDurationMinutes: 60,
    periods: 3,
    periodName: 'Set (25 pts)',
    extraTimeMinutes: 0,
    hasPenalties: false,
    scoringType: 'POINTS',
    availableEventTypes: ['POINT_ATTACK', 'POINT_BLOCK', 'POINT_ACE', 'POINT_WINNER', 'OPPONENT_ERROR', 'FAULT', 'SUBSTITUTION', 'TIMEOUT'],
    pointsForWin: 3,
    pointsForDraw: 0,
    pointsForLoss: 0
  },
  {
    id: 'sport-cricket',
    code: 'CRICKET',
    name: 'Cricket (T20)',
    playersOnField: 11,
    maxSquadSize: 18,
    defaultMatchDurationMinutes: 180,
    periods: 2,
    periodName: 'Innings (20 Overs)',
    extraTimeMinutes: 0,
    hasPenalties: false,
    scoringType: 'RUNS',
    availableEventTypes: ['RUN_1', 'RUN_2', 'BOUNDARY_4', 'BOUNDARY_6', 'EXTRA_RUN', 'WICKET', 'SUBSTITUTION'],
    pointsForWin: 2,
    pointsForDraw: 1,
    pointsForLoss: 0
  },
  {
    id: 'sport-marathon',
    code: 'MARATHON',
    name: 'Marathon & Road Race',
    playersOnField: 1,
    maxSquadSize: 50,
    defaultMatchDurationMinutes: 240,
    periods: 4,
    periodName: 'Split (10km)',
    extraTimeMinutes: 0,
    hasPenalties: false,
    scoringType: 'TIME_RANK',
    availableEventTypes: ['CHECKPOINT', 'FINISH_RANK', 'DNF', 'SUBSTITUTION'],
    pointsForWin: 10,
    pointsForDraw: 0,
    pointsForLoss: 0
  },
  {
    id: 'sport-badminton',
    code: 'BADMINTON',
    name: 'Badminton',
    playersOnField: 2,
    maxSquadSize: 6,
    defaultMatchDurationMinutes: 45,
    periods: 3,
    periodName: 'Game (21 pts)',
    extraTimeMinutes: 0,
    hasPenalties: false,
    scoringType: 'POINTS',
    availableEventTypes: ['POINT_WINNER', 'POINT_ACE', 'OPPONENT_ERROR', 'FAULT', 'SUBSTITUTION', 'TIMEOUT'],
    pointsForWin: 2,
    pointsForDraw: 0,
    pointsForLoss: 0
  },
  {
    id: 'sport-table-tennis',
    code: 'TABLE_TENNIS',
    name: 'Table Tennis',
    playersOnField: 2,
    maxSquadSize: 6,
    defaultMatchDurationMinutes: 30,
    periods: 5,
    periodName: 'Game (11 pts)',
    extraTimeMinutes: 0,
    hasPenalties: false,
    scoringType: 'POINTS',
    availableEventTypes: ['POINT_WINNER', 'OPPONENT_ERROR', 'FAULT', 'TIMEOUT', 'SUBSTITUTION'],
    pointsForWin: 2,
    pointsForDraw: 0,
    pointsForLoss: 0
  }
];

export const INITIAL_PACKAGES: TournamentPackage[] = [
  {
    id: 'pkg-3days',
    name: '3 Days Tournament',
    durationCode: '3_DAYS',
    maxDays: 3,
    description: 'Perfect for weekend cups, corporate tournaments, and short knockouts.',
    displayOrder: 1
  },
  {
    id: 'pkg-1week',
    name: '1 Week Tournament',
    durationCode: '1_WEEK',
    maxDays: 7,
    description: 'Great for week-long regional tournaments and festival championships.',
    displayOrder: 2
  },
  {
    id: 'pkg-1month',
    name: '1 Month Tournament',
    durationCode: '1_MONTH',
    maxDays: 30,
    description: 'Designed for amateur leagues, inter-college cups, and group stages with knockouts.',
    displayOrder: 3
  },
  {
    id: 'pkg-2months',
    name: '2 Months Tournament',
    durationCode: '2_MONTHS',
    maxDays: 60,
    description: 'Ideal for community seasons and multi-division league competitions.',
    displayOrder: 4
  },
  {
    id: 'pkg-1year',
    name: '1 Year Annual Season',
    durationCode: '1_YEAR',
    maxDays: 365,
    description: 'Full annual enterprise package for ongoing leagues, clubs, and sports federations.',
    displayOrder: 5
  }
];

export const INITIAL_PACKAGE_PRICES: TournamentPackagePrice[] = [
  // Example historical versioning for 3-Day package
  {
    id: 'price-3days-v1',
    packageId: 'pkg-3days',
    version: 1,
    price: 2000,
    currency: 'NPR',
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: '2026-07-31T23:59:59Z',
    status: 'ARCHIVED',
    createdBy: 'Platform Admin',
    createdAt: '2026-01-01T00:00:00Z',
    notes: 'Initial introductory pricing'
  },
  {
    id: 'price-3days-v2',
    packageId: 'pkg-3days',
    version: 2,
    price: 2500,
    currency: 'NPR',
    effectiveFrom: '2026-08-01T00:00:00Z',
    effectiveUntil: null, // current active version
    status: 'ACTIVE',
    createdBy: 'Platform Admin',
    createdAt: '2026-08-01T00:00:00Z',
    notes: 'Updated standard rate with automated exports'
  },
  {
    id: 'price-1week-v1',
    packageId: 'pkg-1week',
    version: 1,
    price: 4500,
    currency: 'NPR',
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: null,
    status: 'ACTIVE',
    createdBy: 'Platform Admin',
    createdAt: '2026-01-01T00:00:00Z',
    notes: 'Standard 7-day rate'
  },
  {
    id: 'price-1month-v1',
    packageId: 'pkg-1month',
    version: 1,
    price: 12000,
    currency: 'NPR',
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: null,
    status: 'ACTIVE',
    createdBy: 'Platform Admin',
    createdAt: '2026-01-01T00:00:00Z',
    notes: 'Standard 30-day league rate'
  },
  {
    id: 'price-2months-v1',
    packageId: 'pkg-2months',
    version: 1,
    price: 20000,
    currency: 'NPR',
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: null,
    status: 'ACTIVE',
    createdBy: 'Platform Admin',
    createdAt: '2026-01-01T00:00:00Z',
    notes: 'Standard 60-day rate'
  },
  {
    id: 'price-1year-v1',
    packageId: 'pkg-1year',
    version: 1,
    price: 60000,
    currency: 'NPR',
    effectiveFrom: '2026-01-01T00:00:00Z',
    effectiveUntil: null,
    status: 'ACTIVE',
    createdBy: 'Platform Admin',
    createdAt: '2026-01-01T00:00:00Z',
    notes: 'Annual license with premium support'
  }
];

export const CURRENT_PRICING_CATALOG = {
  PRO: {
    versionId: 'price-3days-v2',
    name: 'Single Tournament Pro',
    amountNpr: 2500,
    amountUsd: 20,
    currency: 'NPR'
  },
  MULTI_PRO: {
    versionId: 'price-1week-v1',
    name: 'Season 5-Tournament Pack',
    amountNpr: 4500,
    amountUsd: 35,
    currency: 'NPR'
  }
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    email: 'admin@arenaops.dev',
    name: 'Super Administrator',
    systemRole: 'PLATFORM_ADMIN'
  },
  {
    id: 'user-organizer',
    email: 'bipulmgr@gmail.com',
    name: 'Bipul Shrestha (Organizer)',
    systemRole: 'ORGANIZER'
  },
  {
    id: 'user-manager',
    email: 'sunil.ref@futsal.org',
    name: 'Sunil Gurung (Match Official)',
    systemRole: 'ORGANIZER'
  }
];

// Sample purchase matching section 50 (September 16, 2026)
export const INITIAL_PURCHASE: TournamentPurchase = {
  id: 'purch-ktm-2026',
  purchaserUserId: 'user-organizer',
  purchaserEmail: 'bipulmgr@gmail.com',
  purchaserName: 'Bipul Shrestha',
  tournamentId: 'tourn-ktm-futsal-2026',
  packageId: 'pkg-3days',
  packagePriceId: 'price-3days-v2',
  packageNameSnapshot: '3 Days Tournament',
  packageDurationSnapshot: 'Up to 3 tournament days',
  priceSnapshot: 2500,
  currencySnapshot: 'NPR',
  tier: 'PRO',
  amountPaid: 2500,
  currency: 'NPR',
  invoiceNumber: 'INV-2026-9482',
  paymentProvider: 'eSewa Digital Wallet',
  purchaseDate: '2026-09-16T10:30:00Z',
  status: 'COMPLETED',
  purchasedAt: '2026-09-16T10:30:00Z',
  paymentStatus: 'PAID',
  approvalStatus: 'APPROVED',
  paymentMethod: 'DIGITAL_WALLET',
  paymentReference: 'ESW-994821804',
  paymentNotes: 'Paid via digital wallet eSewa. Verified against bank statement.',
  verifiedBy: 'Super Administrator',
  verifiedAt: '2026-09-16T11:00:00Z'
};

export const INITIAL_TOURNAMENT: Tournament = {
  id: 'tourn-ktm-futsal-2026',
  slug: 'kathmandu-futsal-championship-2026',
  name: 'Kathmandu Futsal Championship 2026',
  sportCode: 'FUTSAL',
  description: 'The premier open futsal championship featuring top 8 teams across Kathmandu and Lalitpur.',
  visibility: 'PUBLIC',
  invitationCode: 'KTM-FUTSAL-2026',
  startDateTime: '2026-10-01T09:00:00Z',
  endDateTime: '2026-10-03T18:00:00Z',
  timezone: 'Asia/Kathmandu',
  status: 'PREPARATION', // initially in preparation!
  ownerId: 'user-organizer',
  ownerEmail: 'bipulmgr@gmail.com',
  packagePurchaseId: 'purch-ktm-2026',
  format: 'GROUP_STAGE_KNOCKOUT',
  numberOfTeams: 8,
  groupsCount: 2,
  pointsForWin: 3,
  pointsForDraw: 1,
  pointsForLoss: 0,
  matchDurationMinutes: 40,
  periods: 2,
  venues: [
    {
      id: 'venue-1',
      tournamentId: 'tourn-ktm-futsal-2026',
      name: 'National Sports Complex Arena',
      address: 'Tripureshwor',
      city: 'Kathmandu',
      country: 'Nepal',
      courts: ['Court 1 (Main Pitch)', 'Court 2 (North Pitch)'],
      directions: 'Opposite to Dasarath Rangasala entrance.'
    }
  ],
  teamRegistrationFee: 15000,
  currency: 'NPR',
  registrationOpenDate: '2026-09-16T00:00:00Z',
  registrationCloseDate: '2026-09-28T23:59:59Z',
  maxTeams: 8,
  metadata: {
    sponsor: 'Mountain Dew & RedBull Nepal',
    organizerOrg: 'Kathmandu Youth Sports Club',
    category: 'Men Open',
    ageGroup: 'Open (16+)',
    contactPhone: '+977-9801234567',
    rulesSummary: 'Standard FIFA Futsal rules. 5 fouls leading to 10m penalty kick. Rolling substitutions.',
    prizePool: 'NPR 150,000 Total (1st: 100k, 2nd: 50k)'
  },
  hasStructureOverride: false,
  createdAt: '2026-09-16T11:15:00Z',
  updatedAt: '2026-09-16T11:15:00Z'
};

export const INITIAL_MEMBERS: TournamentMember[] = [
  {
    id: 'member-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    userId: 'user-organizer',
    userEmail: 'bipulmgr@gmail.com',
    userName: 'Bipul Shrestha',
    role: 'OWNER',
    joinedAt: '2026-09-16T11:15:00Z',
    status: 'ACTIVE'
  },
  {
    id: 'member-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    userId: 'user-manager',
    userEmail: 'sunil.ref@futsal.org',
    userName: 'Sunil Gurung',
    role: 'MANAGER',
    joinedAt: '2026-09-17T09:00:00Z',
    status: 'ACTIVE'
  }
];

export const INITIAL_TEAMS: Team[] = [
  // Group A
  {
    id: 'team-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'Shankhamul Futsal',
    shortName: 'SKM',
    groupId: 'group-a',
    primaryColor: '#0284c7', // Sky Blue
    secondaryColor: '#ffffff',
    managerName: 'Prakash Tamang',
    managerPhone: '+977-9841112233',
    managerEmail: 'prakash@shankhamul.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-17T10:00:00Z',
    registrationFee: 15000,
    amountReceived: 15000,
    paymentStatus: 'PAID',
    paymentMethod: 'DIGITAL_WALLET',
    paymentReference: 'KHALTI-991283',
    paymentDate: '2026-09-17T10:30:00Z'
  },
  {
    id: 'team-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'Kickers FC Kathmandu',
    shortName: 'KFC',
    groupId: 'group-a',
    primaryColor: '#dc2626', // Red
    secondaryColor: '#1e293b',
    managerName: 'Rohan Shrestha',
    managerPhone: '+977-9842223344',
    managerEmail: 'rohan@kickers.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-18T14:00:00Z',
    registrationFee: 15000,
    amountReceived: 15000,
    paymentStatus: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: 'NABIL-TR-5542',
    paymentDate: '2026-09-18T15:00:00Z'
  },
  {
    id: 'team-3',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'Rising Stars FC',
    shortName: 'RSF',
    groupId: 'group-a',
    primaryColor: '#16a34a', // Green
    secondaryColor: '#ffffff',
    managerName: 'Kiran Thapa',
    managerPhone: '+977-9843334455',
    managerEmail: 'kiran@risingstars.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-19T11:00:00Z',
    registrationFee: 15000,
    amountReceived: 10000,
    paymentStatus: 'PARTIALLY_PAID',
    paymentMethod: 'CASH',
    paymentReference: 'REC-00129',
    paymentDate: '2026-09-19T11:30:00Z',
    paymentNotes: 'Balance 5,000 NPR promised on Matchday 1'
  },
  {
    id: 'team-4',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'Pokhara United Futsal',
    shortName: 'POK',
    groupId: 'group-a',
    primaryColor: '#eab308', // Amber
    secondaryColor: '#0f172a',
    managerName: 'Anil Gurung',
    managerPhone: '+977-9844445566',
    managerEmail: 'anil@pokharaunited.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-20T09:00:00Z',
    registrationFee: 15000,
    amountReceived: 0,
    paymentStatus: 'UNPAID',
    paymentNotes: 'Awaiting bank confirmation'
  },
  // Group B
  {
    id: 'team-5',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'Royal Lalitpur Futsal',
    shortName: 'RLF',
    groupId: 'group-b',
    primaryColor: '#7c3aed', // Purple
    secondaryColor: '#f1f5f9',
    managerName: 'Sujan Maharjan',
    managerPhone: '+977-9845556677',
    managerEmail: 'sujan@royallalitpur.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-20T16:00:00Z',
    registrationFee: 15000,
    amountReceived: 15000,
    paymentStatus: 'PAID',
    paymentMethod: 'DIGITAL_WALLET',
    paymentReference: 'ESW-110293',
    paymentDate: '2026-09-20T16:30:00Z'
  },
  {
    id: 'team-6',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'Dhuku Club',
    shortName: 'DHK',
    groupId: 'group-b',
    primaryColor: '#0d9488', // Teal
    secondaryColor: '#ffffff',
    managerName: 'Bikash Karki',
    managerPhone: '+977-9846667788',
    managerEmail: 'bikash@dhuku.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-21T10:00:00Z',
    registrationFee: 15000,
    amountReceived: 15000,
    paymentStatus: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    paymentReference: 'GLOBAL-7712',
    paymentDate: '2026-09-21T10:30:00Z'
  },
  {
    id: 'team-7',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'Sabin Memorial FC',
    shortName: 'SMF',
    groupId: 'group-b',
    primaryColor: '#f97316', // Orange
    secondaryColor: '#1e293b',
    managerName: 'Sanjay Subedi',
    managerPhone: '+977-9847778899',
    managerEmail: 'sanjay@sabinmemorial.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-22T13:00:00Z',
    registrationFee: 15000,
    amountReceived: 15000,
    paymentStatus: 'PAID',
    paymentMethod: 'CASH',
    paymentReference: 'REC-00145',
    paymentDate: '2026-09-22T13:30:00Z'
  },
  {
    id: 'team-8',
    tournamentId: 'tourn-ktm-futsal-2026',
    name: 'The Excelsior Futsal',
    shortName: 'EXC',
    groupId: 'group-b',
    primaryColor: '#334155', // Slate
    secondaryColor: '#38bdf8',
    managerName: 'Deepak Adhikari',
    managerPhone: '+977-9848889900',
    managerEmail: 'deepak@excelsior.np',
    registrationStatus: 'CONFIRMED',
    registrationDate: '2026-09-23T11:00:00Z',
    registrationFee: 15000,
    amountReceived: 15000,
    paymentStatus: 'PAID',
    paymentMethod: 'DIGITAL_WALLET',
    paymentReference: 'FONEPAY-9921',
    paymentDate: '2026-09-23T11:20:00Z'
  }
];

export const INITIAL_PLAYERS: Player[] = [
  // Shankhamul Futsal
  {
    id: 'p-1',
    teamId: 'team-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Anish',
    lastName: 'Shrestha',
    displayName: 'Anish Shrestha',
    jerseyNumber: 1,
    position: 'Goalkeeper',
    isCaptain: false,
    isGoalkeeper: true
  },
  {
    id: 'p-2',
    teamId: 'team-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Kritiish',
    lastName: 'Ratna Chhantyal',
    displayName: 'Kritiish Chhantyal',
    jerseyNumber: 7,
    position: 'Pivot / Forward',
    isCaptain: true,
    isGoalkeeper: false
  },
  {
    id: 'p-3',
    teamId: 'team-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Suman',
    lastName: 'Rai',
    displayName: 'Suman Rai',
    jerseyNumber: 10,
    position: 'Flanker / Winger',
    isCaptain: false,
    isGoalkeeper: false
  },
  {
    id: 'p-4',
    teamId: 'team-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Sujit',
    lastName: 'Budhathoki',
    displayName: 'Sujit Budhathoki',
    jerseyNumber: 4,
    position: 'Defender',
    isCaptain: false,
    isGoalkeeper: false
  },
  {
    id: 'p-5',
    teamId: 'team-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Dharmendra',
    lastName: 'Pradhan',
    displayName: 'Dharmendra Pradhan',
    jerseyNumber: 9,
    position: 'Pivot / Forward',
    isCaptain: false,
    isGoalkeeper: false
  },
  // Kickers FC Kathmandu
  {
    id: 'p-6',
    teamId: 'team-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Bishal',
    lastName: 'Shrestha',
    displayName: 'Bishal Shrestha',
    jerseyNumber: 1,
    position: 'Goalkeeper',
    isCaptain: false,
    isGoalkeeper: true
  },
  {
    id: 'p-7',
    teamId: 'team-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Arik',
    lastName: 'Bista',
    displayName: 'Arik Bista',
    jerseyNumber: 8,
    position: 'Defender',
    isCaptain: true,
    isGoalkeeper: false
  },
  {
    id: 'p-8',
    teamId: 'team-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Bikash',
    lastName: 'KC',
    displayName: 'Bikash KC',
    jerseyNumber: 11,
    position: 'Flanker / Winger',
    isCaptain: false,
    isGoalkeeper: false
  },
  {
    id: 'p-9',
    teamId: 'team-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Manish',
    lastName: 'Dangi',
    displayName: 'Manish Dangi',
    jerseyNumber: 10,
    position: 'Pivot / Forward',
    isCaptain: false,
    isGoalkeeper: false
  },
  // Royal Lalitpur Futsal
  {
    id: 'p-10',
    teamId: 'team-5',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Deep',
    lastName: 'Karki',
    displayName: 'Deep Karki',
    jerseyNumber: 1,
    position: 'Goalkeeper',
    isCaptain: false,
    isGoalkeeper: true
  },
  {
    id: 'p-11',
    teamId: 'team-5',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Suraj',
    lastName: 'Gurung',
    displayName: 'Suraj Gurung',
    jerseyNumber: 10,
    position: 'Pivot / Forward',
    isCaptain: true,
    isGoalkeeper: false
  },
  {
    id: 'p-12',
    teamId: 'team-5',
    tournamentId: 'tourn-ktm-futsal-2026',
    firstName: 'Nishan',
    lastName: 'Limbu',
    displayName: 'Nishan Limbu',
    jerseyNumber: 7,
    position: 'Flanker / Winger',
    isCaptain: false,
    isGoalkeeper: false
  }
];

export const INITIAL_MATCHES: Match[] = [
  // Group A - Matchday 1
  {
    id: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    matchNumber: 1,
    stage: 'GROUP_STAGE',
    roundName: 'Group A · Matchday 1',
    groupId: 'group-a',
    homeTeamId: 'team-1', // Shankhamul
    awayTeamId: 'team-2', // Kickers FC
    venueName: 'National Sports Complex Arena',
    courtName: 'Court 1 (Main Pitch)',
    scheduledAt: '2026-10-01T09:30:00Z',
    homeScore: 4,
    awayScore: 2,
    status: 'COMPLETED',
    actualStart: '2026-10-01T09:30:00Z',
    actualEnd: '2026-10-01T10:15:00Z',
    refereeNotes: 'Pristine opening match. High intensity.'
  },
  {
    id: 'match-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    matchNumber: 2,
    stage: 'GROUP_STAGE',
    roundName: 'Group A · Matchday 1',
    groupId: 'group-a',
    homeTeamId: 'team-3', // Rising Stars
    awayTeamId: 'team-4', // Pokhara United
    venueName: 'National Sports Complex Arena',
    courtName: 'Court 2 (North Pitch)',
    scheduledAt: '2026-10-01T10:30:00Z',
    homeScore: 3,
    awayScore: 1,
    status: 'COMPLETED',
    actualStart: '2026-10-01T10:30:00Z',
    actualEnd: '2026-10-01T11:15:00Z',
    refereeNotes: 'Decisive tactical victory for Rising Stars.'
  },
  // Group B - Matchday 1 (Active LIVE Match!)
  {
    id: 'match-3',
    tournamentId: 'tourn-ktm-futsal-2026',
    matchNumber: 3,
    stage: 'GROUP_STAGE',
    roundName: 'Group B · Matchday 1',
    groupId: 'group-b',
    homeTeamId: 'team-5', // Royal Lalitpur
    awayTeamId: 'team-6', // Dhuku Club
    venueName: 'National Sports Complex Arena',
    courtName: 'Court 1 (Main Pitch)',
    scheduledAt: '2026-10-01T11:45:00Z',
    homeScore: 2,
    awayScore: 1,
    status: 'LIVE',
    currentPeriod: 2,
    currentMinute: 28,
    actualStart: '2026-10-01T11:45:00Z',
    refereeNotes: 'Second half in progress. Fast counter attacks.'
  },
  {
    id: 'match-4',
    tournamentId: 'tourn-ktm-futsal-2026',
    matchNumber: 4,
    stage: 'GROUP_STAGE',
    roundName: 'Group B · Matchday 1',
    groupId: 'group-b',
    homeTeamId: 'team-7', // Sabin Memorial
    awayTeamId: 'team-8', // The Excelsior
    venueName: 'National Sports Complex Arena',
    courtName: 'Court 2 (North Pitch)',
    scheduledAt: '2026-10-01T13:00:00Z',
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED'
  },
  // Knockouts (Semi-finals & Final) scheduled for Oct 3
  {
    id: 'match-semi-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    matchNumber: 13,
    stage: 'SEMI_FINAL',
    roundName: 'Semi-Final 1',
    homeTeamId: 'team-1',
    awayTeamId: 'team-6',
    venueName: 'National Sports Complex Arena',
    courtName: 'Court 1 (Main Pitch)',
    scheduledAt: '2026-10-03T10:00:00Z',
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED'
  },
  {
    id: 'match-semi-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    matchNumber: 14,
    stage: 'SEMI_FINAL',
    roundName: 'Semi-Final 2',
    homeTeamId: 'team-5',
    awayTeamId: 'team-2',
    venueName: 'National Sports Complex Arena',
    courtName: 'Court 1 (Main Pitch)',
    scheduledAt: '2026-10-03T11:30:00Z',
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED'
  },
  {
    id: 'match-final',
    tournamentId: 'tourn-ktm-futsal-2026',
    matchNumber: 15,
    stage: 'FINAL',
    roundName: 'Grand Final',
    homeTeamId: 'team-1',
    awayTeamId: 'team-5',
    venueName: 'National Sports Complex Arena',
    courtName: 'Court 1 (Main Pitch)',
    scheduledAt: '2026-10-03T15:30:00Z',
    homeScore: 0,
    awayScore: 0,
    status: 'SCHEDULED'
  }
];

export const INITIAL_MATCH_EVENTS: MatchEvent[] = [
  // Match 1 Events: Shankhamul 4 - 2 Kickers FC
  {
    id: 'ev-1',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-1',
    playerId: 'p-1', // Suman Rai
    secondaryPlayerId: 'p-2', // Bikash Thapa
    eventType: 'GOAL',
    minute: 4,
    period: 1,
    notes: 'Curling bottom corner finish from edge of the D.',
    createdAt: '2026-10-01T09:34:00Z'
  },
  {
    id: 'ev-2',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-1',
    playerId: 'p-1', // Suman Rai
    eventType: 'GOAL',
    minute: 12,
    period: 1,
    notes: 'Rebound tapped into the open net.',
    createdAt: '2026-10-01T09:42:00Z'
  },
  {
    id: 'ev-3',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-2',
    playerId: 'p-4', // Manish Dangi
    secondaryPlayerId: 'p-5', // Anjan Bista
    eventType: 'GOAL',
    minute: 18,
    period: 1,
    notes: 'Brilliant solo run cutting inside from left flank.',
    createdAt: '2026-10-01T09:48:00Z'
  },
  {
    id: 'ev-4',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-2',
    playerId: 'p-5', // Anjan Bista
    eventType: 'YELLOW_CARD',
    minute: 22,
    period: 2,
    notes: 'Tactical foul stopping counter-attack.',
    createdAt: '2026-10-01T09:55:00Z'
  },
  {
    id: 'ev-5',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-1',
    playerId: 'p-3', // Prakash Lama coming ON
    secondaryPlayerId: 'p-1', // Suman Rai coming OFF
    eventType: 'SUBSTITUTION',
    minute: 27,
    period: 2,
    notes: 'Tactical rotation for fresh legs.',
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'ev-6',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-1',
    playerId: 'p-2', // Bikash Thapa
    secondaryPlayerId: 'p-3', // Prakash Lama
    eventType: 'GOAL',
    minute: 31,
    period: 2,
    notes: 'First-time volley into upper roof.',
    createdAt: '2026-10-01T10:04:00Z'
  },
  {
    id: 'ev-7',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-2',
    playerId: 'p-4', // Manish Dangi
    eventType: 'GOAL',
    minute: 36,
    period: 2,
    notes: 'Toe-poke beating goalkeeper at near post.',
    createdAt: '2026-10-01T10:09:00Z'
  },
  {
    id: 'ev-8',
    matchId: 'match-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-1',
    playerId: 'p-3', // Prakash Lama
    secondaryPlayerId: 'p-2', // Bikash Thapa
    eventType: 'GOAL',
    minute: 39,
    period: 2,
    notes: 'Seals the win on counter in the final minute.',
    createdAt: '2026-10-01T10:14:00Z'
  },
  // Match 2 Events: Rising Stars 3 - 1 Pokhara United
  {
    id: 'ev-9',
    matchId: 'match-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-3',
    playerId: 'p-7', // Anil Maharjan
    eventType: 'GOAL',
    minute: 8,
    period: 1,
    notes: 'Precision free kick over the 3-man wall.',
    createdAt: '2026-10-01T10:38:00Z'
  },
  {
    id: 'ev-10',
    matchId: 'match-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-3',
    playerId: 'p-7', // Anil Maharjan
    secondaryPlayerId: 'p-6', // Rohit Chand
    eventType: 'GOAL',
    minute: 15,
    period: 1,
    notes: 'Tap-in following quick one-two passing sequence.',
    createdAt: '2026-10-01T10:45:00Z'
  },
  {
    id: 'ev-11',
    matchId: 'match-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-4',
    playerId: 'p-8', // Subash Gurung
    eventType: 'GOAL',
    minute: 24,
    period: 2,
    notes: 'Long range strike from inside own half.',
    createdAt: '2026-10-01T10:57:00Z'
  },
  {
    id: 'ev-12',
    matchId: 'match-2',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-3',
    playerId: 'p-6', // Rohit Chand
    eventType: 'GOAL',
    minute: 35,
    period: 2,
    notes: 'Header from back post corner.',
    createdAt: '2026-10-01T11:08:00Z'
  },
  // Match 3 Events (Live Match): Royal Lalitpur 2 - 1 Dhuku Club
  {
    id: 'ev-13',
    matchId: 'match-3',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-5',
    playerId: 'p-11', // Suraj Gurung
    secondaryPlayerId: 'p-12', // Nishan Limbu
    eventType: 'GOAL',
    minute: 10,
    period: 1,
    notes: 'Clean finish into bottom left.',
    createdAt: '2026-10-01T11:55:00Z'
  },
  {
    id: 'ev-14',
    matchId: 'match-3',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-5',
    playerId: 'p-12', // Nishan Limbu
    eventType: 'GOAL',
    minute: 19,
    period: 1,
    notes: 'Power shot deflected off post and in.',
    createdAt: '2026-10-01T12:04:00Z'
  },
  {
    id: 'ev-15',
    matchId: 'match-3',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-6',
    playerId: 'p-9', // Dhuku striker
    eventType: 'GOAL',
    minute: 23,
    period: 2,
    notes: 'Pulling one back early in second half.',
    createdAt: '2026-10-01T12:12:00Z'
  },
  {
    id: 'ev-16',
    matchId: 'match-3',
    tournamentId: 'tourn-ktm-futsal-2026',
    teamId: 'team-5',
    playerId: 'p-10', // Deep Karki coming ON
    secondaryPlayerId: 'p-11', // Suraj Gurung coming OFF
    eventType: 'SUBSTITUTION',
    minute: 26,
    period: 2,
    notes: 'Tactical defensive substitution.',
    createdAt: '2026-10-01T12:16:00Z'
  }
];

export const INITIAL_ARCHIVED_TOURNAMENTS: ArchivedTournamentRecord[] = [
  {
    id: 'arch-ktm-futsal-2025',
    tournamentId: 'tourn-ktm-winter-2025',
    name: 'Kathmandu Winter Futsal Championship 2025',
    sportType: 'Futsal',
    archivedAt: '2025-12-28T18:00:00Z',
    winnerTeamName: 'Shankhamul Futsal',
    runnerUpTeamName: 'Dhuku Futsal Hub',
    goldenBootPlayer: 'Suman Rai',
    goldenBootGoals: 12,
    totalTeams: 8,
    totalMatches: 15,
    totalGoals: 54,
    exportRecordFilename: 'Kathmandu_Winter_Futsal_2025_Final_Archive.xlsx'
  },
  {
    id: 'arch-pokhara-cup-2025',
    tournamentId: 'tourn-pokhara-cup-2025',
    name: 'Annapurna Valley Futsal Open 2025',
    sportType: 'Futsal',
    archivedAt: '2025-10-15T16:30:00Z',
    winnerTeamName: 'Lakeside Kickers',
    runnerUpTeamName: 'Machhapuchhre Youth',
    goldenBootPlayer: 'Anil Gurung',
    goldenBootGoals: 9,
    totalTeams: 6,
    totalMatches: 10,
    totalGoals: 38,
    exportRecordFilename: 'Annapurna_Valley_Futsal_2025_Report.xlsx'
  }
];

// Lightweight history record from past purged tournament (Section 6)
export const INITIAL_HISTORY: LightweightTournamentHistory[] = [
  {
    id: 'hist-monsoon-2026',
    tournamentId: 'tourn-monsoon-cup-2026',
    tournamentName: 'Monsoon Super Futsal Cup 2026',
    sport: 'Futsal',
    startDate: '2026-07-12',
    endDate: '2026-07-14',
    location: 'Lalitpur, Nepal',
    packagePurchased: '3 Days Tournament',
    purchasePrice: 2000,
    currency: 'NPR',
    paymentMethod: 'Bank Transfer',
    purchaseDate: '2026-06-25',
    tournamentStatus: 'ARCHIVED / PURGED',
    dataExportDate: '2026-07-21',
    dataDeletionDate: '2026-07-22',
    exportDeliveryStatus: 'COMPLETED (Sent to bipulmgr@gmail.com)'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-1',
    timestamp: '2026-09-16T10:30:00Z',
    userId: 'user-organizer',
    userEmail: 'bipulmgr@gmail.com',
    action: 'PURCHASE_CREATED',
    entityType: 'PAYMENT',
    entityId: 'purch-ktm-2026',
    tournamentId: 'tourn-ktm-futsal-2026',
    newValue: '3 Days Tournament (2,500 NPR - Version 2)'
  },
  {
    id: 'audit-2',
    timestamp: '2026-09-16T11:00:00Z',
    userId: 'user-admin',
    userEmail: 'admin@arenaops.dev',
    action: 'PURCHASE_VERIFIED_AND_APPROVED',
    entityType: 'PAYMENT',
    entityId: 'purch-ktm-2026',
    tournamentId: 'tourn-ktm-futsal-2026',
    oldValue: 'PENDING',
    newValue: 'PAID / APPROVED'
  },
  {
    id: 'audit-3',
    timestamp: '2026-09-16T11:15:00Z',
    userId: 'user-organizer',
    userEmail: 'bipulmgr@gmail.com',
    action: 'TOURNAMENT_CREATED',
    entityType: 'TOURNAMENT',
    entityId: 'tourn-ktm-futsal-2026',
    tournamentId: 'tourn-ktm-futsal-2026',
    newValue: 'Kathmandu Futsal Championship 2026 (PREPARATION state)'
  },
  {
    id: 'audit-4',
    timestamp: '2026-09-17T10:00:00Z',
    userId: 'user-organizer',
    userEmail: 'bipulmgr@gmail.com',
    action: 'TEAM_REGISTERED',
    entityType: 'TEAM',
    entityId: 'team-1',
    tournamentId: 'tourn-ktm-futsal-2026',
    newValue: 'Shankhamul Futsal'
  }
];
