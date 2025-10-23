// src/manager.ts
import { ModelConfig, ChatCompletionOptions, ModelInfo, LLMConfig, ChatCompletionResponse } from './types';
import { loadConfig } from './config/loader';
import { resolveValue } from './secrets';

// 动态导入所有 Provider
const PROVIDERS: Record<string, any> = {
  openai: () => import('./providers/openai').then(m => m.OpenAIProvider),
  qwen: () => import('./providers/qwen').then(m => m.QwenProvider),
  zhipu: () => import('./providers/zhipu').then(m => m.ZhiPuProvider),
  moonshot: () => import('./providers/moonshot').then(m => m.MoonshotProvider),
  spark: () => import('./providers/spark').then(m => m.SparkProvider),
};

export class LLMManager {
  private config: LLMConfig | null = null;
  private resolvedConfigs: Record<string, ModelConfig> = {};
  private currentModel: string | null = null;
  private initialized = false;

  /**
   * 初始化 LLM Manager
   * @param configPath 配置文件路径（可选）
   */
  async init(configPath?: string): Promise<void> {
    this.config = await loadConfig(configPath);
    
    // 预解析所有配置（替换 @secret）
    for (const [name, config] of Object.entries(this.config.models)) {
      const resolved: any = {};
      for (const [k, v] of Object.entries(config as any)) {
        resolved[k] = await resolveValue(v);
      }
      this.resolvedConfigs[name] = resolved;
    }

    // 设置默认模型
    if (this.config.default_model && this.resolvedConfigs[this.config.default_model]) {
      this.currentModel = this.config.default_model;
    }

    this.initialized = true;
  }

  /**
   * 确保已初始化
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new Error('LLMManager not initialized. Call init() first.');
    }
  }

  /**
   * 查询已支持的模型列表
   */
  listModels(): string[] {
    this.ensureInitialized();
    return Object.keys(this.config!.models);
  }

  /**
   * 获取模型详细信息列表
   */
  getModelsInfo(): ModelInfo[] {
    this.ensureInitialized();
    return Object.entries(this.config!.models).map(([name, config]) => ({
      name,
      provider: config.provider,
      model: config.model,
    }));
  }

  /**
   * 查询某个模型的配置（脱敏后）
   */
  getModelConfig(modelName: string): Partial<ModelConfig> | null {
    this.ensureInitialized();
    const raw = this.config!.models[modelName];
    if (!raw) return null;
    
    // 返回时不包含敏感字段值，只保留 key 名
    const safeConfig: any = { ...raw };
    for (const k in safeConfig) {
      if (String(safeConfig[k]).startsWith('@secret:')) {
        safeConfig[k] = '[secure]';
      }
    }
    return safeConfig;
  }

  /**
   * 选择当前使用的模型
   */
  selectModel(modelName: string): void {
    this.ensureInitialized();
    if (!this.resolvedConfigs[modelName]) {
      throw new Error(`Model ${modelName} not found in config`);
    }
    this.currentModel = modelName;
  }

  /**
   * 获取当前选择的模型
   */
  getCurrentModel(): string | null {
    return this.currentModel;
  }

  /**
   * 统一对话接口
   * @param options 对话选项
   * @param modelName 模型名称（可选，不提供则使用当前选择的模型）
   */
  async chat(
    options: ChatCompletionOptions,
    modelName?: string
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    this.ensureInitialized();
    
    const targetModel = modelName || this.currentModel;
    if (!targetModel) {
      throw new Error('No model selected. Call selectModel() or provide modelName parameter.');
    }

    const config = this.resolvedConfigs[targetModel];
    if (!config) throw new Error(`Model ${targetModel} not found`);

    const ProviderClass = await PROVIDERS[config.provider]();
    const provider = new ProviderClass(config);
    
    return provider.chatCompletion(options);
  }

  /**
   * 简化的聊天接口（非流式）
   */
  async chatSimple(message: string, modelName?: string): Promise<string> {
    const response = await this.chat({
      messages: [{ role: 'user', content: message }],
      stream: false,
    }, modelName);

    if (this.isAsyncGenerator(response)) {
      throw new Error('Unexpected stream response in chatSimple');
    }

    return response.content;
  }

  /**
   * 简化的聊天接口（流式）
   */
  async chatStream(message: string, modelName?: string): Promise<AsyncGenerator<string>> {
    const response = await this.chat({
      messages: [{ role: 'user', content: message }],
      stream: true,
    }, modelName);

    if (!this.isAsyncGenerator(response)) {
      throw new Error('Expected stream response in chatStream');
    }

    return response;
  }

  private isAsyncGenerator(obj: any): obj is AsyncGenerator<string> {
    return obj && typeof obj.next === 'function' && typeof obj[Symbol.asyncIterator] === 'function';
  }

  /**
   * 获取支持的提供商列表
   */
  getSupportedProviders(): string[] {
    return Object.keys(PROVIDERS);
  }
}