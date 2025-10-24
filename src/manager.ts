// src/manager.ts
import { randomUUID } from 'crypto';
import {
  ChatCompletionOptions,
  ChatCompletionResponse,
  ConfigInstance,
  ConfigInstanceSummary,
  ConfigTemplate,
  InstanceCreationOptions,
  InstanceUpdatePayload,
  ModelConfig,
  ModelInfo,
  SupportedModel,
} from './types';
import {
  loadSupportedModels,
  loadTemplates,
  loadInstances,
  saveInstances,
  loadState,
  saveState,
} from './config/loader';
import { resolveValue, setSecret, getSecret, deleteSecret } from './secrets';

// 动态导入所有 Provider
const PROVIDERS: Record<string, () => Promise<any>> = {
  openai: () => import('./providers/openai').then(m => m.OpenAIProvider),
  qwen: () => import('./providers/qwen').then(m => m.QwenProvider),
  zhipu: () => import('./providers/zhipu').then(m => m.ZhiPuProvider),
  moonshot: () => import('./providers/moonshot').then(m => m.MoonshotProvider),
  spark: () => import('./providers/spark').then(m => m.SparkProvider),
};

type ChatSelector = string | { instanceId?: string; modelId?: string };

type NormalizationResult = {
  instance: ConfigInstance;
  changed: boolean;
};

export class LLMManager {
  private initializationPromise: Promise<void> | null = null;
  private initialized = false;

  private models: Map<string, SupportedModel> = new Map();
  private templates: Map<string, ConfigTemplate> = new Map();
  private templateNameIndex: Map<string, string> = new Map();
  private instances: Map<string, ConfigInstance> = new Map();

  private currentInstanceId: string | null = null;
  private currentModelId: string | null = null;

