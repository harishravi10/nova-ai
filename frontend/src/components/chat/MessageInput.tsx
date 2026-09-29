import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Plus,
  X,
  FileCode,
  FileText,
  FileSpreadsheet,
  File,
  Loader2,
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import type { Attachment } from '../../types';
import { api } from '../../lib/api';
import { formatFileSize } from '../../lib/utils';

export const MessageInput: React.FC = () => {
  const { sendMessage, isGenerating, stopGeneration, selectedModel } = useChat();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if ((!content.trim() && attachments.length === 0) || isGenerating || uploading) {
      return;
    }

    const text = content.trim();
    const currentAttachments = [...attachments];

    setContent('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(text, currentAttachments);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await api.uploadAttachment(file);
        setAttachments(prev => [...prev, uploaded]);
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'html', 'css', 'json'].includes(ext || '')) {
      return <FileCode className="w-3.5 h-3.5 text-indigo-400" />;
    }
    if (['csv', 'xlsx', 'xls'].includes(ext || '')) {
      return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (['txt', 'md', 'pdf', 'doc', 'docx'].includes(ext || '')) {
      return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
    }
    return <File className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0b0d13] via-[#0b0d13]/90 to-transparent pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files);
          }}
          className={`relative rounded-2xl bg-[#141824] border transition-all duration-200 shadow-2xl backdrop-blur-xl ${
            isDragging
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-[#181f33]'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 group"
                >
                  {getFileIcon(att.file_name)}
                  <span className="truncate max-w-[150px] font-medium">{att.file_name}</span>
                  <span className="text-[10px] text-slate-500">
                    ({formatFileSize(att.file_size)})
                  </span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 p-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors flex-shrink-0 disabled:opacity-50"
              title="Attach files (Text, Code, PDF, CSV)"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base py-2 px-1 resize-none focus:outline-none max-h-48 leading-relaxed"
            />

            {isGenerating ? (
              <button
                type="button"
                onClick={stopGeneration}
                className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white transition-all duration-200 flex-shrink-0 flex items-center justify-center shadow-md animate-pulse"
                title="Stop generating"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={(!content.trim() && attachments.length === 0) || uploading}
                className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 flex items-center justify-center shadow-lg ${
                  content.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-600 hover:to-cyan-600 ring-2 ring-indigo-500/20'
                    : 'bg-white/5 text-slate-500 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
          <span>NOVA AI can make mistakes. Verify important info.</span>
          <span className="hidden sm:inline font-mono">
            {selectedModel === 'nova-ai-reasoning'
              ? 'Reasoning Engine'
              : selectedModel === 'nova-ai-fast'
              ? 'Fast Engine'
              : 'Default Engine'}
          </span>
        </div>
      </div>
    </div>
  );
};
