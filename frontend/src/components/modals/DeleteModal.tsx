import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { Conversation } from '../../types';
import { useChat } from '../../context/ChatContext';

interface DeleteModalProps {
  conversation: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  conversation,
  isOpen,
  onClose
}) => {
  const { deleteConversation } = useChat();

  if (!isOpen || !conversation) return null;

  const handleDelete = async () => {
    await deleteConversation(conversation.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl bg-[#121520] border border-white/10 shadow-2xl p-5 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-rose-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Delete Conversation?</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-2">Are you sure you want to permanently delete:</p>
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white font-medium truncate mb-4">
          "{conversation.title}"
        </div>
        <p className="text-[11px] text-slate-500 mb-4">
          This will delete all messages, code blocks, and uploaded attachments. This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20">Delete</button>
        </div>
      </div>
    </div>
  );
};