  /**
   * 初始化 LLM Manager
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = this.initializeInternal();

    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async initializeInternal(): Promise<void> {
    const [models, templates, storedInstances, persistedState] = await Promise.all([
      loadSupportedModels(),
      loadTemplates(),
      loadInstances(),
      loadState(),
    ]);

    this.models.clear();
    models.forEach(model => {
      this.models.set(model.id, model);
    });

    this.templates.clear();
    this.templateNameIndex.clear();
    templates.forEach(template => {
      this.templates.set(template.id, template);
      this.templateNameIndex.set(template.name.toLowerCase(), template.id);
    });

    const instanceMap: Map<string, ConfigInstance> = new Map();
    let instancesChanged = false;

    for (const rawInstance of storedInstances) {
      const template = this.templates.get(rawInstance.templateId);
      if (!template) {
        instancesChanged = true;
        continue;
      }

      const { instance, changed } = this.normalizeInstance({ ...rawInstance }, template);
      instancesChanged = instancesChanged || changed;
      instanceMap.set(instance.id, instance);
    }

    for (const template of this.templates.values()) {
      const hasInstance = Array.from(instanceMap.values()).some(inst => inst.templateId === template.id);
      if (!hasInstance) {
        const defaultInstance = this.createInstanceObject(template, {
          id: `${template.id}-default`,
          name: template.defaultInstance?.name ?? `${template.name} 默认实例`,
          config: template.defaultInstance?.config,
          selectedModelId: template.defaultInstance?.selectedModelId,
          isDefault: true,
        });
        instanceMap.set(defaultInstance.id, defaultInstance);
        instancesChanged = true;
      }
    }

    this.instances = instanceMap;

    let stateChanged = false;
    const stateInstance = persistedState.currentInstanceId && this.instances.has(persistedState.currentInstanceId)
      ? this.instances.get(persistedState.currentInstanceId) ?? null
      : null;

    if (stateInstance) {
      this.currentInstanceId = stateInstance.id;
    } else {
      const fallback = this.pickDefaultInstance();
      this.currentInstanceId = fallback?.id ?? null;
      stateChanged = true;
    }

    const activeInstance = this.currentInstanceId ? this.instances.get(this.currentInstanceId) ?? null : null;

    if (activeInstance) {
      const resolvedModel = this.resolveInstanceModel(activeInstance);
      if (persistedState.currentModelId && this.isModelSupportedByInstance(activeInstance, persistedState.currentModelId)) {
        this.currentModelId = persistedState.currentModelId;
      } else {
        this.currentModelId = resolvedModel;
        stateChanged = true;
      }

      if (activeInstance.selectedModelId !== this.currentModelId) {
        activeInstance.selectedModelId = this.currentModelId ?? undefined;
        activeInstance.updatedAt = new Date().toISOString();
        instancesChanged = true;
      }
    } else {
      this.currentModelId = null;
    }

    if (instancesChanged) {
      await this.persistInstances();
    }

    if (stateChanged) {
      await this.persistState();
    }

    this.initialized = true;
  }

  private normalizeInstance(instance: ConfigInstance, template: ConfigTemplate): NormalizationResult {
    let changed = false;

    const config: Record<string, any> = {
      ...(instance.config ?? {}),
    };

    const secretKeys: Record<string, string> = {};

    if (instance.secretKeys) {
      for (const [key, value] of Object.entries(instance.secretKeys)) {
        if (typeof value === 'string' && value.trim().length > 0) {
          secretKeys[key] = value.startsWith('@secret:') ? value.slice(8) : value;
        }
      }
    }

    for (const field of template.secretFields) {
      if (config[field.key] && typeof config[field.key] === 'string' && String(config[field.key]).startsWith('@secret:')) {
        secretKeys[field.key] = String(config[field.key]).slice(8);
        delete config[field.key];
        changed = true;
      }

      if (!secretKeys[field.key]) {
        secretKeys[field.key] = `${instance.id}-${field.key}`;
        changed = true;
      }

      if (config[field.key] !== undefined) {
        delete config[field.key];
        changed = true;
      }
    }

    const defaultConfig = {
      ...template.defaultConfig,
      ...(template.defaultInstance?.config ?? {}),
    };

    for (const [key, value] of Object.entries(defaultConfig)) {
      if (config[key] === undefined) {
        config[key] = value;
        changed = true;
      }
    }

    const validModel = this.resolveModelAgainstTemplate(template, instance.selectedModelId);
    if (validModel !== instance.selectedModelId) {
      instance.selectedModelId = validModel ?? undefined;
      changed = true;
    }

    if (!instance.createdAt) {
      instance.createdAt = new Date().toISOString();
      changed = true;
    }

    if (!instance.updatedAt) {
      instance.updatedAt = instance.createdAt;
      changed = true;
    }

    const normalized: ConfigInstance = {
      ...instance,
      config,
      secretKeys,
      selectedModelId: instance.selectedModelId,
      isDefault: instance.isDefault ?? false,
    };

    return { instance: normalized, changed };
  }

  private createInstanceObject(
    template: ConfigTemplate,
    options: {
      id?: string;
      name?: string;
      config?: Record<string, any>;
      selectedModelId?: string;
      isDefault?: boolean;
    }
  ): ConfigInstance {
    if (!template.modelIds || template.modelIds.length === 0) {
      throw new Error(`Template ${template.name} (${template.id}) does not define any supported models`);
    }

    const id = options.id ?? this.generateInstanceId(template.id);
    const now = new Date().toISOString();

    const baseConfig: Record<string, any> = {
      ...template.defaultConfig,
      ...(template.defaultInstance?.config ?? {}),
      ...(options.config ?? {}),
    };

    for (const field of template.secretFields) {
      if (baseConfig[field.key] !== undefined) {
        delete baseConfig[field.key];
      }
    }

    const secretKeys: Record<string, string> = {};
    for (const field of template.secretFields) {
      secretKeys[field.key] = `${id}-${field.key}`;
    }

    const selectedModelId = this.resolveModelAgainstTemplate(template, options.selectedModelId) ?? template.modelIds[0];

    return {
      id,
      templateId: template.id,
      name: options.name ?? template.defaultInstance?.name ?? `${template.name} 实例`,
      config: baseConfig,
      secretKeys,
      selectedModelId,
      createdAt: now,
      updatedAt: now,
      isDefault: options.isDefault ?? false,
    };
  }

  private resolveModelAgainstTemplate(template: ConfigTemplate, modelId?: string | null): string | null {
    if (!template.modelIds || template.modelIds.length === 0) {
      return null;
    }

    if (modelId && template.modelIds.includes(modelId)) {
      return modelId;
    }

    return template.modelIds[0] ?? null;
  }

  private resolveInstanceModel(instance: ConfigInstance): string | null {
    const template = this.templates.get(instance.templateId);
    if (!template) {
      return null;
    }

    return this.resolveModelAgainstTemplate(template, instance.selectedModelId);
  }

  private pickDefaultInstance(): ConfigInstance | undefined {
    for (const instance of this.instances.values()) {
      if (instance.isDefault) {
        return instance;
      }
    }
    const iterator = this.instances.values().next();
    return iterator.done ? undefined : iterator.value;
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('LLMManager not initialized. Call init() first.');
    }
  }

  private generateInstanceId(templateId: string): string {
    if (typeof randomUUID === 'function') {
      return `${templateId}-${randomUUID()}`;
    }
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${templateId}-${Date.now().toString(36)}-${randomPart}`;
  }

  private async persistInstances(): Promise<void> {
    const orderedInstances = Array.from(this.instances.values()).sort((a, b) => {
      return a.createdAt.localeCompare(b.createdAt);
    });
    await saveInstances(orderedInstances);
  }

  private async persistState(): Promise<void> {
    await saveState({
      currentInstanceId: this.currentInstanceId,
      currentModelId: this.currentModelId,
    });
  }

  private toSummary(instance: ConfigInstance): ConfigInstanceSummary {
    const template = this.templates.get(instance.templateId);
    const exposedConfig: Record<string, any> = { ...instance.config };

    if (template) {
      for (const field of template.secretFields) {
        exposedConfig[field.key] = '[secure]';
      }
    }

    return {
      id: instance.id,
      templateId: instance.templateId,
      name: instance.name,
      config: exposedConfig,
      secretKeys: { ...instance.secretKeys },
      selectedModelId: instance.selectedModelId,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
      isDefault: instance.isDefault,
    };
  }

  private getTemplateOrThrow(templateId: string): ConfigTemplate {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }
    return template;
  }

  private getSupportedModel(modelId: string): SupportedModel {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }
    return model;
  }

  private isModelSupportedByInstance(instance: ConfigInstance, modelId: string): boolean {
    const template = this.templates.get(instance.templateId);
    return !!template && template.modelIds.includes(modelId);
  }

  private resolveModelIdentifier(instance: ConfigInstance, identifier: string): string {
    if (this.models.has(identifier)) {
      return identifier;
    }

    for (const model of this.models.values()) {
      if (model.model === identifier) {
        if (this.isModelSupportedByInstance(instance, model.id)) {
          return model.id;
        }
      }
    }

    throw new Error(`Model ${identifier} is not supported by instance ${instance.name}`);
  }

  private async buildProviderConfig(instance: ConfigInstance, modelId: string): Promise<ModelConfig> {
    const template = this.getTemplateOrThrow(instance.templateId);
    const supportedModel = this.getSupportedModel(modelId);

    if (!template.modelIds.includes(modelId)) {
      throw new Error(`Model ${modelId} is not supported by template ${template.name}`);
    }

    const baseConfig: Record<string, any> = {
      provider: template.provider,
      ...template.defaultConfig,
      ...instance.config,
    };

    baseConfig.model = supportedModel.model;

    for (const field of template.secretFields) {
      const secretKey = instance.secretKeys[field.key];
      if (!secretKey) {
        if (field.required) {
          throw new Error(`Missing secret mapping for field ${field.key} in instance ${instance.name}`);
        }
        continue;
      }
      const secretValue = await getSecret(secretKey);
      if (!secretValue) {
        if (field.required) {
          throw new Error(`Missing secret value for field ${field.key} in instance ${instance.name}`);
        }
        continue;
      }
      baseConfig[field.key] = secretValue;
    }

    for (const [key, value] of Object.entries(baseConfig)) {
      baseConfig[key] = await resolveValue(value);
    }

    return baseConfig as ModelConfig;
  }

  private async applySecretUpdates(template: ConfigTemplate, instance: ConfigInstance, secrets?: Record<string, string | null>): Promise<boolean> {
    if (!secrets) {
      return false;
    }

    let changed = false;

    for (const [key, value] of Object.entries(secrets)) {
      const field = template.secretFields.find(item => item.key === key);
      if (!field) {
        throw new Error(`Secret field ${key} is not defined for template ${template.name}`);
      }

      let secretKey = instance.secretKeys[key];
      if (!secretKey) {
        secretKey = `${instance.id}-${key}`;
        instance.secretKeys[key] = secretKey;
        changed = true;
      }

      if (value === null) {
        await deleteSecret(secretKey);
        changed = true;
        continue;
      }

      if (value.startsWith && value.startsWith('@secret:')) {
        instance.secretKeys[key] = value.slice(8);
        changed = true;
        continue;
      }

      await setSecret(secretKey, value);
      changed = true;
    }

    if (changed) {
      instance.updatedAt = new Date().toISOString();
    }

    return changed;
  }

  private async resolveInvocationTarget(selector?: ChatSelector): Promise<{ instance: ConfigInstance; modelId: string }> {
    this.ensureInitialized();

    let instanceId = this.currentInstanceId;
    let modelId: string | undefined;

    if (typeof selector === 'string') {
      modelId = selector;
    } else if (selector) {
      if (selector.instanceId) {
        instanceId = selector.instanceId;
      }
      if (selector.modelId) {
        modelId = selector.modelId;
      }
    }

    if (!instanceId) {
      throw new Error('No configuration instance selected. Use setCurrentInstance() to select one.');
    }

    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Configuration instance ${instanceId} not found`);
    }

    const template = this.getTemplateOrThrow(instance.templateId);

    let finalModelId: string | null;
    if (modelId) {
      finalModelId = this.resolveModelIdentifier(instance, modelId);
    } else {
      finalModelId = this.currentModelId ?? instance.selectedModelId ?? this.resolveInstanceModel(instance);
    }

    if (!finalModelId) {
      throw new Error(`No model selected for instance ${instance.name}`);
    }

    if (!template.modelIds.includes(finalModelId)) {
      throw new Error(`Model ${finalModelId} is not available for instance ${instance.name}`);
    }

    return { instance, modelId: finalModelId };
  }

  /**
   * 查询已支持的模型 ID 列表
   */
  listModels(): string[] {
    this.ensureInitialized();
    return Array.from(this.models.keys());
  }

