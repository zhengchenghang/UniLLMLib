// src/types.ts
export interface ModelConfig {
  provider: string;
  model: string;
  api_key?: string;
  base_url?: string;
  access_key_id?: string;
  access_key_secret?: string;
  app_id?: string;
  api_secret?: string;
  [key: string]: any;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}

export interface MessageContent {
  type: 'text' | 'image_url' | 'file';
  text?: string;
  image_url?: string;
  file_url?: string;
}

export interface ChatCompletionOptions {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  [key: string]: any;
}

export interface ChatCompletionResponse {
  content: string;
  role: 'assistant';
  finish_reason?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMConfig {
  models: Record<string, ModelConfig>;
  default_model?: string;
  debug?: boolean;
}

export interface ModelInfo {
  name: string;
  provider: string;
  model: string;
}