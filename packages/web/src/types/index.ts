export interface ConfigInstance {
  id: string;
  templateId: string;
  name: string;
  config: Record<string, any>;
  secretKeys: Record<string, string>;
  selectedModelId?: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
}

export interface ConfigTemplate {
  id: string;
  name: string;
  provider: string;
  modelIds: string[];
  defaultConfig: Record<string, any>;
  secretFields: SecretField[];
  configFields: ConfigField[];
  defaultInstance?: {
    name: string;
    config?: Record<string, any>;
    selectedModelId?: string;
  };
}

export interface SecretField {
  key: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  default?: any;
  description?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  model: string;
  description: string;
  parameters: {
    maxInputTokens: number;
    maxOutputTokens: number;
    supportsStreaming: boolean;
    temperatureRange: [number, number];
    defaultTemperature: number;
  };
  dataFormats: {
    input: string[];
    output: string[];
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionResponse {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
