import { ChatCompletionOptions, ChatCompletionResponse, ConfigInstanceSummary, ConfigTemplate, InstanceCreationOptions, InstanceUpdatePayload, ModelConfig, ModelInfo, SupportedModel } from './types';
type ChatSelector = string | {
    instanceId?: string;
    modelId?: string;
};
export declare class LLMManager {
    private initializationPromise;
    private initialized;
    private configPath?;
    private models;
    private templates;
    private templateNameIndex;
    private instances;
    private currentInstanceId;
    private currentModelId;
    /**
     * 初始化 LLM Manager
     */
    init(configPath?: string): Promise<void>;
    private initializeInternal;
    private normalizeInstance;
    private createInstanceObject;
    private resolveModelAgainstTemplate;
    private resolveInstanceModel;
    private pickDefaultInstance;
    private ensureInitialized;
    private generateInstanceId;
    private persistInstances;
    private persistState;
    private toSummary;
    private getTemplateOrThrow;
    private getSupportedModel;
    private isModelSupportedByInstance;
    private resolveModelIdentifier;
    private buildProviderConfig;
    private applySecretUpdates;
    private resolveInvocationTarget;
    /**
     * 查询已支持的模型 ID 列表
     */
    listModels(): string[];
    /**
     * 获取模型详细信息列表
     */
    getModelsInfo(): ModelInfo[];
    /**
     * 获取全部支持的模型信息
     */
    getSupportedModels(): SupportedModel[];
    /**
     * 获取配置模板列表
     */
    getConfigTemplates(): ConfigTemplate[];
    /**
     * 根据模板创建新的配置实例
     */
    createInstanceFromTemplate(templateIdentifier: string, options?: InstanceCreationOptions): Promise<ConfigInstanceSummary>;
    /**
     * 获取全部配置实例
     */
    listInstances(): ConfigInstanceSummary[];
    /**
     * 获取指定配置实例
     */
    getInstance(instanceId: string): ConfigInstanceSummary | null;
    /**
     * 更新配置实例
     */
    updateInstance(instanceId: string, payload: InstanceUpdatePayload): Promise<ConfigInstanceSummary>;
    /**
     * 设置当前实例
     */
    setCurrentInstance(instanceId: string): Promise<void>;
    /**
     * 获取当前实例
     */
    getCurrentInstance(): ConfigInstanceSummary | null;
    /**
     * 获取当前实例 ID
     */
    getCurrentInstanceId(): string | null;
    /**
     * 获取当前实例支持的模型
     */
    getCurrentInstanceModels(): SupportedModel[];
    /**
     * 设置当前实例默认模型
     */
    setCurrentModel(modelId: string): Promise<void>;
    /**
     * 兼容旧接口
     */
    selectModel(modelId: string): Promise<void>;
    /**
     * 获取当前模型 ID
     */
    getCurrentModel(): string | null;
    /**
     * 获取模型配置（脱敏）
     */
    getModelConfig(modelId: string, instanceId?: string): Partial<ModelConfig> | null;
    /**
     * 统一对话接口
     */
    chat(options: ChatCompletionOptions, selector?: ChatSelector): Promise<ChatCompletionResponse | AsyncGenerator<string>>;
    /**
     * 简化的聊天接口（非流式）
     */
    chatSimple(message: string, selector?: ChatSelector): Promise<string>;
    /**
     * 简化的聊天接口（流式）
     */
    chatStream(message: string, selector?: ChatSelector): Promise<AsyncGenerator<string>>;
    private isAsyncGenerator;
    /**
     * 获取支持的提供商列表
     */
    getSupportedProviders(): string[];
    private resolveTemplateIdentifier;
}
export {};
//# sourceMappingURL=manager.d.ts.map