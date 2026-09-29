import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, ArrowDown } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { MessageItem } from './MessageItem';
import { WelcomeScreen } from './WelcomeScreen';
import { CodeBlock } from './CodeBlock';

export const MessageList: React.FC = () => {
  const { messages, isGenerating, streamingContent, selectedModel, loadingHistory } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  useEffect(() => {
    if (!showScrollBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent, isGenerating]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    setShowScrollBottom(!isNearBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  if (loadingHistory) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isGenerating) {
    return <WelcomeScreen />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto relative scroll-smooth"
    >
      <div className="pb-36 pt-4">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id || index}
            message={message}
            isLastAssistantMessage={
              message.role === 'assistant' && index === messages.length - 1
            }
          />
        ))}

        {isGenerating && streamingContent && (
          <div className="py-5 px-4 md:px-8 bg-[#121622]/60 border-y border-white/[0.03]">
            <div className="max-w-3xl mx-auto flex gap-4">
              <div className="flex-shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/30">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-sm text-slate-200">NOVA AI</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                    {selectedModel === 'nova-ai-reasoning'
                      ? 'Reasoning'
                      : selectedModel === 'nova-ai-fast'
                      ? 'Fast'
                      : 'Standard'}
                  </span>
                  <span className="text-xs text-indigo-400/80 italic animate-pulse">
                    typing...
                  </span>
                </div>

                <div className="markdown-body text-[14px]">
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
                    {streamingContent}
                  </ReactMarkdown>
                  <span className="streaming-cursor" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-28 right-8 p-2.5 rounded-full bg-[#1b2130] text-slate-200 border border-white/10 shadow-xl hover:bg-[#252c40] hover:text-white transition-all duration-200 z-20 group"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
};
