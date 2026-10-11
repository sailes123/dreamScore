export type SportCode = 
  | 'FUTSAL' 
  | 'FOOTBALL' 
  | 'CRICKET' 
  | 'BASKETBALL' 
  | 'VOLLEYBALL' 
  | 'MARATHON' 
  | 'BADMINTON' 
  | 'TABLE_TENNIS';

export interface SportConfiguration {
  id: string;
  code: SportCode;
  name: string;
  playersOnField: number;
  maxSquadSize: number;
  defaultMatchDurationMinutes: number;
  periods: number;
  periodName: string; // "Half", "Quarter", "Set", "Innings", "Split"
  extraTimeMinutes: number;
  hasPenalties: boolean;
  scoringType: 'GOALS' | 'POINTS' | 'RUNS' | 'TIME_RANK';
  availableEventTypes: string[];
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
}

export type TournamentPackageDuration = '3_DAYS' | '1_WEEK' | '1_MONTH' | '2_MONTHS' | '1_YEAR';

export interface TournamentPackage {
  id: string;
  name: string;
  durationCode: TournamentPackageDuration;
  maxDays: number;
  description: string;
  displayOrder: number;
  tier?: string;
  includedTournamentsCount?: number;
  maxTeamsAllowed?: number;
  maxCourtsAllowed?: number;
  retentionGraceDays?: number;
}

export interface TournamentPackagePrice {
  id: string;
  packageId: string;
  version: number;
  price: number;
  currency: string;
  effectiveFrom: string; // ISO date
  effectiveUntil: string | null; // null if current active version
  status: 'ACTIVE' | 'ARCHIVED';
  createdBy: string;
  createdAt: string;
  notes?: string;
  versionCode?: string;
}

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'DIGITAL_WALLET' | 'OTHER';
export type PurchasePaymentStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';
export type PurchaseApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TournamentPurchase {
  id: string;
  purchaserUserId: string;
  purchaserEmail: string;
  purchaserName: string;
  tournamentId?: string;
  packageId: string;
  packagePriceId: string;
  // Immutable snapshots
  packageNameSnapshot: string;
  packageDurationSnapshot: string;
  priceSnapshot: number;
  currencySnapshot: string;
  purchasedAt: string;
  paymentStatus: PurchasePaymentStatus;
  approvalStatus: PurchaseApprovalStatus;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  // Convenience & display extensions
  invoiceNumber?: string;
  tier?: string;
  amountPaid?: number;
  currency?: string;
  paymentProvider?: string;
  purchaseDate?: string;
  status?: string;
  purchasedTournamentsCount?: number;
  remainingTournamentsCount?: number;
}

export type UserRole = 'PLATFORM_ADMIN' | 'TOURNAMENT_OWNER' | 'TOURNAMENT_MANAGER' | 'PUBLIC_USER';

export interface User {
  id: string;
  email: string;
  name: string;
  systemRole: 'PLATFORM_ADMIN' | 'ORGANIZER' | 'PUBLIC';
  avatarUrl?: string;
}

export interface TournamentMember {
  id: string;
  tournamentId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: 'OWNER' | 'MANAGER';
  joinedAt: string;
  status: 'ACTIVE' | 'INVITED';
}

export type TournamentLifecycleState = 
  | 'DRAFT'
  | 'PREPARATION'
  | 'LIVE'
  | 'ENDED'
  | 'RETENTION_GRACE'
  | 'ARCHIVED';

export type TournamentVisibility = 'PUBLIC' | 'PRIVATE';
export type TournamentFormat = 'ROUND_ROBIN' | 'KNOCKOUT' | 'GROUP_STAGE_KNOCKOUT';

export interface TournamentVenue {
  id: string;
  tournamentId: string;
  name: string;
  address: string;
  city: string;
  country: string;
  courts: string[]; // e.g. ["Court A", "Court B"]
  directions?: string;
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  sportCode: SportCode;
  sportType?: SportCode;
  description: string;
  visibility: TournamentVisibility;
  invitationCode?: string; // Prepared for future private tournaments
  startDateTime: string; // ISO UTC
  endDateTime: string; // ISO UTC
  timezone: string; // e.g. "Asia/Kathmandu"
  status: TournamentLifecycleState;
  ownerId: string;
  ownerEmail: string;
  packagePurchaseId: string;
  // Structure & Rules
  format: TournamentFormat;
  numberOfTeams: number;
  groupsCount: number;
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
  matchDurationMinutes: number;
  periods: number;
  venues: TournamentVenue[];
  // Team registration settings
  teamRegistrationFee: number;
  currency: string;
  registrationOpenDate: string;
  registrationCloseDate: string;
  maxTeams: number;
  // Metadata / Custom Fields
  metadata: {
    sponsor?: string;
    organizerOrg?: string;
    category?: string;
    ageGroup?: string;
    contactPhone?: string;
    rulesSummary?: string;
    prizePool?: string;
  };
  hasStructureOverride?: boolean;
  structureLockedAt?: string; // Locked once first match starts
  createdAt: string;
  updatedAt: string;
}

