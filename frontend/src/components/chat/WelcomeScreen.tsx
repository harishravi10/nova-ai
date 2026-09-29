import React from 'react';
import { Sparkles, Network, Code2, Droplets, Zap, Shield, FileText } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

export const WelcomeScreen: React.FC = () => {
  const { sendMessage } = useChat();

  const promptSuggestions = [
    {
      title: 'How does TCP work?',
      desc: 'Explain the 3-way handshake, flow control, and key differences with UDP.',
      icon: Network,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30'
    },
    {
      title: 'Java DSA: Binary Search',
      desc: 'Provide a clean Java implementation with time/space complexity analysis.',
      icon: Code2,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30'
    },
    {
      title: 'Water Tracking Platform',
      desc: 'Architect an IoT platform with flow meters, leak detection, and analytics.',
      icon: Droplets,
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30'
    },
    {
      title: 'Modern AI Full-Stack Architecture',
      desc: 'How React, FastAPI, Vercel, and Supabase work seamlessly together.',
      icon: Zap,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto text-center">
      <div className="relative mb-6 group">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500 animate-pulse-subtle"></div>
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#161a29] to-[#20273c] border border-white/20 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-8 h-8 text-indigo-400 animate-spin-slow" />
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
        NOVA AI
      </h1>
      <p className="text-indigo-400 font-medium tracking-wide text-sm md:text-base mb-3">
        "Think. Ask. Create."
      </p>
      <p className="text-slate-400 text-sm md:text-base max-w-lg mb-10">
        Experience real-time AI conversation with multi-model reasoning, document analysis, and instant code generation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full text-left mb-8">
        {promptSuggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => sendMessage(item.title + ' ' + item.desc)}
              className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-white/20 transition-all duration-200 group flex items-start gap-3.5 text-left"
            >
              <div className={`p-2.5 rounded-lg bg-gradient-to-br border ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {item.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          End-to-end Backend Security
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Real-Time SSE Streaming
        </span>
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5">
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          Supabase File Storage
        </span>
      </div>
    </div>
  );
};
