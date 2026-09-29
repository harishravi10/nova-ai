import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, signIn, signUp, continueAsGuest } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (tab === 'signin') {
      const res = await signIn(email, password);
      if (res.error) setError(res.error);
    } else {
      const res = await signUp(email, password, fullName);
      if (res.error) setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={closeAuthModal} />
      <div className="relative w-full max-w-md rounded-2xl bg-[#121520] border border-white/10 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <button onClick={closeAuthModal} className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">NOVA AI</h2>
          <p className="text-xs text-indigo-400 font-medium">"Think. Ask. Create."</p>
        </div>

        <div className="flex rounded-xl bg-[#171b26] p-1 mb-5">
          <button
            onClick={() => { setTab('signin'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              tab === 'signin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('signup'); setError(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              tab === 'signup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-[#181d2a] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#181d2a] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full bg-[#181d2a] text-slate-100 text-xs px-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : tab === 'signin' ? 'Sign In to NOVA' : 'Register Account'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-[#121520] px-2 text-slate-500">Or continue instantly</span>
          </div>
        </div>

        <button
          type="button"
          onClick={continueAsGuest}
          className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-white/5 transition-colors"
        >
          <span>Continue as Guest (No signup required)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
