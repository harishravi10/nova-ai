export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error' | 'regenerated';

export interface Attachment {
  id?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path?: string;
  public_url?: string;
  extracted_text?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  model?: string;
  tokens_used?: number;
  status: MessageStatus;
  parent_message_id?: string;
  attachments?: Attachment[];
  created_at: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  model: string;
  system_prompt?: string;
  temperature: number;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  messages?: Message[];
  messages_count?: number;
  last_message?: string;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
}

export interface UserSettings {
  default_model: string;
  theme: 'dark' | 'light' | 'oled';
  temperature: number;
  system_prompt: string;
  stream_response: boolean;
  send_on_enter: boolean;
}

export interface UsageStat {
  date: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  messages_count: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  is_guest?: boolean;
}
