import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  ShieldCheck, 
  DollarSign, 
  Trophy, 
  Receipt, 
  History, 
  CheckCircle2, 
  Plus, 
  TrendingUp, 
  Tag, 
  Calendar,
  Lock
} from 'lucide-react';

export const PlatformAdminView: React.FC = () => {
  const { 
    packages, 
    packagePrices, 
    purchases, 
    tournaments, 
    auditLogs, 
    createPriceVersion, 
    verifyPurchasePayment 
  } = useTournament();

  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'PURCHASES' | 'TOURNAMENTS' | 'AUDIT'>('PACKAGES');
  const [selectedPkgId, setSelectedPkgId] = useState(packages[0]?.id || '');
  const [newPrice, setNewPrice] = useState(15000);
  const [priceNotes, setPriceNotes] = useState('');
  const [showPriceForm, setShowPriceForm] = useState(false);

  const totalRevenue = purchases
    .filter(p => p.status === 'COMPLETED' || p.paymentStatus === 'PAID')
    .reduce((sum, p) => sum + (p.amountPaid ?? p.priceSnapshot ?? 0), 0);

  const handleCreatePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkgId || newPrice <= 0) return;
    createPriceVersion(selectedPkgId, newPrice, priceNotes);
    setShowPriceForm(false);
    setPriceNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Platform Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Platform Admin & Pricing Catalog</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage per-tournament package tiers, immutable price versions, payment approvals, and platform governance.
          </p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total SaaS Revenue</span>
            <span className="text-base font-bold text-emerald-600 font-mono">NPR {totalRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Tournaments</span>
            <span className="text-base font-bold text-slate-900 font-mono">{tournaments.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        {[
          { id: 'PACKAGES', label: 'Pricing Packages & Versions', icon: Tag },
          { id: 'PURCHASES', label: 'License Purchases & Invoices', icon: Receipt },
          { id: 'TOURNAMENTS', label: 'Active Tournaments Index', icon: Trophy },
          { id: 'AUDIT', label: 'System Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 cursor-pointer transition ${
                isActive 
                  ? 'border-indigo-600 text-indigo-700 font-bold' 
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Pricing Packages & Versioning */}
      {activeTab === 'PACKAGES' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Configured Packages</h2>
            <button
              type="button"
              onClick={() => setShowPriceForm(!showPriceForm)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showPriceForm ? 'Cancel New Version' : 'New Price Version'}</span>
            </button>
          </div>

          {/* New Price Version Form */}
          {showPriceForm && (
            <form onSubmit={handleCreatePrice} className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 text-xs space-y-3">
              <h3 className="font-bold text-indigo-900">Publish New Immutable Price Version</h3>
              <p className="text-[11px] text-indigo-700">
                Existing paid tournaments retain their historic price version. Only new purchases will lock this price.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Package</label>
                  <select
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">New Price (NPR)</label>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Change Reason / Notes</label>
                  <input
                    type="text"
                    value={priceNotes}
                    onChange={(e) => setPriceNotes(e.target.value)}
                    placeholder="e.g. 2026 Fiscal Season Adjustment"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                >
                  Publish Price Version
                </button>
              </div>
            </form>
          )}

          {/* Packages List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map(pkg => {
              const activePrice = packagePrices.find(p => p.packageId === pkg.id && p.status === 'ACTIVE');
              const historicPrices = packagePrices.filter(p => p.packageId === pkg.id && p.status !== 'ACTIVE');

              return (
                <div key={pkg.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {pkg.tier}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{pkg.name}</h3>
                      <p className="text-xs text-slate-500">{pkg.description}</p>
                    </div>
                    {activePrice && (
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900 font-mono">
                          {activePrice.currency} {activePrice.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-emerald-600 block font-medium">
                          Active ({activePrice.versionCode})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Included features */}
                  <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg">
                    <div className="font-semibold text-slate-700 mb-1">Package Limits:</div>
                    <div>• Tournaments included: <span className="font-bold">{pkg.includedTournamentsCount}</span></div>
                    <div>• Teams allowed: <span className="font-bold">Up to {pkg.maxTeamsAllowed}</span></div>
                    <div>• Courts support: <span className="font-bold">{pkg.maxCourtsAllowed} concurrent courts</span></div>
                    <div>• Retention window: <span className="font-bold">{pkg.retentionGraceDays} days after final</span></div>
                  </div>

                  {/* Historic Price Versions */}
                  {historicPrices.length > 0 && (
                    <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <span className="font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        Archived Price Versions (Immutable):
                      </span>
                      {historicPrices.map(hp => (
                        <div key={hp.id} className="flex justify-between py-0.5 font-mono text-[10px]">
                          <span>{hp.versionCode}: {hp.currency} {hp.price.toLocaleString()}</span>
                          <span className="text-slate-400">Archived</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Purchases */}
      {activeTab === 'PURCHASES' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">License Purchases & Invoices</h2>
            <span className="text-xs text-slate-500 font-mono">{purchases.length} total orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment Provider</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Purchased Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {purchases.map(pur => {
                  const invoiceDisplay = pur.invoiceNumber || pur.paymentReference || `INV-${pur.id.slice(-6)}`;
                  const tierDisplay = pur.tier || pur.packageNameSnapshot || 'PRO';
                  const amountDisplay = (pur.amountPaid ?? pur.priceSnapshot ?? 0).toLocaleString();
                  const currencyDisplay = pur.currency || pur.currencySnapshot || 'NPR';
                  const providerDisplay = pur.paymentProvider || pur.paymentMethod || 'DIGITAL_WALLET';
                  const dateDisplay = pur.purchaseDate || pur.purchasedAt 
                    ? new Date(pur.purchaseDate || pur.purchasedAt || '').toLocaleDateString()
                    : new Date().toLocaleDateString();
                  const isCompleted = pur.status === 'COMPLETED' || pur.paymentStatus === 'PAID';

                  return (
                    <tr key={pur.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{invoiceDisplay}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                          {tierDisplay}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                        {currencyDisplay} {amountDisplay}
                      </td>
                      <td className="px-4 py-3">{providerDisplay}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{pur.paymentReference || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-500">{dateDisplay}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {pur.status || pur.paymentStatus || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => verifyPurchasePayment(pur.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Tournaments Index */}
      {activeTab === 'TOURNAMENTS' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">All Registered Tournaments</h2>
            <span className="text-xs text-slate-500 font-mono">{tournaments.length} tournaments</span>
          </div>

          <div className="divide-y divide-slate-100">
            {tournaments.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {t.sportCode}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {t.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>Venue: {t.venues[0]?.name}</span>
                    <span>•</span>
                    <span>Max Teams: {t.maxTeams}</span>
                    <span>•</span>
                    <span>Reg Fee: {t.currency} {t.teamRegistrationFee.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block text-[10px]">Created</span>
                  <span className="font-mono text-slate-600">{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System Audit Trail */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Platform Security & Mutation Audit Trail</h2>
            <span className="text-xs text-slate-500 font-mono">{auditLogs.length} immutable events</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3 text-xs flex items-center justify-between hover:bg-slate-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px]">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-800">{log.entityType}: {log.entityId}</span>
                  </div>
                  {log.newValue && (
                    <p className="text-slate-500 text-[11px] font-mono pl-1">{log.newValue}</p>
                  )}
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <div>{log.userEmail}</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
