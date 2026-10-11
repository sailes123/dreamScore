import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  UserCheck, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  Search, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Player } from '../../types';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';

export const PlayersManager: React.FC = () => {
  const { 
    players, 
    teams, 
    isReadOnly, 
    addPlayer, 
    updatePlayer, 
    deletePlayer 
  } = useTournament();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [jerseyNumber, setJerseyNumber] = useState<number>(7);
  const [position, setPosition] = useState<Player['position']>('Pivot / Forward');
  const [isCaptain, setIsCaptain] = useState(false);
  const [isGoalkeeper, setIsGoalkeeper] = useState(false);

  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const filteredPlayers = players.filter(p => {
    const matchesSearch = 
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.jerseyNumber.toString().includes(searchQuery) ||
      (teamMap.get(p.teamId) || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = selectedTeamFilter === 'ALL' || p.teamId === selectedTeamFilter;
    return matchesSearch && matchesTeam;
  });

  const openAddModal = () => {
    setFirstName('');
    setLastName('');
    setDisplayName('');
    setTeamId(selectedTeamFilter !== 'ALL' ? selectedTeamFilter : (teams[0]?.id || ''));
    setJerseyNumber(10);
    setPosition('Pivot / Forward');
    setIsCaptain(false);
    setIsGoalkeeper(false);
    setErrorMessage(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFirstName(player.firstName || '');
    setLastName(player.lastName || '');
    setDisplayName(player.displayName || '');
    setTeamId(player.teamId || '');
    setJerseyNumber(player.jerseyNumber ?? 10);
    setPosition(player.position || 'Pivot / Forward');
    setIsCaptain(player.isCaptain ?? false);
    setIsGoalkeeper(player.isGoalkeeper ?? false);
    setErrorMessage(null);
  };

  const handleNameChange = (first: string, last: string) => {
    setFirstName(first);
    setLastName(last);
    setDisplayName(`${first} ${last}`.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!displayName.trim()) {
      setErrorMessage('Player display name is required.');
      return;
    }

    if (editingPlayer) {
      const res = updatePlayer(editingPlayer.id, {
        firstName,
        lastName,
        displayName,
        teamId,
        jerseyNumber,
        position,
        isCaptain,
        isGoalkeeper
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to update player');
        return;
      }
      setEditingPlayer(null);
    } else {
      const res = addPlayer({
        firstName,
        lastName,
        displayName,
        teamId,
        jerseyNumber,
        position,
        isCaptain,
        isGoalkeeper
      });
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to register player');
        return;
      }
      setIsAddModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Registered Players ({players.length})</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Player rosters, unique team jersey allocations, and court positions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Team Filter */}
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none shadow-2xs transition-colors"
          >
            <option value="ALL">All Teams ({teams.length})</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search player or jersey..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 w-44 sm:w-56 shadow-2xs transition-colors"
            />
          </div>

          {!isReadOnly && (
            <button
              type="button"
              onClick={openAddModal}
              disabled={teams.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Player
            </button>
          )}
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        {filteredPlayers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 w-14">#</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Position</th>
                  <th className="py-3 px-4">Role Badges</th>
                  {!isReadOnly && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Jersey # */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
                        {player.jerseyNumber}
                      </span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block">{player.displayName}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {player.firstName} {player.lastName}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {teamMap.get(player.teamId) || 'Unassigned'}
                    </td>

                    {/* Position */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        {player.position}
                      </span>
                    </td>

                    {/* Badges */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {player.isCaptain && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-bold text-[10px]" title="Team Captain">
                            (C) Captain
                          </span>
                        )}
                        {player.isGoalkeeper && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 font-bold text-[10px]" title="Designated Goalkeeper">
                            GK
                          </span>
                        )}
                        {!player.isCaptain && !player.isGoalkeeper && (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Outfield</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    {!isReadOnly && (
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(player)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Edit player"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove player ${player.displayName} (#${player.jerseyNumber})?`)) {
                                deletePlayer(player.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                            title="Delete player"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={UserCheck}
            title={searchQuery ? 'No matching players' : 'No players registered yet'}
            description={
              teams.length === 0 
                ? 'Register at least one team before adding players to rosters.'
                : 'Add players with their jersey numbers and positions to build squad sheets.'
            }
            actionLabel={!isReadOnly && teams.length > 0 && !searchQuery ? 'Add First Player' : undefined}
            onAction={openAddModal}
          />
        )}
      </div>

      {/* Add / Edit Player Modal */}
      <Modal
        isOpen={isAddModalOpen || editingPlayer !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPlayer(null);
        }}
        title={editingPlayer ? 'Edit Player' : 'Register New Player'}
        subtitle="Manage jersey number and position"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2 text-xs text-rose-700">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Team *
            </label>
            <select
              required
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-600"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName || ''}
                onChange={(e) => handleNameChange(e.target.value, lastName)}
                placeholder="e.g. Suman"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName || ''}
                onChange={(e) => handleNameChange(firstName, e.target.value)}
                placeholder="e.g. Rai"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Display Name (Match Sheet / Graphics) *
            </label>
            <input
              type="text"
              required
              value={displayName || ''}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Suman Rai"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jersey Number (1-99) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={99}
                value={jerseyNumber ?? 10}
                onChange={(e) => setJerseyNumber(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Checked for duplicate in team
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Field Position
              </label>
              <select
                value={position}
                onChange={(e) => {
                  const pos = e.target.value as Player['position'];
                  setPosition(pos);
                  if (pos === 'Goalkeeper') {
                    setIsGoalkeeper(true);
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="Pivot / Forward">Pivot / Forward</option>
                <option value="Flanker / Winger">Flanker / Winger</option>
                <option value="Defender">Defender (Fixo)</option>
                <option value="Goalkeeper">Goalkeeper (Portero)</option>
                <option value="Universal">Universal</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isCaptain}
                onChange={(e) => setIsCaptain(e.target.checked)}
                className="rounded text-slate-900 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Team Captain (C)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isGoalkeeper}
                onChange={(e) => setIsGoalkeeper(e.target.checked)}
                className="rounded text-slate-900 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Goalkeeper</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingPlayer(null);
              }}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
            >
              {editingPlayer ? 'Save Changes' : 'Register Player'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