  /**
   * 获取模型详细信息列表
   */
  getModelsInfo(): ModelInfo[] {
    this.ensureInitialized();
    return Array.from(this.models.values());
  }

  /**
   * 获取全部支持的模型信息
   */
  getSupportedModels(): SupportedModel[] {
    return this.getModelsInfo();
  }

  /**
   * 获取配置模板列表
   */
  getConfigTemplates(): ConfigTemplate[] {
    this.ensureInitialized();
    return Array.from(this.templates.values()).map(template => ({ ...template }));
  }

  /**
   * 根据模板创建新的配置实例
   */
  async createInstanceFromTemplate(templateIdentifier: string, options?: InstanceCreationOptions): Promise<ConfigInstanceSummary> {
    this.ensureInitialized();

    const template = this.resolveTemplateIdentifier(templateIdentifier);
    if (!template) {
      throw new Error(`Template not found: ${templateIdentifier}`);
    }

    const instance = this.createInstanceObject(template, {
      name: options?.name,
      config: options?.config,
      selectedModelId: options?.selectedModelId,
      isDefault: false,
    });

    await this.applySecretUpdates(template, instance, options?.secrets ?? {});

    this.instances.set(instance.id, instance);
    await this.persistInstances();

    if (!this.currentInstanceId) {
      this.currentInstanceId = instance.id;
      this.currentModelId = instance.selectedModelId ?? null;
      await this.persistState();
    }

    return this.toSummary(instance);
  }

