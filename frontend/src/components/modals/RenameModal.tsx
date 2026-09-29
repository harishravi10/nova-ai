import React, { useState, useEffect } from 'react';
import { X, Edit2 } from 'lucide-react';
import type { Conversation } from '../../types';
import { useChat } from '../../context/ChatContext';

interface RenameModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  conversation,
  isOpen,
  onClose
}) => {
  const { renameConversation } = useChat();
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (conversation) {
      setTitle(conversation.title);
    }
  }, [conversation]);

  if (!isOpen || !conversation) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await renameConversation(conversation.id, title.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-[#121520] border border-white/10 shadow-2xl p-5 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <Edit2 className="w-4 h-4 text-indigo-400" />
            <span>Rename Chat</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1.5">Conversation Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181d2a] text-slate-100 text-xs px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={!title.trim()} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};
