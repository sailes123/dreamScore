import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { CreditCard, Plus, CheckCircle2, AlertCircle, Search, Edit2, RefreshCw } from 'lucide-react';
import { Team, PaymentMethod } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const RegistrationPaymentsView: React.FC = () => {
  const { 
    teams, 
    activeTournament, 
    isReadOnly, 
    updateTeamPayment,
    updateTeamFee,
    updateTournament
  } = useTournament();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Form states
  const [teamFee, setTeamFee] = useState<number>(0);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('DIGITAL_WALLET');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [syncSuccess, setSyncSuccess] = useState(false);

  const totalFeeExpected = teams.reduce((acc, t) => acc + t.registrationFee, 0);
  const totalReceived = teams.reduce((acc, t) => acc + t.amountReceived, 0);
  const totalOutstanding = totalFeeExpected - totalReceived;

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.paymentReference || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.managerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPaymentModal = (team: Team) => {
    setSelectedTeam(team);
    setTeamFee(team.registrationFee ?? activeTournament.teamRegistrationFee ?? 0);
    setAmount(team.amountReceived ?? 0);
    setMethod(team.paymentMethod || 'DIGITAL_WALLET');
    setReference(team.paymentReference || '');
    setNotes(team.paymentNotes || '');
  };

  const handleSyncAllFees = () => {
    if (updateTournament) {
      updateTournament({ teamRegistrationFee: activeTournament.teamRegistrationFee }, true);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    }
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    if (updateTeamFee && teamFee !== selectedTeam.registrationFee) {
      updateTeamFee(selectedTeam.id, Number(teamFee));
    }

    updateTeamPayment(
      selectedTeam.id,
      Number(amount),
      method,
      reference,
      notes
    );
    setSelectedTeam(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight">Registration Fees & Payments</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Internal record-keeping for team registration entry fees, payment methods, and cash balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleSyncAllFees}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs flex items-center gap-1.5"
              title="Set registration fee for all teams to the tournament default fee"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncSuccess ? 'text-emerald-600 animate-spin' : 'text-slate-400'}`} />
              <span>{syncSuccess ? 'Fees Applied!' : `Set All to ${activeTournament.teamRegistrationFee.toLocaleString()} ${activeTournament.currency}`}</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search team or receipt #..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 w-56 shadow-2xs transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Accounting Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Total Entry Fees Expected</span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {totalFeeExpected.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{activeTournament.currency}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            {teams.length} registered teams × {activeTournament.teamRegistrationFee.toLocaleString()} {activeTournament.currency}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Total Amount Collected</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {totalReceived.toLocaleString()} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-sans">{activeTournament.currency}</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-semibold">
            {totalFeeExpected > 0 ? ((totalReceived / totalFeeExpected) * 100).toFixed(1) : 0}% collected
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">Outstanding Balance</span>
          <div className={`text-2xl font-bold font-mono ${totalOutstanding > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
            {totalOutstanding.toLocaleString()} <span className="text-xs text-slate-400 font-sans">{activeTournament.currency}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            {teams.filter(t => t.paymentStatus !== 'PAID').length} teams with pending dues
          </p>
        </div>

      </div>

      {/* Table of Teams & Payments */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Required Fee</th>
                <th className="py-3 px-4">Amount Received</th>
                <th className="py-3 px-4">Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Method & Reference</th>
                <th className="py-3 px-4">Payment Date</th>
                {!isReadOnly && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTeams.map((team) => {
                const balance = team.registrationFee - team.amountReceived;
                return (
                  <tr key={team.id} className="hover:bg-slate-50/75 transition-colors">
                    
                    {/* Team */}
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {team.name}
                      <span className="text-[11px] text-slate-400 font-normal block font-mono">
                        Code: {team.shortName}
                      </span>
                    </td>

                    {/* Required Fee */}
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {team.registrationFee.toLocaleString()} {activeTournament.currency}
                    </td>

                    {/* Received */}
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                      {team.amountReceived.toLocaleString()} {activeTournament.currency}
                    </td>

                    {/* Balance */}
                    <td className="py-3 px-4 font-mono font-bold">
                      {balance > 0 ? (
                        <span className="text-rose-600">-{balance.toLocaleString()} {activeTournament.currency}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={team.paymentStatus} size="sm" />
                    </td>

                    {/* Method & Ref */}
                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium block">
                        {team.paymentMethod ? team.paymentMethod.replace(/_/g, ' ') : '—'}
                      </span>
                      {team.paymentReference && (
                        <span className="text-[11px] text-slate-400 font-mono block">
                          Ref: {team.paymentReference}
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {team.paymentDate ? new Date(team.paymentDate).toLocaleDateString() : '—'}
                    </td>

                    {/* Action */}
                    {!isReadOnly && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openPaymentModal(team)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          Update
                        </button>
                      </td>
                    )}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payment Modal */}
      <Modal
        isOpen={selectedTeam !== null}
        onClose={() => setSelectedTeam(null)}
        title="Update Team Entry Fee Accounting"
        subtitle={selectedTeam ? `${selectedTeam.name}` : ''}
      >
        {selectedTeam && (
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex justify-between">
              <div>
                <span className="text-slate-500 block">Total Entry Fee:</span>
                <span className="font-bold font-mono text-slate-900">
                  {teamFee.toLocaleString()} {activeTournament.currency}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Outstanding Balance:</span>
                <span className={`font-bold font-mono ${teamFee - amount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {(teamFee - amount).toLocaleString()} {activeTournament.currency}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Fee ({activeTournament.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={teamFee ?? 0}
                  onChange={(e) => setTeamFee(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received ({activeTournament.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={amount ?? 0}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAmount(teamFee)}
                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] hover:bg-slate-200"
              >
                Full Payment ({teamFee.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setAmount(0)}
                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] hover:bg-slate-200"
              >
                Mark Unpaid (0)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="DIGITAL_WALLET">Digital Wallet (eSewa, Khalti)</option>
                  <option value="BANK_TRANSFER">Bank Transfer / Fonepay</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transaction / Receipt #
                </label>
                <input
                  type="text"
                  value={reference || ''}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TXN-88412"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Accounting Notes
              </label>
              <textarea
                value={notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes regarding waivers, sponsors, or partial installments..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedTeam(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
              >
                Save Payment Record
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
