import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Conversation, Message, Attachment, ModelOption } from '../types';
import { api, apiClient } from '../lib/api';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  models: ModelOption[];
  selectedModel: string;
  isGenerating: boolean;
  streamingContent: string;
  searchQuery: string;
  loadingHistory: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedModel: (modelId: string) => void;
  selectConversation: (id: string) => Promise<void>;
  startNewChat: () => void;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  stopGeneration: () => void;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('nova-ai');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    api.getModels().then(data => {
      if (data && data.length > 0) {
        setModels(data);
      } else {
        setModels([
          { id: 'nova-ai', name: 'NOVA AI', badge: 'Default', description: 'Smart, balanced & versatile for everyday tasks' },
          { id: 'nova-ai-fast', name: 'NOVA AI Fast', badge: 'Lightning', description: 'Ultra-low latency for quick answers & summaries' },
          { id: 'nova-ai-reasoning', name: 'NOVA AI Reasoning', badge: 'Deep Think', description: 'Deep multi-step reasoning, coding & math' }
        ]);
      }
    }).catch(() => {
      setModels([
        { id: 'nova-ai', name: 'NOVA AI', badge: 'Default', description: 'Smart, balanced & versatile for everyday tasks' },
        { id: 'nova-ai-fast', name: 'NOVA AI Fast', badge: 'Lightning', description: 'Ultra-low latency for quick answers & summaries' },
        { id: 'nova-ai-reasoning', name: 'NOVA AI Reasoning', badge: 'Deep Think', description: 'Deep multi-step reasoning, coding & math' }
      ]);
    });
  }, []);

  const refreshConversations = async () => {
    try {
      const data = await api.getConversations(searchQuery);
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    refreshConversations();
  }, [user, searchQuery]);

  const selectConversation = async (id: string) => {
    if (activeConversation?.id === id) return;
    setLoadingHistory(true);
    setStreamingContent('');
    setIsGenerating(false);

    try {
      const conv = await api.getConversation(id);
      setActiveConversation(conv);
      setMessages(conv.messages || []);
      if (conv.model) setSelectedModel(conv.model);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewChat = () => {
    if (isGenerating) stopGeneration();
    setActiveConversation(null);
    setMessages([]);
    setStreamingContent('');
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    if (streamingContent.trim() && activeConversation) {
      const stoppedMsg: Message = {
        id: 'msg-' + Date.now(),
        conversation_id: activeConversation.id,
        role: 'assistant',
        content: streamingContent + ' *(Stopped by user)*',
        model: selectedModel,
        status: 'sent',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, stoppedMsg]);
      setStreamingContent('');
    }
  };

  const sendMessage = async (content: string, attachments: Attachment[] = []) => {
    if ((!content.trim() && attachments.length === 0) || isGenerating) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    setStreamingContent('');

    const tempUserMsgId = 'usr-' + Date.now();
    const optimisticUserMsg: Message = {
      id: tempUserMsgId,
      conversation_id: activeConversation?.id || 'temp',
      role: 'user',
      content,
      model: selectedModel,
      attachments,
      status: 'sending',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const authHeader = apiClient.defaults.headers.common['Authorization'] || 'Bearer demo-guest-token';
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader as string
        },
        body: JSON.stringify({
          conversation_id: activeConversation?.id,
          content,
          model: selectedModel,
          attachments
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Chat stream error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let serverConvId = activeConversation?.id;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const parsed = JSON.parse(jsonStr);

                if (parsed.type === 'init') {
                  serverConvId = parsed.conversation_id;
                  if (!activeConversation || activeConversation.id !== serverConvId) {
                    const newConv: Conversation = {
                      id: serverConvId || 'conv-' + Date.now(),
                      user_id: user?.id || 'guest',
                      title: content.slice(0, 36) + (content.length > 36 ? '...' : ''),
                      model: selectedModel,
                      temperature: 0.7,
                      is_pinned: false,
                      is_archived: false,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    };
                    setActiveConversation(newConv);
                    refreshConversations();
                  }
                } else if (parsed.type === 'complete') {
                  const completeMsg: Message = {
                    id: parsed.message_id || 'ai-' + Date.now(),
                    conversation_id: serverConvId || '',
                    role: 'assistant',
                    content: accumulated,
                    model: selectedModel,
                    tokens_used: parsed.tokens_used || Math.ceil(accumulated.length / 4),
                    status: 'sent',
                    created_at: new Date().toISOString()
                  };
                  setMessages(prev => [...prev, completeMsg]);
                  setStreamingContent('');
                  refreshConversations();
                } else if (parsed.chunk !== undefined) {
                  accumulated += parsed.chunk;
                  setStreamingContent(accumulated);
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Chat stream aborted by user');
      } else {
        console.error('Failed to stream chat completion:', err);
        const errorMsg: Message = {
          id: 'err-' + Date.now(),
          conversation_id: activeConversation?.id || '',
          role: 'assistant',
          content: '⚠️ An error occurred while generating the response. Please retry.',
          model: selectedModel,
          status: 'error',
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const regenerateMessage = async (messageId: string) => {
    if (!activeConversation || isGenerating) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsGenerating(true);
    setStreamingContent('');

    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex !== -1) {
      setMessages(prev => prev.slice(0, msgIndex));
    }

    try {
      const authHeader = apiClient.defaults.headers.common['Authorization'] || 'Bearer demo-guest-token';
      const response = await fetch('/api/chat/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader as string
        },
        body: JSON.stringify({
          conversation_id: activeConversation.id,
          message_id: messageId,
          model: selectedModel
        }),
        signal: controller.signal
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const textChunk = decoder.decode(value, { stream: true });
          const lines = textChunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (!jsonStr) continue;

              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === 'complete') {
                  const regenMsg: Message = {
                    id: parsed.message_id || 'ai-' + Date.now(),
                    conversation_id: activeConversation.id,
                    role: 'assistant',
                    content: accumulated,
                    model: selectedModel,
                    status: 'regenerated',
                    created_at: new Date().toISOString()
                  };
                  setMessages(prev => [...prev, regenMsg]);
                  setStreamingContent('');
                } else if (parsed.chunk !== undefined) {
                  accumulated += parsed.chunk;
                  setStreamingContent(accumulated);
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to regenerate:', err);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const editMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;
    try {
      await api.updateMessage(messageId, newContent);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent } : m));
      const msgIndex = messages.findIndex(m => m.id === messageId);
      if (msgIndex !== -1 && activeConversation) {
        setMessages(prev => prev.slice(0, msgIndex + 1));
        await regenerateMessage(messageId);
      }
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    try {
      await api.updateConversation(id, { title: newTitle });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
      if (activeConversation?.id === id) {
        setActiveConversation(prev => prev ? { ...prev, title: newTitle } : null);
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversation?.id === id) {
        startNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        models,
        selectedModel,
        isGenerating,
        streamingContent,
        searchQuery,
        loadingHistory,
        setSearchQuery,
        setSelectedModel,
        selectConversation,
        startNewChat,
        sendMessage,
        stopGeneration,
        regenerateMessage,
        editMessage,
        renameConversation,
        deleteConversation,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
