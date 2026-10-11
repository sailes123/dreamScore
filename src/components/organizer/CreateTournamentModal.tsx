import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  Trophy, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Dumbbell
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SportCode, TournamentFormat, Tournament } from '../../types';

interface SportOption {
  code: SportCode;
  label: string;
  category: string;
  icon: string;
  defaultDuration: number;
}

const SPORTS_LIST: SportOption[] = [
  { code: 'FUTSAL', label: 'Futsal', category: '5v5 Indoor', icon: '⚽', defaultDuration: 40 },
  { code: 'FOOTBALL', label: 'Football', category: '11v11 Grass', icon: '⚽', defaultDuration: 90 },
  { code: 'CRICKET', label: 'Cricket', category: 'T20 / 10-Overs', icon: '🏏', defaultDuration: 120 },
  { code: 'BASKETBALL', label: 'Basketball', category: '5v5 Full Court', icon: '🏀', defaultDuration: 48 },
  { code: 'VOLLEYBALL', label: 'Volleyball', category: 'Sets & Points', icon: '🏐', defaultDuration: 60 },
  { code: 'BADMINTON', label: 'Badminton', category: 'Singles & Doubles', icon: '🏸', defaultDuration: 45 },
  { code: 'TABLE_TENNIS', label: 'Table Tennis', category: 'Singles & Doubles', icon: '🏓', defaultDuration: 30 },
  { code: 'MARATHON', label: 'Marathon', category: 'Road & Trail Run', icon: '🏃', defaultDuration: 180 },
];

