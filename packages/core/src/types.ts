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
  timeout?: number;
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface SupportedModel {
  id: string;
  name: string;
  provider: string;
  model: string;
  description?: string;
  parameters: Record<string, any>;
  dataFormats: {
    input: string[];
    output: string[];
  };
}

export type ModelInfo = SupportedModel;

export interface TemplateSecretField {
  key: string;
  label?: string;
  description?: string;
  required?: boolean;
}

export interface TemplateDefaultInstance {
  name: string;
  config?: Record<string, any>;
  selectedModelId?: string;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  provider: string;
  description?: string;
  modelIds: string[];
  defaultConfig: Record<string, any>;
  secretFields: TemplateSecretField[];
  defaultInstance?: TemplateDefaultInstance;
}

export interface ConfigInstance {
  id: string;
  templateId: string;
  name: string;
  config: Record<string, any>;
  secretKeys: Record<string, string>;
  selectedModelId?: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface ConfigInstanceSummary {
  id: string;
  templateId: string;
  name: string;
  config: Record<string, any>;
  secretKeys: Record<string, string>;
  selectedModelId?: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface ManagerState {
  currentInstanceId: string | null;
  currentModelId: string | null;
}

export interface InstanceCreationOptions {
  name?: string;
  config?: Record<string, any>;
  secrets?: Record<string, string>;
  selectedModelId?: string;
}

export interface InstanceUpdatePayload {
  name?: string;
  config?: Record<string, any>;
  secrets?: Record<string, string | null>;
  selectedModelId?: string;
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
