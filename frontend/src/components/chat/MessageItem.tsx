import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  RotateCcw,
  Edit2,
  Sparkles,
  User,
  ThumbsUp,
  ThumbsDown,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import type { Message } from '../../types';
import { CodeBlock } from './CodeBlock';
import { useChat } from '../../context/ChatContext';
import { formatTimeAgo } from '../../lib/utils';

interface MessageItemProps {
  message: Message;
  isLastAssistantMessage?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
}) => {
  const { regenerateMessage, editMessage, isGenerating } = useChat();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;
    setIsEditing(false);
    await editMessage(message.id, editContent);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  return (
    <div
      className={`py-5 px-4 md:px-8 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-[#121622]/60 border-y border-white/[0.03]'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className="flex-shrink-0 pt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-slate-200 shadow-sm border border-white/10">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">
                {isUser ? 'You' : 'NOVA AI'}
              </span>
              {!isUser && message.model && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  {message.model === 'nova-ai-reasoning'
                    ? 'Reasoning'
                    : message.model === 'nova-ai-fast'
                    ? 'Fast'
                    : 'Standard'}
                </span>
              )}
              {message.status === 'regenerated' && (
                <span className="text-[10px] text-slate-500 italic">
                  (Regenerated)
                </span>
              )}
            </div>

            <span className="text-xs text-slate-500">
              {formatTimeAgo(message.created_at)}
            </span>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {message.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300"
                >
                  <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate max-w-[200px] font-medium">{att.file_name}</span>
                </div>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-[#181d2a] text-slate-100 border border-indigo-500/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans resize-none"
                rows={4}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  Save & Submit
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="markdown-body text-[14px]">
              {isUser ? (
                <div className="whitespace-pre-wrap text-slate-100 leading-relaxed font-normal">
                  {message.content}
                </div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline ? (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={String(children).replace(/\n$/, '')}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center justify-between pt-2.5 mt-2 text-slate-500 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 hover:text-slate-300 transition-colors"
                  title="Copy text"
                >
                  {copied ? (
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {isUser ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 hover:text-slate-300 transition-colors"
                    title="Edit message"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => regenerateMessage(message.id)}
                      disabled={isGenerating}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5 hover:text-slate-300 transition-colors disabled:opacity-50"
                      title="Regenerate response"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>

                    <button
                      onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                      className={`p-1 rounded hover:bg-white/5 transition-colors ${
                        feedback === 'up' ? 'text-indigo-400' : 'hover:text-slate-300'
                      }`}
                      title="Good response"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                      className={`p-1 rounded hover:bg-white/5 transition-colors ${
                        feedback === 'down' ? 'text-rose-400' : 'hover:text-slate-300'
                      }`}
                      title="Poor response"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              {!isUser && message.tokens_used ? (
                <span className="text-[11px] text-slate-500">
                  ~{message.tokens_used} tokens
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
