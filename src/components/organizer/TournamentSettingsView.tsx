import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  Settings, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Save,
  Plus,
  Trash2,
  Grid
} from 'lucide-react';
import { Tournament, TournamentFormat, SportCode } from '../../types';

export const TournamentSettingsView: React.FC = () => {
  const { 
    activeTournament, 
    updateTournament,
    updateTournamentSettings = updateTournament, 
    updateCourts,
    structureLocked, 
    isReadOnly 
  } = useTournament();

  const [name, setName] = useState(activeTournament.name || '');
  const [description, setDescription] = useState(activeTournament.description || '');
  const [sportType, setSportType] = useState<SportCode>((activeTournament.sportCode || (activeTournament as any).sportType || 'FUTSAL') as SportCode);
  const [format, setFormat] = useState<TournamentFormat>(activeTournament.format || 'GROUP_STAGE_KNOCKOUT');
  const [startDateTime, setStartDateTime] = useState(activeTournament.startDateTime || '');
  const [endDateTime, setEndDateTime] = useState(activeTournament.endDateTime || '');
  const [maxTeams, setMaxTeams] = useState(activeTournament.maxTeams ?? 8);
  const [matchDurationMinutes, setMatchDurationMinutes] = useState(activeTournament.matchDurationMinutes ?? 40);
  const [halfDurationMinutes, setHalfDurationMinutes] = useState((activeTournament as any).halfDurationMinutes ?? 20);
  const [pointsForWin, setPointsForWin] = useState(activeTournament.pointsForWin ?? 3);
  const [pointsForDraw, setPointsForDraw] = useState(activeTournament.pointsForDraw ?? 1);
  const [pointsForLoss, setPointsForLoss] = useState(activeTournament.pointsForLoss ?? 0);
  const [teamRegistrationFee, setTeamRegistrationFee] = useState(activeTournament.teamRegistrationFee ?? 0);
  const [applyFeeToAllTeams, setApplyFeeToAllTeams] = useState(true);
  const [currency, setCurrency] = useState(activeTournament.currency || 'NPR');
  const [isPubliclyVisible, setIsPubliclyVisible] = useState(activeTournament.visibility === 'PUBLIC');
  const [venueName, setVenueName] = useState(activeTournament.venues?.[0]?.name || '');
  const [venueAddress, setVenueAddress] = useState(activeTournament.venues?.[0]?.address || '');
  
  // Courts list state - defaults to at least one court
  const initialCourts = activeTournament.venues?.[0]?.courts?.length 
    ? activeTournament.venues[0].courts 
    : ['Court 1'];
  const [courts, setCourts] = useState<string[]>(initialCourts);
  const [newCourtInput, setNewCourtInput] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setName(activeTournament.name || '');
    setDescription(activeTournament.description || '');
    setSportType((activeTournament.sportCode || (activeTournament as any).sportType || 'FUTSAL') as SportCode);
    setFormat(activeTournament.format || 'GROUP_STAGE_KNOCKOUT');
    setStartDateTime(activeTournament.startDateTime || '');
    setEndDateTime(activeTournament.endDateTime || '');
    setMaxTeams(activeTournament.maxTeams ?? 8);
    setMatchDurationMinutes(activeTournament.matchDurationMinutes ?? 40);
    setHalfDurationMinutes((activeTournament as any).halfDurationMinutes ?? 20);
    setPointsForWin(activeTournament.pointsForWin ?? 3);
    setPointsForDraw(activeTournament.pointsForDraw ?? 1);
    setPointsForLoss(activeTournament.pointsForLoss ?? 0);
    setTeamRegistrationFee(activeTournament.teamRegistrationFee ?? 0);
    setCurrency(activeTournament.currency || 'NPR');
    setIsPubliclyVisible(activeTournament.visibility === 'PUBLIC');
    setVenueName(activeTournament.venues?.[0]?.name || '');
    setVenueAddress(activeTournament.venues?.[0]?.address || '');
    setCourts(activeTournament.venues?.[0]?.courts?.length ? activeTournament.venues[0].courts : ['Court 1']);
  }, [activeTournament]);

  const handleAddCourt = () => {
    const trimmed = newCourtInput.trim();
    if (trimmed) {
      if (!courts.includes(trimmed)) {
        setCourts(prev => [...prev, trimmed]);
      }
      setNewCourtInput('');
    } else {
      const nextNum = courts.length + 1;
      setCourts(prev => [...prev, `Court ${nextNum}`]);
    }
  };

  const handleRemoveCourt = (indexToRemove: number) => {
    setCourts(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      // If none left, default to 1 court
      return updated.length > 0 ? updated : ['Court 1'];
    });
  };

  const handleCourtChange = (index: number, val: string) => {
    setCourts(prev => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCourts = courts.length > 0 ? courts : ['Court 1'];
    const saveFn = updateTournamentSettings || updateTournament;
    
    saveFn({
      name,
      description,
      // only update structural fields if not locked
      ...(structureLocked ? {} : {
        sportCode: sportType || 'FUTSAL',
        format,
        maxTeams,
        pointsForWin,
        pointsForDraw,
        pointsForLoss,
      }),
      startDateTime,
      endDateTime,
      matchDurationMinutes,
      teamRegistrationFee,
      currency,
      visibility: isPubliclyVisible ? 'PUBLIC' : 'PRIVATE',
      venues: [
        {
          id: activeTournament.venues?.[0]?.id || 'venue-1',
          tournamentId: activeTournament.id,
          name: venueName,
          address: venueAddress,
          city: activeTournament.venues?.[0]?.city || 'Kathmandu',
          country: activeTournament.venues?.[0]?.country || 'Nepal',
          courts: finalCourts
        }
      ]
    }, applyFeeToAllTeams);

    if (updateCourts) {
      updateCourts(finalCourts);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">Tournament Configuration & Rules</h2>
        <p className="text-xs text-slate-500">
          Scoring logic, format parameters, court venues, and match duration rules.
        </p>
      </div>

      {/* Structural Lock Warning Banner (Section 15 Rule) */}
      {structureLocked ? (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Tournament Structure is Locked
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Tournament structure (sport type, format, max teams, and point system) is locked because matches have already been generated and started. 
              Non-structural settings such as kickoff times, venue descriptions, and public visibility remain customizable.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800">
          <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Tournament structure is currently unlocked in Preparation mode. All rules can be safely modified.</span>
        </div>
      )}

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration changes successfully saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Details */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
            1. Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tournament Title *
              </label>
              <input
                type="text"
                required
                disabled={isReadOnly}
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600 disabled:bg-slate-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description / Organizer Brief
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={description || ''}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tournament Start (Kickoff) *
              </label>
              <input
                type="datetime-local"
                required
                disabled={isReadOnly}
                value={(startDateTime || '').slice(0, 16)}
                onChange={(e) => setStartDateTime(new Date(e.target.value).toISOString())}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tournament End (Finals) *
              </label>
              <input
                type="datetime-local"
                required
                disabled={isReadOnly}
                value={(endDateTime || '').slice(0, 16)}
                onChange={(e) => setEndDateTime(new Date(e.target.value).toISOString())}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Structural Rules (Guarded by structureLocked) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Structural Rules & Format
            </h3>
            {structureLocked && (
              <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sport Type *
              </label>
              <select
                disabled={structureLocked || isReadOnly}
                value={sportType || 'FUTSAL'}
                onChange={(e) => setSportType(e.target.value as SportCode)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-500 font-medium"
              >
                <option value="FUTSAL">Futsal (5v5 Indoor)</option>
                <option value="FOOTBALL">Football (11v11 Soccer)</option>
                <option value="CRICKET">Cricket (T20 / Limited Overs)</option>
                <option value="BASKETBALL">Basketball (5v5 / 3x3)</option>
                <option value="VOLLEYBALL">Volleyball (6v6 Rally Point)</option>
                <option value="MARATHON">Marathon / Road Running</option>
                <option value="BADMINTON">Badminton (Racket Sport)</option>
                <option value="TABLE_TENNIS">Table Tennis (Ping Pong)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Competition Format
              </label>
              <select
                disabled={structureLocked || isReadOnly}
                value={format || 'GROUP_STAGE_KNOCKOUT'}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white disabled:bg-slate-50 disabled:text-slate-500"
              >
                <option value="GROUP_STAGE_KNOCKOUT">Group Stage + Knockout</option>
                <option value="ROUND_ROBIN">Single Round Robin</option>
                <option value="SINGLE_ELIMINATION">Single Elimination (Knockout)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Maximum Teams
              </label>
              <input
                type="number"
                disabled={structureLocked || isReadOnly}
                value={maxTeams ?? 8}
                onChange={(e) => setMaxTeams(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Points for Win
              </label>
              <input
                type="number"
                disabled={structureLocked || isReadOnly}
                value={pointsForWin ?? 3}
                onChange={(e) => setPointsForWin(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Points for Draw
              </label>
              <input
                type="number"
                disabled={structureLocked || isReadOnly}
                value={pointsForDraw ?? 1}
                onChange={(e) => setPointsForDraw(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Points for Loss
              </label>
              <input
                type="number"
                disabled={structureLocked || isReadOnly}
                value={pointsForLoss ?? 0}
                onChange={(e) => setPointsForLoss(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Match Duration & Venues */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100">
            3. Timing, Venue & Courts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Match Duration (Total Minutes)
              </label>
              <input
                type="number"
                disabled={isReadOnly}
                value={matchDurationMinutes ?? 40}
                onChange={(e) => setMatchDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Half Duration (Minutes)
              </label>
              <input
                type="number"
                disabled={isReadOnly}
                value={halfDurationMinutes ?? 20}
                onChange={(e) => setHalfDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Main Venue Name
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={venueName || ''}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue Address / Location
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={venueAddress || ''}
                onChange={(e) => setVenueAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team Registration Fee ({currency || 'NPR'})
              </label>
              <input
                type="number"
                disabled={isReadOnly}
                value={teamRegistrationFee ?? 0}
                onChange={(e) => setTeamRegistrationFee(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyFeeToAllTeams}
                  onChange={(e) => setApplyFeeToAllTeams(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-3.5 h-3.5"
                />
                <span className="text-[11px] text-slate-600 font-medium">
                  Apply new fee to all teams and recompute payment statuses
                </span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency Symbol / Code
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={currency || 'NPR'}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Court Management Subsection */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-slate-600" />
                  Tournament Courts / Pitches ({courts.length})
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Add multiple courts for simultaneous matches. If none added, defaults to Court 1.
                </p>
              </div>

              {!isReadOnly && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCourts(['Court 1'])}
                    className="px-2 py-1 text-[11px] font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  >
                    1 Court (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourts(['Court 1', 'Court 2'])}
                    className="px-2 py-1 text-[11px] font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  >
                    2 Courts
                  </button>
                  <button
                    type="button"
                    onClick={() => setCourts(['Court 1', 'Court 2', 'Court 3', 'Court 4'])}
                    className="px-2 py-1 text-[11px] font-medium rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  >
                    4 Courts
                  </button>
                </div>
              )}
            </div>

            {/* List of Courts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {courts.map((court, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/60"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={court}
                      onChange={(e) => handleCourtChange(idx, e.target.value)}
                      className="text-xs font-semibold text-slate-800 bg-transparent border-none focus:ring-0 focus:outline-none w-full truncate"
                      placeholder={`Court ${idx + 1}`}
                    />
                  </div>

                  {!isReadOnly && courts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCourt(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                      title="Remove Court"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Court Input */}
            {!isReadOnly && (
              <div className="flex items-center gap-2 pt-1 max-w-sm">
                <input
                  type="text"
                  value={newCourtInput}
                  onChange={(e) => setNewCourtInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCourt();
                    }
                  }}
                  placeholder="e.g. Court 3 or Arena B"
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg flex-1 bg-white focus:outline-none focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddCourt}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Court
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        {!isReadOnly && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Tournament Settings
            </button>
          </div>
        )}

      </form>

    </div>
  );
};
