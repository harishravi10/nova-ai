import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Share2,
  MoreVertical,
  Download,
  Trash2,
  Sparkles,
  Zap,
  Brain,
  Check,
  Menu,
  Sliders,
  FileText
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface ChatHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenShareModal: () => void;
  onOpenSettingsModal: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenMobileSidebar,
  onOpenShareModal,
  onOpenSettingsModal
}) => {
  const {
    activeConversation,
    models,
    selectedModel,
    setSelectedModel,
    deleteConversation,
  } = useChat();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);

  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeModel = models.find((m) => m.id === selectedModel) || {
    id: 'nova-ai',
    name: 'NOVA AI',
    badge: 'Default',
    description: 'Smart, balanced & versatile for everyday tasks'
  };

  const getModelIcon = (id: string) => {
    if (id === 'nova-ai-reasoning') return <Brain className="w-4 h-4 text-purple-400" />;
    if (id === 'nova-ai-fast') return <Zap className="w-4 h-4 text-amber-400" />;
    return <Sparkles className="w-4 h-4 text-cyan-400" />;
  };

  const handleExportMarkdown = () => {
    if (!activeConversation) return;
    window.open(`/api/conversations/${activeConversation.id}/export?format=markdown`, '_blank');
    setIsMoreDropdownOpen(false);
  };

  const handleExportJSON = () => {
    if (!activeConversation) return;
    window.open(`/api/conversations/${activeConversation.id}/export?format=json`, '_blank');
    setIsMoreDropdownOpen(false);
  };

  const handleDeleteCurrent = async () => {
    if (!activeConversation) return;
    if (confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(activeConversation.id);
    }
    setIsMoreDropdownOpen(false);
  };

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#0c0e14]/80 backdrop-blur-md flex items-center justify-between px-4 z-20 sticky top-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative" ref={modelDropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group"
          >
            <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-100 group-hover:text-white">
              {getModelIcon(selectedModel)}
              <span>{activeModel.name}</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-mono">
              {activeModel.badge}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {isModelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#141824] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5 mb-1">
                Select Model
              </div>
              <div className="space-y-1">
                {models.map((model) => {
                  const isSelected = model.id === selectedModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors ${
                        isSelected
                          ? 'bg-indigo-600/15 border border-indigo-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="pt-0.5">{getModelIcon(model.id)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-slate-100">
                            {model.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                            {model.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {model.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {activeConversation && (
          <span className="hidden lg:inline text-xs text-slate-400 border-l border-white/10 pl-3 truncate max-w-[200px]">
            {activeConversation.title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors text-xs font-medium border border-white/5"
          title="Share conversation"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <div className="relative" ref={moreDropdownRef}>
          <button
            onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMoreDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#141824] border border-white/10 shadow-2xl p-1.5 z-50">
              <button
                onClick={onOpenSettingsModal}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left"
              >
                <Sliders className="w-4 h-4 text-slate-400" />
                <span>Model Settings</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                disabled={!activeConversation}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left disabled:opacity-40"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Export as Markdown</span>
              </button>

              <button
                onClick={handleExportJSON}
                disabled={!activeConversation}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors text-left disabled:opacity-40"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export as JSON</span>
              </button>

              <div className="my-1 border-t border-white/5" />

              <button
                onClick={handleDeleteCurrent}
                disabled={!activeConversation}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Delete Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