export type TeamRegistrationStatus = 'DRAFT' | 'REGISTERED' | 'CONFIRMED' | 'WITHDRAWN' | 'DISQUALIFIED';
export type TeamPaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  shortName: string;
  groupId?: string;
  logoText?: string;
  primaryColor: string;
  secondaryColor: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  registrationStatus: TeamRegistrationStatus;
  registrationDate: string;
  notes?: string;
  // Registration Payment
  registrationFee: number;
  amountReceived: number;
  paymentStatus: TeamPaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentDate?: string;
  paymentNotes?: string;
}

export interface Player {
  id: string;
  teamId: string;
  tournamentId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  jerseyNumber: number;
  position: 'Goalkeeper' | 'Defender' | 'Flanker / Winger' | 'Pivot / Forward' | 'Universal';
  isCaptain: boolean;
  isGoalkeeper: boolean;
  dateOfBirth?: string;
  nationality?: string;
  notes?: string;
}

export type MatchStatus = 
  | 'SCHEDULED'
  | 'READY'
  | 'LIVE'
  | 'HALFTIME'
  | 'COMPLETED'
  | 'POSTPONED'
  | 'CANCELLED';

export interface Match {
  id: string;
  tournamentId: string;
  matchNumber: number;
  stage: 'GROUP_STAGE' | 'QUARTER_FINAL' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL';
  roundName: string; // "Matchday 1", "Round 1", "Quarter-final 1"
  groupId?: string;
  homeTeamId: string;
  awayTeamId: string;
  venueName: string;
  courtName: string;
  scheduledAt: string; // ISO
  actualStart?: string;
  actualEnd?: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  currentPeriod?: number;
  currentMinute?: number;
  refereeNotes?: string;
}

export type MatchEventType = 
  | 'GOAL'
  | 'ASSIST'
  | 'OWN_GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SECOND_YELLOW_RED'
  | 'SUBSTITUTION'
  | 'PENALTY_GOAL'
  | 'PENALTY_MISS'
  | 'FOUL'
  // Basketball
  | 'FIELD_GOAL_2PT'
  | 'FIELD_GOAL_3PT'
  | 'FREE_THROW'
  | 'TIMEOUT'
  // Cricket
  | 'RUN_1'
  | 'RUN_2'
  | 'BOUNDARY_4'
  | 'BOUNDARY_6'
  | 'EXTRA_RUN'
  | 'WICKET'
  // Volleyball / Badminton / Table Tennis
  | 'POINT_ATTACK'
  | 'POINT_BLOCK'
  | 'POINT_ACE'
  | 'POINT_WINNER'
  | 'OPPONENT_ERROR'
  | 'FAULT'
  // Marathon
  | 'CHECKPOINT'
  | 'FINISH_RANK'
  | 'DNF';

export interface MatchEvent {
  id: string;
  matchId: string;
  tournamentId: string;
  teamId: string;
  playerId: string;
  secondaryPlayerId?: string; // e.g. assist provider or player coming off in sub
  eventType: MatchEventType;
  minute: number;
  period: number | 'extra';
  additionalTime?: number;
  notes?: string;
  createdAt: string;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  shortName: string;
  groupId?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface PlayerStatistic {
  playerId: string;
  displayName: string;
  jerseyNumber: number;
  teamId: string;
  teamName: string;
  matchesPlayed: number;
  goals: number;
  assists: number;
  ownGoals: number;
  yellowCards: number;
  redCards: number;
  fouls: number;
  // Multi-sport metrics
  points: number;
  runs: number;
  wickets: number;
  aces: number;
  substitutions: number;
}

export interface ArchivedTournamentRecord {
  id: string;
  tournamentId: string;
  name: string;
  sportType: string;
  archivedAt: string;
  winnerTeamName: string;
  runnerUpTeamName: string;
  goldenBootPlayer: string;
  goldenBootGoals: number;
  totalTeams: number;
  totalMatches: number;
  totalGoals: number;
  exportRecordFilename: string;
}

export interface TournamentExportRecord {
  id: string;
  tournamentId: string;
  tournamentName: string;
  generatedAt: string;
  fileSizeBytes: number;
  filename: string;
  emailSentTo: string;
  emailSentAt: string | null;
  emailStatus: 'PENDING' | 'SENT' | 'FAILED';
  retryCount: number;
  errorMessage?: string;
  isPurgeEligible: boolean;
  purgedAt: string | null;
}

export interface LightweightTournamentHistory {
  id: string;
  tournamentId: string;
  tournamentName: string;
  sport: string;
  startDate: string;
  endDate: string;
  location: string;
  packagePurchased: string;
  purchasePrice: number;
  currency: string;
  paymentMethod: string;
  purchaseDate: string;
  tournamentStatus: string;
  dataExportDate: string;
  dataDeletionDate: string;
  exportDeliveryStatus: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: 'TOURNAMENT' | 'TEAM' | 'PLAYER' | 'MATCH' | 'PAYMENT' | 'PRICE' | 'EXPORT' | 'RETENTION';
  entityId: string;
  tournamentId?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
}
