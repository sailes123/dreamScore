import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { 
  CreditCard, 
  Check, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Clock, 
  Receipt,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { CURRENT_PRICING_CATALOG } from '../../data/mockData';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC = () => {
  const { 
    isPricingModalOpen, 
    setIsPricingModalOpen, 
    currentPurchase, 
    activeTournament, 
    simulatePurchaseUpgrade 
  } = useTournament();

  const [selectedTier, setSelectedTier] = useState<'PRO' | 'MULTI_PRO'>('PRO');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handleSimulateUpgrade = (tier: 'PRO' | 'MULTI_PRO') => {
    simulatePurchaseUpgrade(tier);
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setIsPricingModalOpen(false);
    }, 1800);
  };

  if (!isPricingModalOpen) return null;

  const amountPaidDisplay = (currentPurchase?.amountPaid ?? currentPurchase?.priceSnapshot ?? 0).toLocaleString();
  const currencyDisplay = currentPurchase?.currency || currentPurchase?.currencySnapshot || 'NPR';
  const invoiceDisplay = currentPurchase?.invoiceNumber || currentPurchase?.paymentReference || 'INV-2026-001';
  const planDisplay = currentPurchase?.tier || currentPurchase?.packageNameSnapshot || 'STANDARD';
  const priceVersionDisplay = currentPurchase?.packagePriceId || 'v2026.1';
  const paymentProviderDisplay = currentPurchase?.paymentProvider || currentPurchase?.paymentMethod || 'DIGITAL_WALLET';
  const purchaseDateDisplay = currentPurchase?.purchaseDate || currentPurchase?.purchasedAt 
    ? new Date(currentPurchase.purchaseDate || currentPurchase.purchasedAt || '').toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <Modal
      isOpen={isPricingModalOpen}
      onClose={() => setIsPricingModalOpen(false)}
      title="Tournament Plan & License Management"
      subtitle="Transparent per-tournament pricing with immutable price versioning"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        
        {/* Existing Purchase Receipt Snapshot (Section 4 & 35) */}
        {currentPurchase && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Active License Receipt
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                PAID & LOCKED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block">Invoice #</span>
                <span className="font-bold text-slate-900">{invoiceDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Plan Code</span>
                <span className="font-bold text-slate-900">{planDisplay}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Amount Paid</span>
                <span className="font-bold text-emerald-700">
                  {amountPaidDisplay} {currencyDisplay}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Price Version</span>
                <span className="font-bold text-slate-900">{priceVersionDisplay}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Payment Method: <strong>{paymentProviderDisplay}</strong> ({currentPurchase.paymentReference || 'N/A'})</span>
              <span>Purchased: <strong>{purchaseDateDisplay}</strong></span>
            </div>
          </div>
        )}

        {purchaseSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>License updated and new price snapshot recorded successfully!</span>
          </div>
        )}

        {/* Pricing Version Catalog (Section 34) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Pro Single Tournament Plan */}
          <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition bg-white flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-slate-900">Single Tournament Pro</h4>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {CURRENT_PRICING_CATALOG.PRO.versionId}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  NPR {CURRENT_PRICING_CATALOG.PRO.amountNpr.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">/ tournament (~${CURRENT_PRICING_CATALOG.PRO.amountUsd})</span>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Full lifecycle access for 1 tournament including 7-day retention grace, live scoring, and Excel workbook exports.
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Up to 32 Teams & 500 Players</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time Court Match Operator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Automated 9-Sheet Excel Export (.xlsx)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Public Fan Portal & Shareable URLs</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSimulateUpgrade('PRO')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition shadow-xs cursor-pointer"
            >
              Select Single Pro Plan
            </button>
          </div>

          {/* Multi-Tournament 5-Pack */}
          <div className="border-2 border-slate-900 rounded-xl p-5 bg-slate-50/50 flex flex-col justify-between space-y-4 relative">
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
              Popular for Leagues
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-slate-900">Season 5-Tournament Pack</h4>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  {CURRENT_PRICING_CATALOG.MULTI_PRO.versionId}
                </span>
              </div>

              <div className="flex items-baseline gap-1 my-3">
                <span className="text-3xl font-bold font-mono text-slate-900">
                  NPR {CURRENT_PRICING_CATALOG.MULTI_PRO.amountNpr.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">/ 5 tournaments (~${CURRENT_PRICING_CATALOG.MULTI_PRO.amountUsd})</span>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Designed for arena owners, corporate leagues, and academies hosting multiple tournaments throughout the year.
              </p>

              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>5 Complete Tournament Licenses</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Multi-Court Simultaneous Scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Custom Sponsor Logos on Public Portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Priority Export Archive Delivery</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSimulateUpgrade('MULTI_PRO')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
            >
              Upgrade to 5-Pack
            </button>
          </div>

        </div>

        {/* Pricing Version Lock Notice (Section 4 Rule) */}
        <div className="text-[11px] text-slate-400 text-center leading-relaxed">
          <ShieldCheck className="w-3.5 h-3.5 inline-block mr-1 text-slate-500" />
          <strong>Price Version Guarantee:</strong> When a tournament license is purchased, its price snapshot is permanently locked in the database. Future platform pricing updates will never retroactively adjust past invoices.
        </div>

      </div>
    </Modal>
  );
};
