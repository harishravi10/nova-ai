import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2,
  X,
  User,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { groupConversationsByDate } from '../../lib/utils';
import type { Conversation } from '../../types';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenRename: (conv: Conversation) => void;
  onOpenDelete: (conv: Conversation) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenSettings,
  onOpenHelp,
  onOpenRename,
  onOpenDelete
}) => {
  const {
    conversations,
    activeConversation,
    selectConversation,
    startNewChat,
    searchQuery,
    setSearchQuery
  } = useChat();

  const { user, isGuest, signOut, openAuthModal } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const grouped = groupConversationsByDate(conversations);

  const renderSection = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </div>
        <div className="space-y-0.5 mt-1">
          {items.map((conv) => {
            const isActive = activeConversation?.id === conv.id;
            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white/10 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
                onClick={() => {
                  selectConversation(conv.id);
                  onCloseMobile();
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 flex-shrink-0 ${
                      isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                  <span className="truncate">{conv.title}</span>
                </div>

                <div className="hidden group-hover:flex items-center gap-1 pl-2 bg-gradient-to-l from-[#141824] via-[#141824] to-transparent">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenRename(conv);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Rename chat"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDelete(conv);
                    }}
                    className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d1017] border-r border-white/[0.08] select-none">
      <div className="p-3.5 flex items-center justify-between border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>NOVA AI</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  PRO
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-normal">
                Think. Ask. Create.
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3">
        <button
          onClick={() => {
            startNewChat();
            onCloseMobile();
          }}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all duration-200 border border-indigo-400/30 ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-[#141824] text-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl border border-white/5 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 py-1 scroll-smooth">
        {!isCollapsed ? (
          conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No conversations yet.
            </div>
          ) : (
            <>
              {renderSection('Today', grouped.today)}
              {renderSection('Yesterday', grouped.yesterday)}
              {renderSection('Previous 7 Days', grouped.previous7Days)}
              {renderSection('Older', grouped.older)}
            </>
          )
        ) : (
          <div className="flex flex-col items-center gap-2 pt-2">
            {conversations.slice(0, 10).map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`p-2.5 rounded-xl transition-colors ${
                  activeConversation?.id === conv.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
                title={conv.title}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/[0.08] bg-[#0b0d13]">
        <div className="flex items-center justify-between mb-2 p-1.5 rounded-xl bg-white/[0.03]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-200 truncate">
                  {user?.full_name || 'NOVA User'}
                </div>
                <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                  {isGuest ? (
                    <span className="text-amber-400/90 font-mono">Guest Mode</span>
                  ) : (
                    <span>{user?.email}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {isGuest && !isCollapsed && (
            <button
              onClick={openAuthModal}
              className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors font-medium"
            >
              Sign In
            </button>
          )}
        </div>

        <div className={`grid ${isCollapsed ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-1'} text-xs`}>
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Settings</span>}
          </button>

          <button
            onClick={onOpenHelp}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            title="Help & About"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Help</span>}
          </button>

          <button
            onClick={signOut}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden md:block transition-all duration-300 flex-shrink-0 z-30 ${
          isCollapsed ? 'w-[68px]' : 'w-64 lg:w-72'
        }`}
      >
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
