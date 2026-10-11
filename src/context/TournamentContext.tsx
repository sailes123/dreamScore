import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Tournament, 
  Team, 
  Player, 
  Match, 
  MatchEvent, 
  TournamentPurchase, 
  TournamentPackagePrice, 
  TournamentPackage, 
  SportConfiguration,
  TournamentMember,
  LightweightTournamentHistory,
  AuditLogEntry,
  TournamentExportRecord,
  User,
  TournamentLifecycleState,
  PaymentMethod,
  ArchivedTournamentRecord
} from '../types';
import { 
  INITIAL_TOURNAMENT, 
  INITIAL_TEAMS, 
  INITIAL_PLAYERS, 
  INITIAL_MATCHES, 
  INITIAL_MATCH_EVENTS, 
  INITIAL_PURCHASE, 
  INITIAL_PACKAGES, 
  INITIAL_PACKAGE_PRICES, 
  INITIAL_SPORTS, 
  INITIAL_MEMBERS, 
  INITIAL_HISTORY, 
  INITIAL_AUDIT_LOGS,
  INITIAL_USERS,
  INITIAL_ARCHIVED_TOURNAMENTS
} from '../data/mockData';
import { calculateStandings } from '../services/standingsCalculator';
import { calculatePlayerStatistics } from '../services/playerStatsCalculator';
import { downloadTournamentExcel } from '../services/excelExporter';
import { generateStarterDataForTournament } from '../services/tournamentStarterGenerator';

interface TournamentContextType {
  // Current session & date
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  isLoggedOut: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logout: () => void;
  login: (user?: User) => void;
  currentSimulatedDate: string; // ISO string
  setSimulatedDate: (dateIso: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;

  // Active Tournament & Navigation Modals
  activeTournamentId: string;
  setActiveTournamentId: (id: string) => void;
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  isCreateTournamentModalOpen: boolean;
  setIsCreateTournamentModalOpen: (open: boolean) => void;
  currentPurchase: TournamentPurchase;
  simulatePurchaseUpgrade: (tier: 'PRO' | 'MULTI_PRO') => void;

  // Main Entities
  sports: SportConfiguration[];
  packages: TournamentPackage[];
  packagePrices: TournamentPackagePrice[];
  purchases: TournamentPurchase[];
  tournaments: Tournament[];
  activeTournament: Tournament;
  members: TournamentMember[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  matchEvents: MatchEvent[];
  exportRecords: TournamentExportRecord[];
  history: LightweightTournamentHistory[];
  archivedTournaments: ArchivedTournamentRecord[];
  auditLogs: AuditLogEntry[];

  // Computed state & helpers
  lifecycleState: TournamentLifecycleState;
  isReadOnly: boolean;
  canOperateLiveMatch: boolean;
  structureLocked: boolean;
  retentionDaysLeft: number;
  standings: ReturnType<typeof calculateStandings>;
  playerStats: ReturnType<typeof calculatePlayerStatistics>;

  // Tournament mutations
  updateTournament: (updates: Partial<Tournament>, applyFeeToAllTeams?: boolean) => void;
  updateTournamentSettings: (updates: Partial<Tournament>, applyFeeToAllTeams?: boolean) => void;
  createTournament: (tournament: Tournament, seedSampleData?: boolean) => void;
  setTournamentStatus: (status: TournamentLifecycleState) => void;
  updateCourts: (courts: string[]) => void;

  // Pricing & Purchases
  createPriceVersion: (packageId: string, newPrice: number, notes?: string) => void;
  createPurchase: (packageId: string, paymentMethod: PaymentMethod, reference: string, notes?: string) => TournamentPurchase;
  verifyPurchasePayment: (purchaseId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => void;

  // Teams & Players
  addTeam: (team: Omit<Team, 'id' | 'tournamentId' | 'registrationDate'>) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  updateTeamFee: (teamId: string, registrationFee: number) => void;
  updateTeamPayment: (teamId: string, amountReceived: number, method?: PaymentMethod, reference?: string, notes?: string) => void;
  addPlayer: (player: Omit<Player, 'id' | 'tournamentId'>) => { success: boolean; error?: string };
  updatePlayer: (id: string, updates: Partial<Player>) => { success: boolean; error?: string };
  deletePlayer: (id: string) => void;

  // Fixtures & Matches
  setMatches: (matches: Match[]) => void;
  addMatch: (match: Omit<Match, 'id' | 'tournamentId'>) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  deleteMatch: (id: string) => void;

  // Match Live Operations
  startMatch: (matchId: string) => void;
  completeMatch: (matchId: string) => void;
  updateMatchScore: (matchId: string, homeScore: number, awayScore: number) => void;
  addMatchEvent: (event: Omit<MatchEvent, 'id' | 'tournamentId' | 'createdAt'>) => void;
  deleteMatchEvent: (eventId: string) => void;

  // Export & Retention
  triggerExcelExport: () => void;
  executeRetentionPurge: (tournamentId: string) => void;

  // Reset Demo
  resetToInitialDemo: () => void;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

const STORAGE_KEY = 'arenaops_tournament_saas_v1';

export const TournamentProvider: React.FC<{ children: React.ReactNode; initialView?: string }> = ({ children, initialView }) => {
  // Load initial state from LocalStorage or defaults
  const [loaded, setLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // bipulmgr@gmail.com
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Default simulated date is Sep 16, 2026 (Preparation phase)
  const [currentSimulatedDate, setCurrentSimulatedDate] = useState<string>('2026-09-16T12:00:00Z');
  const [currentView, setCurrentView] = useState<string>(initialView || 'organizer_dashboard');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Core Data Collections
  const [sports] = useState<SportConfiguration[]>(INITIAL_SPORTS);
  const [packages] = useState<TournamentPackage[]>(INITIAL_PACKAGES);
  const [packagePrices, setPackagePrices] = useState<TournamentPackagePrice[]>(INITIAL_PACKAGE_PRICES);
  const [purchases, setPurchases] = useState<TournamentPurchase[]>([INITIAL_PURCHASE]);
  const [tournaments, setTournaments] = useState<Tournament[]>([INITIAL_TOURNAMENT]);
  const [activeTournamentId, setActiveTournamentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeTournamentId) return parsed.activeTournamentId;
        if (parsed.tournaments && parsed.tournaments.length > 0) return parsed.tournaments[0].id;
      }
    } catch {}
    return INITIAL_TOURNAMENT.id;
  });
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isCreateTournamentModalOpen, setIsCreateTournamentModalOpen] = useState(false);

