import React from 'react';
import { X, Sparkles, Command, Cpu, ShieldCheck } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-[#121520] border border-white/10 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>About NOVA AI</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h4 className="font-bold text-sm text-white mb-1">"Think. Ask. Create."</h4>
            <p className="text-slate-400 text-xs">
              NOVA AI is a modern production-quality AI chatbot platform designed for speed, deep reasoning, and multi-file context analysis.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5 text-indigo-400" />
              <span>Keyboard Shortcuts</span>
            </h5>
            <div className="space-y-1.5 bg-white/[0.02] p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <span>Send message</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Enter</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>New line in input</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Shift + Enter</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Dismiss modal / drawer</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px]">Esc</kbd>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Model AI Selector</span>
            </h5>
            <div className="space-y-2 text-slate-400">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="font-medium text-slate-200">NOVA AI (Standard)</span>: Balanced, fast, and high-quality responses for everyday code and writing.
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="font-medium text-slate-200">NOVA AI Fast</span>: Ultra-low latency for quick answers and concise summaries.
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="font-medium text-slate-200">NOVA AI Reasoning</span>: Deep multi-step reasoning, mathematical proofs, and complex architectural design.
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full-Stack Architecture</span>
            </h5>
            <p className="text-slate-400">
              Built with React, TypeScript, Vite, Tailwind CSS, FastAPI, Vercel Serverless, Supabase Auth, PostgreSQL, and Storage.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium">Got it</button>
        </div>
      </div>
    </div>
  );
};