  /**
   * 获取全部配置实例
   */
  listInstances(): ConfigInstanceSummary[] {
    this.ensureInitialized();
    return Array.from(this.instances.values()).map(instance => this.toSummary(instance));
  }

  /**
   * 获取指定配置实例
   */
  getInstance(instanceId: string): ConfigInstanceSummary | null {
    this.ensureInitialized();
    const instance = this.instances.get(instanceId);
    return instance ? this.toSummary(instance) : null;
  }

  /**
   * 更新配置实例
   */
  async updateInstance(instanceId: string, payload: InstanceUpdatePayload): Promise<ConfigInstanceSummary> {
    this.ensureInitialized();

    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Configuration instance ${instanceId} not found`);
    }

    const template = this.getTemplateOrThrow(instance.templateId);
    let modified = false;

    if (payload.name && payload.name !== instance.name) {
      instance.name = payload.name;
      modified = true;
    }

    if (payload.config) {
      for (const [key, value] of Object.entries(payload.config)) {
        if (template.secretFields.some(field => field.key === key)) {
          continue;
        }

        if (value === null) {
          if (key in instance.config) {
            delete instance.config[key];
            modified = true;
          }
          continue;
        }

        if (value !== undefined && instance.config[key] !== value) {
          instance.config[key] = value;
          modified = true;
        }
      }
    }

    if (payload.selectedModelId) {
      const modelId = this.resolveModelIdentifier(instance, payload.selectedModelId);
      if (instance.selectedModelId !== modelId) {
        instance.selectedModelId = modelId;
        modified = true;
        if (this.currentInstanceId === instance.id) {
          this.currentModelId = modelId;
        }
      }
    }

    const secretsChanged = await this.applySecretUpdates(template, instance, payload.secrets);
    modified = modified || secretsChanged;

    if (modified) {
      instance.updatedAt = new Date().toISOString();
      this.instances.set(instance.id, instance);
      await this.persistInstances();

      if (this.currentInstanceId === instance.id) {
        await this.persistState();
      }
    }

    return this.toSummary(instance);
  }

  /**
   * 设置当前实例
   */
  async setCurrentInstance(instanceId: string): Promise<void> {
    this.ensureInitialized();

    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Configuration instance ${instanceId} not found`);
    }

    this.currentInstanceId = instanceId;

    const resolvedModel = this.resolveInstanceModel(instance);
    if (resolvedModel) {
      this.currentModelId = resolvedModel;
      if (instance.selectedModelId !== resolvedModel) {
        instance.selectedModelId = resolvedModel;
        instance.updatedAt = new Date().toISOString();
        this.instances.set(instance.id, instance);
        await this.persistInstances();
      }
    } else {
      this.currentModelId = null;
    }

    await this.persistState();
  }

  /**
   * 获取当前实例
   */
  getCurrentInstance(): ConfigInstanceSummary | null {
    this.ensureInitialized();
    if (!this.currentInstanceId) {
      return null;
    }
    const instance = this.instances.get(this.currentInstanceId);
    return instance ? this.toSummary(instance) : null;
  }

  /**
   * 获取当前实例 ID
   */
  getCurrentInstanceId(): string | null {
    return this.currentInstanceId;
  }

  /**
   * 获取当前实例支持的模型
   */
  getCurrentInstanceModels(): SupportedModel[] {
    this.ensureInitialized();
    if (!this.currentInstanceId) {
      return [];
    }
    const instance = this.instances.get(this.currentInstanceId);
    if (!instance) {
      return [];
    }
    const template = this.getTemplateOrThrow(instance.templateId);
    return template.modelIds.map(modelId => this.getSupportedModel(modelId));
  }

  /**
   * 设置当前实例默认模型
   */
  async setCurrentModel(modelId: string): Promise<void> {
    this.ensureInitialized();

    if (!this.currentInstanceId) {
      throw new Error('No configuration instance selected');
    }

    const instance = this.instances.get(this.currentInstanceId);
    if (!instance) {
      throw new Error(`Configuration instance ${this.currentInstanceId} not found`);
    }

    const resolvedModelId = this.resolveModelIdentifier(instance, modelId);

    if (instance.selectedModelId !== resolvedModelId) {
      instance.selectedModelId = resolvedModelId;
      instance.updatedAt = new Date().toISOString();
      this.instances.set(instance.id, instance);
      await this.persistInstances();
    }

    this.currentModelId = resolvedModelId;
    await this.persistState();
  }

  /**
   * 兼容旧接口
   */
  async selectModel(modelId: string): Promise<void> {
    await this.setCurrentModel(modelId);
  }

  /**
   * 获取当前模型 ID
   */
  getCurrentModel(): string | null {
    return this.currentModelId;
  }

  /**
   * 获取模型配置（脱敏）
   */
  getModelConfig(modelId: string, instanceId?: string): Partial<ModelConfig> | null {
    this.ensureInitialized();

    const targetInstance = instanceId ? this.instances.get(instanceId) : (this.currentInstanceId ? this.instances.get(this.currentInstanceId)! : null);
    if (!targetInstance) {
      return null;
    }

    const template = this.getTemplateOrThrow(targetInstance.templateId);
    const resolvedModelId = this.resolveModelIdentifier(targetInstance, modelId);

    if (!template.modelIds.includes(resolvedModelId)) {
      return null;
    }

    const supportedModel = this.getSupportedModel(resolvedModelId);

    const config: Partial<ModelConfig> = {
      provider: template.provider,
      model: supportedModel.model,
      ...template.defaultConfig,
      ...targetInstance.config,
    };

    for (const field of template.secretFields) {
      config[field.key] = '[secure]' as any;
    }

    return config;
  }

  /**
   * 统一对话接口
   */
  async chat(
    options: ChatCompletionOptions,
    selector?: ChatSelector
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    const { instance, modelId } = await this.resolveInvocationTarget(selector);
    const template = this.getTemplateOrThrow(instance.templateId);
    const config = await this.buildProviderConfig(instance, modelId);

    const providerLoader = PROVIDERS[template.provider];
    if (!providerLoader) {
      throw new Error(`Provider ${template.provider} is not implemented`);
    }

    const ProviderClass = await providerLoader();
    const provider = new ProviderClass(config);

    return provider.chatCompletion(options);
  }

  /**
   * 简化的聊天接口（非流式）
   */
  async chatSimple(message: string, selector?: ChatSelector): Promise<string> {
    const response = await this.chat(
      {
        messages: [{ role: 'user', content: message }],
        stream: false,
      },
      selector
    );

    if (this.isAsyncGenerator(response)) {
      throw new Error('Unexpected stream response in chatSimple');
    }

    return response.content;
  }

  /**
   * 简化的聊天接口（流式）
   */
  async chatStream(message: string, selector?: ChatSelector): Promise<AsyncGenerator<string>> {
    const response = await this.chat(
      {
        messages: [{ role: 'user', content: message }],
        stream: true,
      },
      selector
    );

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

  private resolveTemplateIdentifier(identifier: string): ConfigTemplate | null {
    if (this.templates.has(identifier)) {
      return this.templates.get(identifier)!;
    }
    const key = identifier.toLowerCase();
    const matchedId = this.templateNameIndex.get(key);
    return matchedId ? this.templates.get(matchedId) ?? null : null;
  }
}
