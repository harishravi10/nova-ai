import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  BarChart3,
  Moon,
  Sun,
  Monitor,
  User,
  Check,
  ShieldCheck,
  Flame
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { api } from '../../lib/api';
import type { UserSettings, UsageStat } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const { user, isGuest } = useAuth();
  const { models } = useChat();

  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'analytics' | 'account'>('general');
  const [settings, setSettings] = useState<UserSettings>({
    default_model: 'nova-ai',
    theme: 'dark',
    temperature: 0.7,
    system_prompt: 'You are NOVA AI, a brilliant, articulate, and helpful AI assistant.',
    stream_response: true,
    send_on_enter: true
  });
  const [analyticsData, setAnalyticsData] = useState<UsageStat[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getSettings().then(setSettings).catch(console.error);
      api.getAnalytics().then(setAnalyticsData).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#121520] border border-white/10 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 font-bold text-base text-white">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span>NOVA AI Settings</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-white/5 px-6 bg-[#0f121a]">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'general' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('model')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'model' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Model & Parameters
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Usage & Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'account' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Account
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Appearance Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      theme === 'dark' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 text-slate-400'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-medium">Dark Mode</span>
                  </button>

                  <button
                    onClick={() => setTheme('oled')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      theme === 'oled' ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/10 text-slate-400'
                    }`}
                  >
                    <Monitor className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs font-medium">OLED Midnight</span>
                  </button>

                  <button
                    onClick={() => setTheme('light')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                      theme === 'light' ? 'border-indigo-500 bg-indigo-500/10 text-slate-900' : 'border-white/10 text-slate-400'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-medium">Light Mode</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200 text-xs">Live Stream Responses</div>
                    <div className="text-[11px] text-slate-500">Display words in real-time as they are generated</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.stream_response}
                    onChange={(e) => setSettings({ ...settings, stream_response: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-200 text-xs">Send on Enter</div>
                    <div className="text-[11px] text-slate-500">Press Enter to send message, Shift + Enter for new lines</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.send_on_enter}
                    onChange={(e) => setSettings({ ...settings, send_on_enter: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Default Conversation Model</label>
                <select
                  value={settings.default_model}
                  onChange={(e) => setSettings({ ...settings, default_model: e.target.value })}
                  className="w-full bg-[#181d2a] text-slate-200 border border-white/10 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.badge}) - {m.description}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Temperature ({settings.temperature.toFixed(2)})</span>
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">System Instruction Prompt</label>
                <textarea
                  value={settings.system_prompt}
                  onChange={(e) => setSettings({ ...settings, system_prompt: e.target.value })}
                  rows={4}
                  className="w-full bg-[#181d2a] text-slate-200 border border-white/10 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider mb-2">Weekly Token Usage</h4>
                <div className="h-48 w-full bg-[#161a26] p-3 rounded-xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252c40" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a202c', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="total_tokens" name="Total Tokens" stroke="#6366f1" fillOpacity={1} fill="url(#tokenGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider mb-2">Daily Conversations & Messages</h4>
                <div className="h-40 w-full bg-[#161a26] p-3 rounded-xl border border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#252c40" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.slice(5)} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#1a202c', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                      <Bar dataKey="messages_count" name="Messages" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User />}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">{user?.full_name || 'NOVA Explorer'}</div>
                  <div className="text-xs text-slate-400">{user?.email || 'guest@nova.ai'}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>
                  {isGuest
                    ? 'Local Guest Session Active. Cloud sync enabled when Supabase keys are provided.'
                    : 'Connected to Supabase Authentication & PostgreSQL Database.'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 border-t border-white/5 bg-[#0e1118] flex items-center justify-between">
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            {savedSuccess && (
              <>
                <Check className="w-4 h-4" />
                <span>Settings saved!</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
