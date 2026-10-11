import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  CreditCard, 
  Phone, 
  Mail, 
  Search, 
  UserCheck, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Team, TeamRegistrationStatus, PaymentMethod } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';

export const TeamsManager: React.FC = () => {
  const { 
    teams, 
    players, 
    activeTournament, 
    isReadOnly, 
    addTeam, 
    updateTeam, 
    deleteTeam,
    updateTeamPayment
  } = useTournament();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [paymentTeam, setPaymentTeam] = useState<Team | null>(null);

  // Form states for Add / Edit
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [groupId, setGroupId] = useState<'group-a' | 'group-b' | ''>('group-a');
  const [primaryColor, setPrimaryColor] = useState('#0284c7');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [managerName, setManagerName] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<TeamRegistrationStatus>('CONFIRMED');

  // Payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('DIGITAL_WALLET');
  const [payRef, setPayRef] = useState('');
  const [payNotes, setPayNotes] = useState('');

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.managerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setTeamName('');
    setShortName('');
    setGroupId('group-a');
    setPrimaryColor('#0284c7');
    setSecondaryColor('#ffffff');
    setManagerName('');
    setManagerPhone('');
    setManagerEmail('');
    setRegistrationStatus('CONFIRMED');
    setIsAddModalOpen(true);
  };

  const openEditModal = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name || '');
    setShortName(team.shortName || '');
    setGroupId((team.groupId as any) || 'group-a');
    setPrimaryColor(team.primaryColor || '#0284c7');
    setSecondaryColor(team.secondaryColor || '#ffffff');
    setManagerName(team.managerName || '');
    setManagerPhone(team.managerPhone || '');
    setManagerEmail(team.managerEmail || '');
    setRegistrationStatus(team.registrationStatus || 'CONFIRMED');
    setIsAddModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !shortName.trim()) return;

    if (editingTeam) {
      updateTeam(editingTeam.id, {
        name: teamName,
        shortName: shortName.toUpperCase(),
        groupId: groupId || undefined,
        primaryColor,
        secondaryColor,
        managerName,
        managerPhone,
        managerEmail,
        registrationStatus
      });
      setEditingTeam(null);
    } else {
      addTeam({
        name: teamName,
        shortName: shortName.toUpperCase(),
        groupId: groupId || undefined,
        primaryColor,
        secondaryColor,
        managerName,
        managerPhone,
        managerEmail,
        registrationStatus,
        registrationFee: activeTournament.teamRegistrationFee,
        amountReceived: 0,
        paymentStatus: 'UNPAID'
      });
      setIsAddModalOpen(false);
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTeam) return;

    updateTeamPayment(
      paymentTeam.id, 
      Number(payAmount), 
      payMethod, 
      payRef, 
      payNotes
    );
    setPaymentTeam(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Tournament Teams</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Registered squads, contact persons, group allocation, and registration fee balances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search team or manager..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 w-48 sm:w-64 shadow-2xs transition-colors"
            />
          </div>

          {!isReadOnly && (
            <button
              type="button"
              onClick={openAddModal}
              disabled={teams.length >= activeTournament.maxTeams}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Team
            </button>
          )}
        </div>
      </div>

      {/* Table-First Design (Section 40) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        {filteredTeams.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Roster</th>
                  <th className="py-3 px-4">Manager / Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Fee / Payment</th>
                  {!isReadOnly && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTeams.map((team) => {
                  const teamRoster = players.filter(p => p.teamId === team.id);
                  const remaining = team.registrationFee - team.amountReceived;

                  return (
                    <tr key={team.id} className="hover:bg-slate-50/75 transition-colors">
                      
                      {/* Team Name + Colors */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-[11px] text-white shadow-xs"
                            style={{ backgroundColor: team.primaryColor }}
                            title={`Primary: ${team.primaryColor}`}
                          >
                            {team.shortName.slice(0, 3)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{team.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">Code: {team.shortName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Group */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {team.groupId ? (
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                            {team.groupId.toUpperCase().replace('-', ' ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Roster count */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          {teamRoster.length} players
                        </span>
                      </td>

                      {/* Manager */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{team.managerName || '—'}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          {team.managerPhone && <span>{team.managerPhone}</span>}
                          {team.managerEmail && <span>{team.managerEmail}</span>}
                        </div>
                      </td>

                      {/* Registration Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={team.registrationStatus} size="sm" />
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={team.paymentStatus} size="sm" />
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentTeam(team);
                              setPayAmount(team.amountReceived);
                              setPayMethod(team.paymentMethod || 'DIGITAL_WALLET');
                              setPayRef(team.paymentReference || '');
                              setPayNotes(team.paymentNotes || '');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer"
                            title="Record / Update payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {team.amountReceived.toLocaleString()} / {team.registrationFee.toLocaleString()} {activeTournament.currency}
                          {remaining > 0 && <span className="text-rose-600 ml-1">(-{remaining.toLocaleString()})</span>}
                        </div>
                      </td>

                      {/* Actions */}
                      {!isReadOnly && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(team)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
                              title="Edit team details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove "${team.name}" and all associated players?`)) {
                                  deleteTeam(team.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                              title="Delete team"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={searchQuery ? 'No matching teams' : 'No teams registered yet'}
            description={
              searchQuery 
                ? 'Try a different search keyword.' 
                : 'Register the first team to begin structuring groups and tournament schedule.'
            }
            actionLabel={!isReadOnly && !searchQuery ? 'Register First Team' : undefined}
            onAction={openAddModal}
          />
        )}
      </div>

      {/* Add / Edit Team Modal */}
      <Modal
        isOpen={isAddModalOpen || editingTeam !== null}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTeam(null);
        }}
        title={editingTeam ? 'Edit Team Details' : 'Register New Team'}
        subtitle={`Tournament: ${activeTournament.name}`}
      >
        <form onSubmit={handleSaveTeam} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Team Full Name *
              </label>
              <input
                type="text"
                required
                value={teamName || ''}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Shankhamul Futsal"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Name / Code (3-4 Letters) *
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={shortName || ''}
                onChange={(e) => setShortName(e.target.value.toUpperCase())}
                placeholder="e.g. SKM"
                className="w-full px-3 py-2 text-xs font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Group Allocation
              </label>
              <select
                value={groupId || ''}
                onChange={(e) => setGroupId(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600 bg-white"
              >
                <option value="group-a">Group A</option>
                <option value="group-b">Group B</option>
                <option value="">No Group (Unassigned)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Registration Status
              </label>
              <select
                value={registrationStatus || 'CONFIRMED'}
                onChange={(e) => setRegistrationStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600 bg-white"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="REGISTERED">Registered</option>
                <option value="DRAFT">Draft</option>
                <option value="WITHDRAWN">Withdrawn</option>
                <option value="DISQUALIFIED">Disqualified</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Jersey Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor || '#0284c7'}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-9 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor || '#0284c7'}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager / Contact Person
              </label>
              <input
                type="text"
                value={managerName || ''}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Prakash Tamang"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager Phone
              </label>
              <input
                type="text"
                value={managerPhone || ''}
                onChange={(e) => setManagerPhone(e.target.value)}
                placeholder="+977-9801234567"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager Email
              </label>
              <input
                type="email"
                value={managerEmail || ''}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="manager@team.np"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingTeam(null);
              }}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
            >
              {editingTeam ? 'Save Changes' : 'Complete Team Registration'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Team Registration Payment Modal */}
      <Modal
        isOpen={paymentTeam !== null}
        onClose={() => setPaymentTeam(null)}
        title="Record Team Registration Payment"
        subtitle={paymentTeam ? `Accounting for ${paymentTeam.name}` : ''}
      >
        {paymentTeam && (
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-500 block">Required Entry Fee:</span>
                <span className="font-bold font-mono text-slate-900 text-sm">
                  {paymentTeam.registrationFee.toLocaleString()} {activeTournament.currency}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Current Balance:</span>
                <span className={`font-bold font-mono text-sm ${paymentTeam.registrationFee - payAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {(paymentTeam.registrationFee - payAmount).toLocaleString()} {activeTournament.currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Received ({activeTournament.currency}) *
              </label>
              <input
                type="number"
                required
                min={0}
                max={paymentTeam.registrationFee * 2}
                value={payAmount ?? 0}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-slate-600"
              />
              <div className="flex gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => setPayAmount(paymentTeam.registrationFee)}
                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] hover:bg-slate-200"
                >
                  Full Amount ({paymentTeam.registrationFee})
                </button>
                <button
                  type="button"
                  onClick={() => setPayAmount(0)}
                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] hover:bg-slate-200"
                >
                  Clear (0)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="DIGITAL_WALLET">Digital Wallet (eSewa / Khalti)</option>
                  <option value="BANK_TRANSFER">Bank Transfer / Fonepay</option>
                  <option value="CASH">Cash on Site</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference / Receipt Number
                </label>
                <input
                  type="text"
                  value={payRef || ''}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="e.g. REC-00912 or TXN-4491"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Internal Accounting Notes
              </label>
              <textarea
                value={payNotes || ''}
                onChange={(e) => setPayNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes regarding split payments, waivers or sponsors..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPaymentTeam(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
              >
                Update Payment Record
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