  const [members, setMembers] = useState<TournamentMember[]>(INITIAL_MEMBERS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>(INITIAL_MATCH_EVENTS);
  const [exportRecords, setExportRecords] = useState<TournamentExportRecord[]>([]);
  const [history, setHistory] = useState<LightweightTournamentHistory[]>(INITIAL_HISTORY);
  const [archivedTournaments, setArchivedTournaments] = useState<ArchivedTournamentRecord[]>(INITIAL_ARCHIVED_TOURNAMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tournaments) setTournaments(parsed.tournaments);
        if (parsed.activeTournamentId) setActiveTournamentId(parsed.activeTournamentId);
        if (parsed.teams) setTeams(parsed.teams);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.matches) setMatches(parsed.matches);
        if (parsed.matchEvents && parsed.matchEvents.length > 0) {
          setMatchEvents(parsed.matchEvents);
        } else {
          setMatchEvents(INITIAL_MATCH_EVENTS);
        }
        if (parsed.packagePrices) setPackagePrices(parsed.packagePrices);
        if (parsed.purchases) {
          setPurchases(parsed.purchases.map((p: any) => ({
            ...p,
            amountPaid: p.amountPaid ?? p.priceSnapshot ?? 2500,
            currency: p.currency || p.currencySnapshot || 'NPR',
            invoiceNumber: p.invoiceNumber || p.paymentReference || `INV-${(p.id || '2026').slice(-6)}`,
            tier: p.tier || p.packageNameSnapshot || 'PRO',
          })));
        }
        if (parsed.history) setHistory(parsed.history);
        if (parsed.archivedTournaments && parsed.archivedTournaments.length > 0) {
          setArchivedTournaments(parsed.archivedTournaments);
        } else {
          setArchivedTournaments(INITIAL_ARCHIVED_TOURNAMENTS);
        }
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.exportRecords) setExportRecords(parsed.exportRecords);
        if (parsed.simulatedDate) setCurrentSimulatedDate(parsed.simulatedDate);
      }
    } catch (e) {
      console.warn('Failed to load local storage state:', e);
    }
    setLoaded(true);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      const stateToSave = {
        tournaments,
        activeTournamentId,
        teams,
        players,
        matches,
        matchEvents,
        packagePrices,
        purchases,
        history,
        archivedTournaments,
        auditLogs,
        exportRecords,
        simulatedDate: currentSimulatedDate
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to persist to local storage:', e);
    }
  }, [tournaments, activeTournamentId, teams, players, matches, matchEvents, packagePrices, purchases, history, archivedTournaments, auditLogs, exportRecords, currentSimulatedDate, loaded]);

  const activeTournament = useMemo(() => {
    return tournaments.find(t => t.id === activeTournamentId) || tournaments[0] || INITIAL_TOURNAMENT;
  }, [tournaments, activeTournamentId]);

  const currentPurchase = useMemo(() => {
    const found = purchases.find(p => p.id === activeTournament.packagePurchaseId) || purchases[0] || INITIAL_PURCHASE;
    return {
      ...found,
      amountPaid: found.amountPaid ?? found.priceSnapshot ?? 2500,
      currency: found.currency || found.currencySnapshot || 'NPR',
      invoiceNumber: found.invoiceNumber || found.paymentReference || `INV-${(found.id || '2026').slice(-6)}`,
      tier: found.tier || found.packageNameSnapshot || 'PRO',
    };
  }, [purchases, activeTournament.packagePurchaseId]);

  const simulatePurchaseUpgrade = (tier: 'PRO' | 'MULTI_PRO') => {
    const newPurchase: TournamentPurchase = {
      id: `pur-${Date.now()}`,
      purchaserUserId: currentUser.id,
      purchaserEmail: currentUser.email,
      purchaserName: currentUser.name,
      tournamentId: activeTournament.id,
      packageId: tier === 'PRO' ? 'pkg-single-pro' : 'pkg-multi-pro-5',
      packagePriceId: tier === 'PRO' ? 'v2026.1' : 'v2026.1-5pk',
      packageNameSnapshot: tier === 'PRO' ? 'Standard Pro Tournament' : 'Multi-Tournament Pro Pack',
      packageDurationSnapshot: '1_MONTH',
      priceSnapshot: tier === 'PRO' ? 12000 : 45000,
      currencySnapshot: 'NPR',
      purchasedAt: new Date().toISOString(),
      paymentStatus: 'PAID',
      approvalStatus: 'APPROVED',
      paymentMethod: 'DIGITAL_WALLET',
      paymentReference: `ESW-SIM-${Date.now().toString().slice(-6)}`,
      tier,
      amountPaid: tier === 'PRO' ? 12000 : 45000,
      currency: 'NPR',
      purchasedTournamentsCount: tier === 'PRO' ? 1 : 5,
      remainingTournamentsCount: tier === 'PRO' ? 1 : 5,
      paymentProvider: 'ESEWA',
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      purchaseDate: new Date().toISOString(),
      status: 'COMPLETED'
    };
    setPurchases(prev => [newPurchase, ...prev]);
    updateTournament({ packagePurchaseId: newPurchase.id });
    logAudit('PAYMENT_VERIFIED', 'PAYMENT', newPurchase.id, `Simulated license upgrade to ${tier}`);
  };

  // Active Tournament Scoped Entities
  const activeTeams = useMemo(() => {
    return teams.filter(t => t.tournamentId === activeTournament.id || (!t.tournamentId && activeTournament.id === INITIAL_TOURNAMENT.id));
  }, [teams, activeTournament.id]);

  const activePlayers = useMemo(() => {
    return players.filter(p => p.tournamentId === activeTournament.id || (!p.tournamentId && activeTournament.id === INITIAL_TOURNAMENT.id));
  }, [players, activeTournament.id]);

  const activeMatches = useMemo(() => {
    return matches.filter(m => m.tournamentId === activeTournament.id || (!m.tournamentId && activeTournament.id === INITIAL_TOURNAMENT.id));
  }, [matches, activeTournament.id]);

  const activeMatchEvents = useMemo(() => {
    return matchEvents.filter(e => e.tournamentId === activeTournament.id || (!e.tournamentId && activeTournament.id === INITIAL_TOURNAMENT.id));
  }, [matchEvents, activeTournament.id]);

  // Calculate dynamic lifecycle state based on simulated time and tournament dates
  const calculatedLifecycle = useMemo<TournamentLifecycleState>(() => {
    if (activeTournament.status === 'ARCHIVED') return 'ARCHIVED';
    const now = new Date(currentSimulatedDate).getTime();
    const start = new Date(activeTournament.startDateTime).getTime();
    const end = new Date(activeTournament.endDateTime).getTime();
    const sevenDaysAfter = end + 7 * 24 * 60 * 60 * 1000;

    if (now < start) {
      return 'PREPARATION';
    } else if (now >= start && now <= end) {
      return 'LIVE';
    } else if (now > end && now <= sevenDaysAfter) {
      return 'RETENTION_GRACE';
    } else {
      return 'ENDED';
    }
  }, [currentSimulatedDate, activeTournament.startDateTime, activeTournament.endDateTime, activeTournament.status]);

  // Keep tournament status synced if not explicitly archived
  useEffect(() => {
    if (activeTournament && activeTournament.status !== calculatedLifecycle && activeTournament.status !== 'ARCHIVED') {
      setTournaments(prev => prev.map(t => t.id === activeTournament.id ? { ...t, status: calculatedLifecycle } : t));
    }
  }, [calculatedLifecycle, activeTournament]);

  const isReadOnly = calculatedLifecycle === 'ENDED' || calculatedLifecycle === 'RETENTION_GRACE' || calculatedLifecycle === 'ARCHIVED';
  const canOperateLiveMatch = !isReadOnly;

  // Structure locked once the first match is started or completed
  const structureLocked = useMemo(() => {
    return activeMatches.some(m => m.status === 'LIVE' || m.status === 'HALFTIME' || m.status === 'COMPLETED');
  }, [activeMatches]);

  // Calculate 7-day retention days left
  const retentionDaysLeft = useMemo(() => {
    const now = new Date(currentSimulatedDate).getTime();
    const end = new Date(activeTournament.endDateTime).getTime();
    const sevenDaysAfter = end + 7 * 24 * 60 * 60 * 1000;
    const diffMs = sevenDaysAfter - now;
    return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
  }, [currentSimulatedDate, activeTournament.endDateTime]);

  // Standings calculation (with real-time live match inclusion)
  const standings = useMemo(() => {
    return calculateStandings(
      activeTeams, 
      activeMatches, 
      activeTournament.pointsForWin, 
      activeTournament.pointsForDraw, 
      activeTournament.pointsForLoss,
      undefined,
      true
    );
  }, [activeTeams, activeMatches, activeTournament]);

  // Player statistics calculation (real-time from live and completed matches)
  const playerStats = useMemo(() => {
    const activePlayerIds = new Set<string>();
    activeMatches.filter(m => m.status === 'COMPLETED' || m.status === 'LIVE' || m.status === 'HALFTIME').forEach(m => {
      activePlayers.filter(p => p.teamId === m.homeTeamId || p.teamId === m.awayTeamId).forEach(p => activePlayerIds.add(p.id));
    });
    return calculatePlayerStatistics(activePlayers, activeTeams, activeMatchEvents, activePlayerIds);
  }, [activePlayers, activeTeams, activeMatchEvents, activeMatches]);

  // Helper to log audit actions
  const logAudit = (
    action: string, 
    entityType: AuditLogEntry['entityType'], 
    entityId: string, 
    newValue?: string, 
    oldValue?: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: currentSimulatedDate,
      userId: currentUser.id,
      userEmail: currentUser.email,
      action,
      entityType,
      entityId,
      tournamentId: activeTournament.id,
      oldValue,
      newValue
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // Tournament Mutations
  const updateTournament = (updates: Partial<Tournament>, applyFeeToAllTeams?: boolean) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === activeTournament.id) {
        logAudit('TOURNAMENT_UPDATED', 'TOURNAMENT', t.id, JSON.stringify(updates));
        return { ...t, ...updates, updatedAt: currentSimulatedDate };
      }
      return t;
    }));

    if (updates.teamRegistrationFee !== undefined && applyFeeToAllTeams) {
      setTeams(prev => prev.map(t => {
        let paymentStatus: Team['paymentStatus'] = t.paymentStatus;
        if (t.amountReceived >= updates.teamRegistrationFee!) {
          paymentStatus = 'PAID';
        } else if (t.amountReceived > 0) {
          paymentStatus = 'PARTIALLY_PAID';
        } else {
          paymentStatus = 'UNPAID';
        }
        return {
          ...t,
          registrationFee: updates.teamRegistrationFee!,
          paymentStatus
        };
      }));
    }
  };

  const updateCourts = (courts: string[]) => {
    const validCourts = courts.length > 0 ? courts : ['Court 1'];
    setTournaments(prev => prev.map(t => {
      if (t.id === activeTournament.id) {
        const venue = t.venues?.[0] || {
          id: 'venue-1',
          tournamentId: t.id,
          name: 'Main Sports Complex Arena',
          address: 'Sports Complex Road',
          city: 'City Center',
          country: 'National',
          courts: ['Court 1']
        };
        const updatedVenues = [{
          ...venue,
          courts: validCourts
        }];
        logAudit('COURTS_UPDATED', 'TOURNAMENT', t.id, validCourts.join(', '));
        return { ...t, venues: updatedVenues, updatedAt: currentSimulatedDate };
      }
      return t;
    }));
  };

  const createTournament = (newT: Tournament, seedSampleData: boolean = true) => {
    setTournaments(prev => [newT, ...prev]);
    setActiveTournamentId(newT.id);
    if (seedSampleData) {
      const starter = generateStarterDataForTournament(newT);
      setTeams(prev => [...starter.teams, ...prev]);
      setPlayers(prev => [...starter.players, ...prev]);
      setMatches(prev => [...starter.matches, ...prev]);
    }
    logAudit('TOURNAMENT_CREATED', 'TOURNAMENT', newT.id, `${newT.name} (${newT.sportCode})`);
  };

  const setTournamentStatus = (status: TournamentLifecycleState) => {
    const oldStatus = activeTournament.status;
    updateTournament({ status });
    logAudit('STATUS_OVERRIDE', 'TOURNAMENT', activeTournament.id, status, oldStatus);
  };

  // Pricing & Pricing Versioning
  const createPriceVersion = (packageId: string, newPrice: number, notes?: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    // 1. Archive the existing active price record for this package
    const existingActive = packagePrices.find(p => p.packageId === packageId && p.status === 'ACTIVE');
    const updatedPrices = packagePrices.map(p => {
      if (p.packageId === packageId && p.status === 'ACTIVE') {
        return {
          ...p,
          status: 'ARCHIVED' as const,
          effectiveUntil: currentSimulatedDate
        };
      }
      return p;
    });

    // 2. Create new pricing version record
    const nextVersion = existingActive ? existingActive.version + 1 : 1;
    const newPriceRecord: TournamentPackagePrice = {
      id: `price-${packageId}-v${nextVersion}-${Date.now()}`,
      packageId,
      version: nextVersion,
      price: newPrice,
      currency: 'NPR',
      effectiveFrom: currentSimulatedDate,
      effectiveUntil: null,
      status: 'ACTIVE',
      createdBy: currentUser.name,
      createdAt: currentSimulatedDate,
      notes: notes || `Updated pricing version ${nextVersion}`
    };

    setPackagePrices([...updatedPrices, newPriceRecord]);
    logAudit('PRICING_VERSION_CREATED', 'PRICE', newPriceRecord.id, `${pkg.name}: NPR ${newPrice} (v${nextVersion})`, existingActive ? `NPR ${existingActive.price} (v${existingActive.version})` : 'None');
  };

  // Purchase creation with immutable snapshot
  const createPurchase = (
    packageId: string, 
    paymentMethod: PaymentMethod, 
    reference: string, 
    notes?: string
  ): TournamentPurchase => {
    const pkg = packages.find(p => p.id === packageId);
    const activePrice = packagePrices.find(p => p.packageId === packageId && p.status === 'ACTIVE');
    if (!pkg || !activePrice) throw new Error('Invalid package or active price not found');

    const newPurchase: TournamentPurchase = {
      id: `purch-${Date.now()}`,
      purchaserUserId: currentUser.id,
      purchaserEmail: currentUser.email,
      purchaserName: currentUser.name,
      packageId,
      packagePriceId: activePrice.id,
      packageNameSnapshot: pkg.name,
      packageDurationSnapshot: `${pkg.maxDays} Days`,
      priceSnapshot: activePrice.price,
      currencySnapshot: activePrice.currency,
      purchasedAt: currentSimulatedDate,
      paymentStatus: 'PENDING',
      approvalStatus: 'PENDING',
      paymentMethod,
      paymentReference: reference,
      paymentNotes: notes
    };

    setPurchases(prev => [newPurchase, ...prev]);
    logAudit('PURCHASE_SUBMITTED', 'PAYMENT', newPurchase.id, `${pkg.name} (${activePrice.price} ${activePrice.currency})`);
    return newPurchase;
  };

  const verifyPurchasePayment = (purchaseId: string, status: 'APPROVED' | 'REJECTED', notes?: string) => {
    setPurchases(prev => prev.map(p => {
      if (p.id === purchaseId) {
        const updated = {
          ...p,
          approvalStatus: status,
          paymentStatus: (status === 'APPROVED' ? 'PAID' : 'REJECTED') as any,
          verifiedBy: currentUser.name,
          verifiedAt: currentSimulatedDate,
          paymentNotes: notes ? `${p.paymentNotes || ''} | Verification note: ${notes}` : p.paymentNotes
        };
        logAudit(`PURCHASE_${status}`, 'PAYMENT', p.id, status, p.paymentStatus);
        return updated;
      }
      return p;
    }));
  };

  // Teams Mutations
  const addTeam = (teamData: Omit<Team, 'id' | 'tournamentId' | 'registrationDate'>) => {
    const newTeam: Team = {
      ...teamData,
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      tournamentId: activeTournament.id,
      registrationDate: currentSimulatedDate
    };
    setTeams(prev => [...prev, newTeam]);
    logAudit('TEAM_REGISTERED', 'TEAM', newTeam.id, newTeam.name);
  };

  const updateTeam = (id: string, updates: Partial<Team>) => {
    setTeams(prev => prev.map(t => {
      if (t.id === id) {
        logAudit('TEAM_UPDATED', 'TEAM', id, t.name);
        return { ...t, ...updates };
      }
      return t;
    }));
  };

  const deleteTeam = (id: string) => {
    const team = teams.find(t => t.id === id);
    setTeams(prev => prev.filter(t => t.id !== id));
    // Remove players belonging to that team
    setPlayers(prev => prev.filter(p => p.teamId !== id));
    logAudit('TEAM_DELETED', 'TEAM', id, team?.name);
  };

  const updateTeamFee = (teamId: string, registrationFee: number) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        let paymentStatus: Team['paymentStatus'] = 'UNPAID';
        if (t.amountReceived >= registrationFee) {
          paymentStatus = 'PAID';
        } else if (t.amountReceived > 0) {
          paymentStatus = 'PARTIALLY_PAID';
        }
        logAudit('TEAM_FEE_UPDATED', 'TEAM', teamId, `Fee changed to ${registrationFee} (${paymentStatus})`);
        return { ...t, registrationFee, paymentStatus };
      }
      return t;
    }));
  };

  const updateTeamPayment = (
    teamId: string, 
    amountReceived: number, 
    method?: PaymentMethod, 
    reference?: string, 
    notes?: string
  ) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        let paymentStatus: Team['paymentStatus'] = 'UNPAID';
        if (amountReceived >= t.registrationFee) {
          paymentStatus = 'PAID';
        } else if (amountReceived > 0) {
          paymentStatus = 'PARTIALLY_PAID';
        }
        logAudit('TEAM_PAYMENT_RECORDED', 'PAYMENT', teamId, `Received ${amountReceived} ${activeTournament.currency} (${paymentStatus})`);
        return {
          ...t,
          amountReceived,
          paymentStatus,
          paymentMethod: method || t.paymentMethod,
          paymentReference: reference || t.paymentReference,
          paymentNotes: notes || t.paymentNotes,
          paymentDate: currentSimulatedDate
        };
      }
      return t;
    }));
  };

  // Players Mutations with Jersey Conflict Check
  const addPlayer = (playerData: Omit<Player, 'id' | 'tournamentId'>): { success: boolean; error?: string } => {
    // Check duplicate jersey number in the same team
    const jerseyConflict = players.some(
      p => p.teamId === playerData.teamId && p.jerseyNumber === Number(playerData.jerseyNumber)
    );
    if (jerseyConflict) {
      return {
        success: false,
        error: `Jersey #${playerData.jerseyNumber} is already assigned to another player on this team!`
      };
    }

    const newPlayer: Player = {
      ...playerData,
      id: `player-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      tournamentId: activeTournament.id,
      jerseyNumber: Number(playerData.jerseyNumber)
    };
    setPlayers(prev => [...prev, newPlayer]);
    logAudit('PLAYER_REGISTERED', 'PLAYER', newPlayer.id, `${newPlayer.displayName} (#${newPlayer.jerseyNumber})`);
    return { success: true };
  };

  const updatePlayer = (id: string, updates: Partial<Player>): { success: boolean; error?: string } => {
    const existing = players.find(p => p.id === id);
    if (!existing) return { success: false, error: 'Player not found' };

    const targetTeamId = updates.teamId || existing.teamId;
    const targetJersey = updates.jerseyNumber !== undefined ? Number(updates.jerseyNumber) : existing.jerseyNumber;

    if (targetJersey !== existing.jerseyNumber || targetTeamId !== existing.teamId) {
      const conflict = players.some(
        p => p.id !== id && p.teamId === targetTeamId && p.jerseyNumber === targetJersey
      );
      if (conflict) {
        return {
          success: false,
          error: `Jersey #${targetJersey} is already taken by another player on this team!`
        };
      }
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, ...updates, jerseyNumber: targetJersey };
      }
      return p;
    }));
    logAudit('PLAYER_UPDATED', 'PLAYER', id, existing.displayName);
    return { success: true };
  };

  const deletePlayer = (id: string) => {
    const p = players.find(player => player.id === id);
    setPlayers(prev => prev.filter(player => player.id !== id));
    logAudit('PLAYER_REMOVED', 'PLAYER', id, p?.displayName);
  };

  // Fixtures Mutations
  const handleSetMatches = (newMatches: Match[]) => {
    setMatches(prev => [
      ...prev.filter(m => m.tournamentId !== activeTournament.id),
      ...newMatches
    ]);
  };

  const addMatch = (matchData: Omit<Match, 'id' | 'tournamentId'>) => {
    const newMatch: Match = {
      ...matchData,
      id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      tournamentId: activeTournament.id
    };
    setMatches(prev => [...prev, newMatch]);
    logAudit('FIXTURE_CREATED', 'MATCH', newMatch.id, `Match #${newMatch.matchNumber}: ${newMatch.roundName}`);
  };

  const updateMatch = (id: string, updates: Partial<Match>) => {
    setMatches(prev => prev.map(m => {
      if (m.id === id) {
        logAudit('FIXTURE_UPDATED', 'MATCH', id, `Match #${m.matchNumber}`);
        return { ...m, ...updates };
      }
      return m;
    }));
  };

  const deleteMatch = (id: string) => {
    setMatches(prev => prev.filter(m => m.id !== id));
    logAudit('FIXTURE_DELETED', 'MATCH', id);
  };

  // Match Live Control
  const getEventPoints = (eventType: string): number => {
    switch (eventType) {
      case 'GOAL':
      case 'PENALTY_GOAL':
      case 'FREE_THROW':
      case 'RUN_1':
      case 'EXTRA_RUN':
      case 'POINT_ATTACK':
      case 'POINT_BLOCK':
      case 'POINT_ACE':
      case 'POINT_WINNER':
      case 'OPPONENT_ERROR':
        return 1;
      case 'FIELD_GOAL_2PT':
      case 'RUN_2':
        return 2;
      case 'FIELD_GOAL_3PT':
        return 3;
      case 'BOUNDARY_4':
        return 4;
      case 'BOUNDARY_6':
        return 6;
      default:
        return 0;
    }
  };

  const startMatch = (matchId: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        logAudit('MATCH_STARTED', 'MATCH', matchId, `Match #${m.matchNumber} started at ${currentSimulatedDate}`);
        return { ...m, status: 'LIVE', actualStart: currentSimulatedDate, currentPeriod: 1, currentMinute: 1 };
      }
      return m;
    }));
  };

  const completeMatch = (matchId: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        logAudit('MATCH_COMPLETED', 'MATCH', matchId, `Final score: ${m.homeScore} - ${m.awayScore}`);
        return { ...m, status: 'COMPLETED', actualEnd: currentSimulatedDate };
      }
      return m;
    }));
  };

  const updateMatchScore = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        logAudit('SCORE_UPDATED', 'MATCH', matchId, `${homeScore} - ${awayScore}`, `${m.homeScore} - ${m.awayScore}`);
        return { ...m, homeScore: Math.max(0, homeScore), awayScore: Math.max(0, awayScore) };
      }
      return m;
    }));
  };

  const addMatchEvent = (eventData: Omit<MatchEvent, 'id' | 'tournamentId' | 'createdAt'>) => {
    const newEvent: MatchEvent = {
      ...eventData,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      tournamentId: activeTournament.id,
      createdAt: currentSimulatedDate
    };
    setMatchEvents(prev => [...prev, newEvent]);

    // Automatically update match score if scoring event
    const match = matches.find(m => m.id === eventData.matchId);
    if (match) {
      const isHome = eventData.teamId === match.homeTeamId;
      if (eventData.eventType === 'OWN_GOAL') {
        // Own goal goes to the opponent
        updateMatchScore(match.id, isHome ? match.homeScore : match.homeScore + 1, isHome ? match.awayScore + 1 : match.awayScore);
      } else {
        const points = getEventPoints(eventData.eventType);
        if (points > 0) {
          updateMatchScore(
            match.id, 
            isHome ? match.homeScore + points : match.homeScore, 
            isHome ? match.awayScore : match.awayScore + points
          );
        }
      }
    }
    logAudit('MATCH_EVENT_ADDED', 'MATCH', eventData.matchId, `${eventData.eventType} at ${eventData.minute}'`);
  };

  const deleteMatchEvent = (eventId: string) => {
    const evt = matchEvents.find(e => e.id === eventId);
    if (!evt) return;

    // Adjust score if scoring event was deleted
    const match = matches.find(m => m.id === evt.matchId);
    if (match) {
      const isHome = evt.teamId === match.homeTeamId;
      if (evt.eventType === 'OWN_GOAL') {
        updateMatchScore(
          match.id, 
          isHome ? match.homeScore : Math.max(0, match.homeScore - 1), 
          isHome ? Math.max(0, match.awayScore - 1) : match.awayScore
        );
      } else {
        const points = getEventPoints(evt.eventType);
        if (points > 0) {
          updateMatchScore(
            match.id, 
            isHome ? Math.max(0, match.homeScore - points) : match.homeScore, 
            isHome ? match.awayScore : Math.max(0, match.awayScore - points)
          );
        }
      }
    }

    setMatchEvents(prev => prev.filter(e => e.id !== eventId));
    logAudit('MATCH_EVENT_REMOVED', 'MATCH', evt.matchId, evt.eventType);
  };

  // Excel Export & Retention Purge Process
  const triggerExcelExport = () => {
    const result = downloadTournamentExcel(
      activeTournament,
      teams,
      players,
      matches,
      matchEvents,
      standings,
      playerStats
    );

    const newRecord: TournamentExportRecord = {
      id: `exp-${Date.now()}`,
      tournamentId: activeTournament.id,
      tournamentName: activeTournament.name,
      generatedAt: currentSimulatedDate,
      fileSizeBytes: result.sizeBytes,
      filename: result.filename,
      emailSentTo: activeTournament.ownerEmail,
      emailSentAt: currentSimulatedDate,
      emailStatus: 'SENT',
      retryCount: 0,
      isPurgeEligible: true,
      purgedAt: null
    };

    setExportRecords(prev => [newRecord, ...prev]);
    logAudit('EXPORT_GENERATED_AND_DISPATCHED', 'EXPORT', newRecord.id, `Excel export: ${result.filename} delivered to ${activeTournament.ownerEmail}`);
  };

  const executeRetentionPurge = (tournamentId: string) => {
    // Check that export has succeeded first (Section 5 rule)
    const exportRecord = exportRecords.find(e => e.tournamentId === tournamentId && e.emailStatus === 'SENT');
    if (!exportRecord) {
      alert('Cannot permanently purge detailed tournament data before export and email notification succeed!');
      return;
    }

    // Create lightweight history record (Section 6)
    const purchase = purchases.find(p => p.id === activeTournament.packagePurchaseId) || purchases[0];
    const newHistoryRecord: LightweightTournamentHistory = {
      id: `hist-${Date.now()}`,
      tournamentId: activeTournament.id,
      tournamentName: activeTournament.name,
      sport: activeTournament.sportCode,
      startDate: activeTournament.startDateTime.slice(0, 10),
      endDate: activeTournament.endDateTime.slice(0, 10),
      location: `${activeTournament.venues[0]?.city || 'Kathmandu'}, ${activeTournament.venues[0]?.country || 'Nepal'}`,
      packagePurchased: purchase ? purchase.packageNameSnapshot : '3 Days Tournament',
      purchasePrice: purchase ? purchase.priceSnapshot : 2500,
      currency: purchase ? purchase.currencySnapshot : 'NPR',
      paymentMethod: purchase ? purchase.paymentMethod : 'DIGITAL_WALLET',
      purchaseDate: purchase ? purchase.purchasedAt.slice(0, 10) : '2026-09-16',
      tournamentStatus: 'ARCHIVED / PURGED',
      dataExportDate: exportRecord.generatedAt.slice(0, 10),
      dataDeletionDate: currentSimulatedDate.slice(0, 10),
      exportDeliveryStatus: `SUCCESS (Sent to ${exportRecord.emailSentTo})`
    };

    setHistory(prev => [newHistoryRecord, ...prev]);

    // Update export record
    setExportRecords(prev => prev.map(e => e.id === exportRecord.id ? { ...e, purgedAt: currentSimulatedDate } : e));

    // Clear operational details from active tournament
    setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, status: 'ARCHIVED' } : t));
    setTeams(prev => prev.filter(t => t.tournamentId !== tournamentId));
    setPlayers(prev => prev.filter(p => p.tournamentId !== tournamentId));
    setMatches(prev => prev.filter(m => m.tournamentId !== tournamentId));
    setMatchEvents(prev => prev.filter(e => e.tournamentId !== tournamentId));

    logAudit('DATA_PURGE_EXECUTED', 'RETENTION', tournamentId, `Operational records purged. Archived into history.`);
    setCurrentView('organizer_history');
  };

  const resetToInitialDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTournaments([INITIAL_TOURNAMENT]);
    setActiveTournamentId(INITIAL_TOURNAMENT.id);
    setIsPricingModalOpen(false);
    setIsCreateTournamentModalOpen(false);
    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setMatchEvents(INITIAL_MATCH_EVENTS);
    setPackagePrices(INITIAL_PACKAGE_PRICES);
    setPurchases([INITIAL_PURCHASE]);
    setHistory(INITIAL_HISTORY);
    setArchivedTournaments(INITIAL_ARCHIVED_TOURNAMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setExportRecords([]);
    setCurrentSimulatedDate('2026-09-16T12:00:00Z');
    setCurrentView('organizer_dashboard');
    setIsLoggedOut(false);
  };

  const logout = () => {
    setIsLoggedOut(true);
    setCurrentUser({
      id: 'guest-public',
      email: 'guest@visitor.arenaops.com',
      name: 'Guest Spectator',
      systemRole: 'PUBLIC'
    });
    setCurrentView('public_portal');
  };

  const login = (user?: User) => {
    setIsLoggedOut(false);
    setIsAuthModalOpen(false);
    const targetUser = user || INITIAL_USERS[1]; // default Bipul (Organizer)
    setCurrentUser(targetUser);
    if (targetUser.systemRole === 'PLATFORM_ADMIN') {
      setCurrentView('admin_dashboard');
    } else {
      setCurrentView('organizer_dashboard');
    }
  };

  return (
    <TournamentContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: INITIAL_USERS,
        isLoggedOut,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logout,
        login,
        currentSimulatedDate,
        setSimulatedDate: setCurrentSimulatedDate,
        currentView,
        setCurrentView,
        selectedMatchId,
        setSelectedMatchId,

        activeTournamentId,
        setActiveTournamentId,
        isPricingModalOpen,
        setIsPricingModalOpen,
        isCreateTournamentModalOpen,
        setIsCreateTournamentModalOpen,
        currentPurchase,
        simulatePurchaseUpgrade,

        sports,
        packages,
        packagePrices,
        purchases,
        tournaments,
        activeTournament,
        members,
        teams: activeTeams,
        players: activePlayers,
        matches: activeMatches,
        matchEvents: activeMatchEvents,
        exportRecords,
        history,
        archivedTournaments,
        auditLogs,

        lifecycleState: calculatedLifecycle,
        isReadOnly,
        canOperateLiveMatch,
        structureLocked,
        retentionDaysLeft,
        standings,
        playerStats,

        updateTournament,
        updateTournamentSettings: updateTournament,
        createTournament,
        setTournamentStatus,
        updateCourts,

        createPriceVersion,
        createPurchase,
        verifyPurchasePayment,

        addTeam,
        updateTeam,
        deleteTeam,
        updateTeamFee,
        updateTeamPayment,
        addPlayer,
        updatePlayer,
        deletePlayer,

        setMatches: handleSetMatches,
        addMatch,
        updateMatch,
        deleteMatch,

        startMatch,
        completeMatch,
        updateMatchScore,
        addMatchEvent,
        deleteMatchEvent,

        triggerExcelExport,
        executeRetentionPurge,
        resetToInitialDemo
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) throw new Error('useTournament must be used within TournamentProvider');
  return context;
};