export const CreateTournamentModal: React.FC = () => {
  const { 
    isCreateTournamentModalOpen, 
    setIsCreateTournamentModalOpen, 
    createTournament,
    currentUser,
    setCurrentView 
  } = useTournament();

  const [sportCode, setSportCode] = useState<SportCode>('FUTSAL');
  const [name, setName] = useState('');
  const [format, setFormat] = useState<TournamentFormat>('GROUP_STAGE_KNOCKOUT');
  const [startDateTime, setStartDateTime] = useState('2026-09-20T09:00');
  const [endDateTime, setEndDateTime] = useState('2026-09-23T18:00');
  const [venueName, setVenueName] = useState('Central Sports Arena');
  const [venueCity, setVenueCity] = useState('Kathmandu');
  const [venueCountry, setVenueCountry] = useState('Nepal');
  const [courts, setCourts] = useState('Court 1, Court 2');
  const [maxTeams, setMaxTeams] = useState(8);
  const [teamRegistrationFee, setTeamRegistrationFee] = useState(10000);
  const [currency, setCurrency] = useState('NPR');
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(40);
  const [seedStarterTeams, setSeedStarterTeams] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSportSelect = (sport: SportOption) => {
    setSportCode(sport.code);
    setMatchDurationMinutes(sport.defaultDuration);
    if (!name || name.includes('Championship') || name.includes('Cup') || name.includes('League')) {
      setName(`${sport.label} Championship 2026`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Please provide a tournament name.');
      return;
    }

    if (new Date(endDateTime).getTime() <= new Date(startDateTime).getTime()) {
      setErrorMsg('End date & time must be after start date & time.');
      return;
    }

    setIsSubmitting(true);

    const tournamentId = `t-${sportCode.toLowerCase()}-${Date.now().toString().slice(-6)}`;
    const parsedCourts = courts.split(',').map(c => c.trim()).filter(Boolean);

    const newTournament: Tournament = {
      id: tournamentId,
      slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: name.trim(),
      sportCode,
      description: `${sportCode} tournament organized on ArenaOps SaaS.`,
      visibility: 'PUBLIC',
      startDateTime: new Date(startDateTime).toISOString(),
      endDateTime: new Date(endDateTime).toISOString(),
      timezone: 'Asia/Kathmandu',
      status: 'PREPARATION',
      ownerId: currentUser.id,
      ownerEmail: currentUser.email,
      packagePurchaseId: 'pur-trial-standard',
      format,
      numberOfTeams: maxTeams,
      groupsCount: 2,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      matchDurationMinutes,
      periods: 2,
      venues: [
        {
          id: `ven-${Date.now()}`,
          tournamentId,
          name: venueName.trim() || 'Central Sports Arena',
          address: `${venueCity}, ${venueCountry}`,
          city: venueCity,
          country: venueCountry,
          courts: parsedCourts.length > 0 ? parsedCourts : ['Court 1', 'Court 2'],
        }
      ],
      teamRegistrationFee,
      currency,
      registrationOpenDate: new Date().toISOString().slice(0, 10),
      registrationCloseDate: new Date(startDateTime).toISOString().slice(0, 10),
      maxTeams,
      metadata: {
        category: 'Open Championship',
        organizerOrg: 'Kathmandu Sports Committee'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      createTournament(newTournament, seedStarterTeams);
      setIsSubmitting(false);
      setIsCreateTournamentModalOpen(false);
      setCurrentView('organizer_dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to create tournament. Please check details.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateTournamentModalOpen}
      onClose={() => setIsCreateTournamentModalOpen(false)}
      title="Create New Tournament"
      subtitle="Configure a multi-sport tournament with automatic schedule, courts, and team rosters"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Step 1: Sport Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
            1. Select Sport Discipline *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {SPORTS_LIST.map((sport) => {
              const isSelected = sportCode === sport.code;
              return (
                <button
                  key={sport.code}
                  type="button"
                  onClick={() => handleSportSelect(sport)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{sport.icon}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-900">{sport.label}</div>
                    <div className="text-[10px] text-slate-500">{sport.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Tournament Title & Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tournament Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kathmandu Corporate Futsal Cup 2026"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tournament Competition Format *
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as TournamentFormat)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium cursor-pointer"
            >
              <option value="GROUP_STAGE_KNOCKOUT">Group Stage + Knockout Finals</option>
              <option value="SINGLE_KNOCKOUT">Single Elimination Knockout</option>
              <option value="ROUND_ROBIN">Round Robin League Table</option>
              <option value="DOUBLE_KNOCKOUT">Double Elimination Bracket</option>
            </select>
          </div>
        </div>

        {/* Step 3: Dates & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Match Duration (mins)
            </label>
            <input
              type="number"
              min={10}
              max={240}
              value={matchDurationMinutes}
              onChange={(e) => setMatchDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Step 4: Venue & Courts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Venue Arena Name
            </label>
            <input
              type="text"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="Arena Name"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              City & Country
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={venueCity}
                onChange={(e) => setVenueCity(e.target.value)}
                placeholder="City"
                className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <input
                type="text"
                value={venueCountry}
                onChange={(e) => setVenueCountry(e.target.value)}
                placeholder="Country"
                className="w-1/2 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Courts / Pitches (comma separated)
            </label>
            <input
              type="text"
              value={courts}
              onChange={(e) => setCourts(e.target.value)}
              placeholder="Court 1, Court 2"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Step 5: Capacity & Registration Financials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Maximum Teams Capacity
            </label>
            <select
              value={maxTeams}
              onChange={(e) => setMaxTeams(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium cursor-pointer"
            >
              <option value={4}>4 Teams</option>
              <option value={8}>8 Teams (Standard)</option>
              <option value={12}>12 Teams</option>
              <option value={16}>16 Teams (Major)</option>
              <option value={24}>24 Teams</option>
              <option value={32}>32 Teams (Mega Tournament)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              Team Registration Fee
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={teamRegistrationFee}
              onChange={(e) => setTeamRegistrationFee(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium cursor-pointer"
            >
              <option value="NPR">NPR (Nepalese Rupee)</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Step 6: Quick Starter Demo Seed Option */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
          <input
            type="checkbox"
            id="seedStarterTeams"
            checked={seedStarterTeams}
            onChange={(e) => setSeedStarterTeams(e.target.checked)}
            className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
          />
          <label htmlFor="seedStarterTeams" className="text-xs text-emerald-900 cursor-pointer">
            <span className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Seed starter teams & opening fixtures automatically
            </span>
            <span className="block text-[11px] text-emerald-700/90 mt-0.5">
              Instantly generates 4 realistic teams for {sportCode}, player rosters, and scheduled matchdays so you can test live match operations and scoring right away. Uncheck to start with an empty roster.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsCreateTournamentModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Trophy className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating...' : 'Create Tournament'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
