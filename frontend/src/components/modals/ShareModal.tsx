import React, { useState } from 'react';
import { X, Copy, Check, Share2, FileText } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { activeConversation, messages } = useChat();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);

  if (!isOpen || !activeConversation) return null;

  const shareUrl = `${window.location.origin}/chat/shared/${activeConversation.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleCopyMarkdown = async () => {
    let md = `# ${activeConversation.title}\n\n`;
    md += `*Generated via NOVA AI ("Think. Ask. Create.")*\n\n---\n\n`;
    messages.forEach((m) => {
      const sender = m.role === 'user' ? '👤 **User**' : '✨ **NOVA AI**';
      md += `${sender}:\n\n${m.content}\n\n---\n\n`;
    });

    try {
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-[#121520] border border-white/10 shadow-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <span>Share Conversation</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Anyone with this link or transcript can view this conversation snapshot.
        </p>

        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
          <div className="font-semibold text-xs text-slate-200 truncate">{activeConversation.title}</div>
          <div className="text-[11px] text-slate-400 mt-1">{messages.length} messages · Model: {activeConversation.model}</div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Shareable Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-[#181d2a] text-slate-300 text-xs px-3 py-2 rounded-xl border border-white/10 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-white/5 transition-colors"
          >
            {copiedMarkdown ? <Check className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-indigo-400" />}
            <span>{copiedMarkdown ? 'Markdown Copied!' : 'Copy as Formatted Markdown'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
