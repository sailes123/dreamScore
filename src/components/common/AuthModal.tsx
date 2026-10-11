import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Modal } from './Modal';
import { ShieldCheck, UserCheck, Trophy, LogIn, Check, Lock, Mail, ArrowRight } from 'lucide-react';
import { User } from '../../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login, 
    availableUsers, 
    currentUser,
    isLoggedOut
  } = useTournament();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'custom'>('quick');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Check if matches known user or create guest/custom user
    const matched = availableUsers.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase());
    if (matched) {
      login(matched);
    } else {
      const customUser: User = {
        id: `user-${Date.now()}`,
        email: emailInput.trim(),
        name: emailInput.split('@')[0].replace('.', ' ').toUpperCase(),
        systemRole: 'ORGANIZER'
      };
      login(customUser);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title="Sign in to ArenaOps"
      maxWidth="md"
    >
      <div className="space-y-5">
        <p className="text-xs text-slate-500">
          Select a demo persona to test role-based permissions or sign in with your credentials.
        </p>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === 'quick' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'hover:text-slate-900'
            }`}
          >
            Demo Profiles (1-Click)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
              activeTab === 'custom' 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'hover:text-slate-900'
            }`}
          >
            Custom Sign In
          </button>
        </div>

        {activeTab === 'quick' ? (
          <div className="space-y-2.5">
            {availableUsers.map((u) => {
              const isCurrent = !isLoggedOut && currentUser.id === u.id;
              const isOwner = u.id === 'user-organizer';
              const isAdmin = u.systemRole === 'PLATFORM_ADMIN';

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => login(u)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrent 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                      isAdmin 
                        ? 'bg-indigo-600 text-white' 
                        : isOwner 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-sky-600 text-white'
                    }`}>
                      {isAdmin ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : isOwner ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <UserCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {u.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{u.email}</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {isAdmin 
                          ? 'Platform Superadmin • Price Tiers & Audits' 
                          : isOwner 
                            ? 'Tournament Owner • Full Operations & Billing' 
                            : 'Match Official • Court-side Scoring'}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition" />
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleCustomLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="organizer@tournament.org"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Demo mode: Any password accepted.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In to Workspace
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
