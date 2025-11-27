"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMManager = void 0;
// src/manager.ts
const crypto_1 = require("crypto");
const path = __importStar(require("path"));
const loader_1 = require("./config/loader");
const secrets_1 = require("./secrets");
// 动态导入所有 Provider
const PROVIDERS = {
    openai: () => Promise.resolve().then(() => __importStar(require('./providers/openai'))).then(m => m.OpenAIProvider),
    qwen: () => Promise.resolve().then(() => __importStar(require('./providers/qwen'))).then(m => m.QwenProvider),
    zhipu: () => Promise.resolve().then(() => __importStar(require('./providers/zhipu'))).then(m => m.ZhiPuProvider),
    moonshot: () => Promise.resolve().then(() => __importStar(require('./providers/moonshot'))).then(m => m.MoonshotProvider),
    spark: () => Promise.resolve().then(() => __importStar(require('./providers/spark'))).then(m => m.SparkProvider),
};
class LLMManager {
    constructor() {
        this.initializationPromise = null;
        this.initialized = false;
        this.models = new Map();
        this.templates = new Map();
        this.templateNameIndex = new Map();
        this.instances = new Map();
        this.currentInstanceId = null;
        this.currentModelId = null;
    }
    /**
     * 初始化 LLM Manager
     */
    async init(configPath) {
        const normalizedConfigPath = configPath ? path.resolve(configPath) : undefined;
        const ensureConfigPathMatches = () => {
            if (!normalizedConfigPath) {
                return;
            }
            if (this.configPath && this.configPath !== normalizedConfigPath) {
                throw new Error(`LLMManager has already been initialized with a different configuration path: ${this.configPath}`);
            }
            if (!this.configPath && this.initialized) {
                throw new Error('LLMManager has already been initialized with the default configuration path. Recreate the manager to use a custom configuration path.');
            }
        };
        if (this.initialized) {
            ensureConfigPathMatches();
            return;
        }
        if (this.initializationPromise) {
            await this.initializationPromise;
            ensureConfigPathMatches();
            return;
        }
        this.initializationPromise = this.initializeInternal(normalizedConfigPath);
        try {
            await this.initializationPromise;
        }
        finally {
            this.initializationPromise = null;
        }
    }
    async initializeInternal(configPath) {
        const [models, templates, storedInstances, persistedState] = await Promise.all([
            (0, loader_1.loadSupportedModels)(configPath),
            (0, loader_1.loadTemplates)(configPath),
            (0, loader_1.loadInstances)(),
            (0, loader_1.loadState)(),
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
        const instanceMap = new Map();
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
        }
        else {
            const fallback = this.pickDefaultInstance();
            this.currentInstanceId = fallback?.id ?? null;
            stateChanged = true;
        }
        const activeInstance = this.currentInstanceId ? this.instances.get(this.currentInstanceId) ?? null : null;
        if (activeInstance) {
            const resolvedModel = this.resolveInstanceModel(activeInstance);
            if (persistedState.currentModelId && this.isModelSupportedByInstance(activeInstance, persistedState.currentModelId)) {
                this.currentModelId = persistedState.currentModelId;
            }
            else {
                this.currentModelId = resolvedModel;
                stateChanged = true;
            }
            if (activeInstance.selectedModelId !== this.currentModelId) {
                activeInstance.selectedModelId = this.currentModelId ?? undefined;
                activeInstance.updatedAt = new Date().toISOString();
                instancesChanged = true;
            }
        }
        else {
            this.currentModelId = null;
        }
        if (instancesChanged) {
            await this.persistInstances();
        }
        if (stateChanged) {
            await this.persistState();
        }
        this.configPath = configPath;
        this.initialized = true;
    }
    normalizeInstance(instance, template) {
        let changed = false;
        const config = {
            ...(instance.config ?? {}),
        };
        const secretKeys = {};
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
        const normalized = {
            ...instance,
            config,
            secretKeys,
            selectedModelId: instance.selectedModelId,
            isDefault: instance.isDefault ?? false,
        };
        return { instance: normalized, changed };
    }
    createInstanceObject(template, options) {
        if (!template.modelIds || template.modelIds.length === 0) {
            throw new Error(`Template ${template.name} (${template.id}) does not define any supported models`);
        }
        const id = options.id ?? this.generateInstanceId(template.id);
        const now = new Date().toISOString();
        const baseConfig = {
            ...template.defaultConfig,
            ...(template.defaultInstance?.config ?? {}),
            ...(options.config ?? {}),
        };
        for (const field of template.secretFields) {
            if (baseConfig[field.key] !== undefined) {
                delete baseConfig[field.key];
            }
        }
        const secretKeys = {};
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
    resolveModelAgainstTemplate(template, modelId) {
        if (!template.modelIds || template.modelIds.length === 0) {
            return null;
        }
        if (modelId && template.modelIds.includes(modelId)) {
            return modelId;
        }
        return template.modelIds[0] ?? null;
    }
    resolveInstanceModel(instance) {
        const template = this.templates.get(instance.templateId);
        if (!template) {
            return null;
        }
        return this.resolveModelAgainstTemplate(template, instance.selectedModelId);
    }
    pickDefaultInstance() {
        for (const instance of this.instances.values()) {
            if (instance.isDefault) {
                return instance;
            }
        }
        const iterator = this.instances.values().next();
        return iterator.done ? undefined : iterator.value;
    }
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('LLMManager not initialized. Call init() first.');
        }
    }
    generateInstanceId(templateId) {
        if (typeof crypto_1.randomUUID === 'function') {
            return `${templateId}-${(0, crypto_1.randomUUID)()}`;
        }
        const randomPart = Math.random().toString(36).slice(2, 10);
        return `${templateId}-${Date.now().toString(36)}-${randomPart}`;
    }
    async persistInstances() {
        const orderedInstances = Array.from(this.instances.values()).sort((a, b) => {
            return a.createdAt.localeCompare(b.createdAt);
        });
        await (0, loader_1.saveInstances)(orderedInstances);
    }
    async persistState() {
        await (0, loader_1.saveState)({
            currentInstanceId: this.currentInstanceId,
            currentModelId: this.currentModelId,
        });
    }
    toSummary(instance) {
        const template = this.templates.get(instance.templateId);
        const exposedConfig = { ...instance.config };
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
    getTemplateOrThrow(templateId) {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }
        return template;
    }
    getSupportedModel(modelId) {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error(`Model not found: ${modelId}`);
        }
        return model;
    }
    isModelSupportedByInstance(instance, modelId) {
        const template = this.templates.get(instance.templateId);
        return !!template && template.modelIds.includes(modelId);
    }
    resolveModelIdentifier(instance, identifier) {
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
    async buildProviderConfig(instance, modelId) {
        const template = this.getTemplateOrThrow(instance.templateId);
        const supportedModel = this.getSupportedModel(modelId);
        if (!template.modelIds.includes(modelId)) {
            throw new Error(`Model ${modelId} is not supported by template ${template.name}`);
        }
        const baseConfig = {
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
            const secretValue = await (0, secrets_1.getSecret)(secretKey);
            if (!secretValue) {
                if (field.required) {
                    throw new Error(`Missing secret value for field ${field.key} in instance ${instance.name}`);
                }
                continue;
            }
            baseConfig[field.key] = secretValue;
        }
        for (const [key, value] of Object.entries(baseConfig)) {
            baseConfig[key] = await (0, secrets_1.resolveValue)(value);
        }
        return baseConfig;
    }
    async applySecretUpdates(template, instance, secrets) {
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
                await (0, secrets_1.deleteSecret)(secretKey);
                changed = true;
                continue;
            }
            if (value.startsWith && value.startsWith('@secret:')) {
                instance.secretKeys[key] = value.slice(8);
                changed = true;
                continue;
            }
            await (0, secrets_1.setSecret)(secretKey, value);
            changed = true;
        }
        if (changed) {
            instance.updatedAt = new Date().toISOString();
        }
        return changed;
    }
    async resolveInvocationTarget(selector) {
        this.ensureInitialized();
        let instanceId = this.currentInstanceId;
        let modelId;
        if (typeof selector === 'string') {
            modelId = selector;
        }
        else if (selector) {
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
        let finalModelId;
        if (modelId) {
            finalModelId = this.resolveModelIdentifier(instance, modelId);
        }
        else {
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
    listModels() {
        this.ensureInitialized();
        return Array.from(this.models.keys());
    }
    /**
     * 获取模型详细信息列表
     */
    getModelsInfo() {
        this.ensureInitialized();
        return Array.from(this.models.values());
    }
    /**
     * 获取全部支持的模型信息
     */
    getSupportedModels() {
        return this.getModelsInfo();
    }
    /**
     * 获取配置模板列表
     */
    getConfigTemplates() {
        this.ensureInitialized();
        return Array.from(this.templates.values()).map(template => ({ ...template }));
    }
    /**
     * 根据模板创建新的配置实例
     */
    async createInstanceFromTemplate(templateIdentifier, options) {
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
    listInstances() {
        this.ensureInitialized();
        return Array.from(this.instances.values()).map(instance => this.toSummary(instance));
    }
    /**
     * 获取指定配置实例
     */
    getInstance(instanceId) {
        this.ensureInitialized();
        const instance = this.instances.get(instanceId);
        return instance ? this.toSummary(instance) : null;
    }
    /**
     * 更新配置实例
     */
    async updateInstance(instanceId, payload) {
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
    async setCurrentInstance(instanceId) {
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
        }
        else {
            this.currentModelId = null;
        }
        await this.persistState();
    }
    /**
     * 获取当前实例
     */
    getCurrentInstance() {
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
    getCurrentInstanceId() {
        return this.currentInstanceId;
    }
    /**
     * 获取当前实例支持的模型
     */
    getCurrentInstanceModels() {
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
    async setCurrentModel(modelId) {
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
    async selectModel(modelId) {
        await this.setCurrentModel(modelId);
    }
    /**
     * 获取当前模型 ID
     */
    getCurrentModel() {
        return this.currentModelId;
    }
    /**
     * 获取模型配置（脱敏）
     */
    getModelConfig(modelId, instanceId) {
        this.ensureInitialized();
        const targetInstance = instanceId ? this.instances.get(instanceId) : (this.currentInstanceId ? this.instances.get(this.currentInstanceId) : null);
        if (!targetInstance) {
            return null;
        }
        const template = this.getTemplateOrThrow(targetInstance.templateId);
        const resolvedModelId = this.resolveModelIdentifier(targetInstance, modelId);
        if (!template.modelIds.includes(resolvedModelId)) {
            return null;
        }
        const supportedModel = this.getSupportedModel(resolvedModelId);
        const config = {
            provider: template.provider,
            model: supportedModel.model,
            ...template.defaultConfig,
            ...targetInstance.config,
        };
        for (const field of template.secretFields) {
            config[field.key] = '[secure]';
        }
        return config;
    }
    /**
     * 统一对话接口
     */
    async chat(options, selector) {
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
    async chatSimple(message, selector) {
        const response = await this.chat({
            messages: [{ role: 'user', content: message }],
            stream: false,
        }, selector);
        if (this.isAsyncGenerator(response)) {
            throw new Error('Unexpected stream response in chatSimple');
        }
        return response.content;
    }
    /**
     * 简化的聊天接口（流式）
     */
    async chatStream(message, selector) {
        const response = await this.chat({
            messages: [{ role: 'user', content: message }],
            stream: true,
        }, selector);
        if (!this.isAsyncGenerator(response)) {
            throw new Error('Expected stream response in chatStream');
        }
        return response;
    }
    isAsyncGenerator(obj) {
        return obj && typeof obj.next === 'function' && typeof obj[Symbol.asyncIterator] === 'function';
    }
    /**
     * 获取支持的提供商列表
     */
    getSupportedProviders() {
        return Object.keys(PROVIDERS);
    }
    resolveTemplateIdentifier(identifier) {
        if (this.templates.has(identifier)) {
            return this.templates.get(identifier);
        }
        const key = identifier.toLowerCase();
        const matchedId = this.templateNameIndex.get(key);
        return matchedId ? this.templates.get(matchedId) ?? null : null;
    }
}
exports.LLMManager = LLMManager;
//# sourceMappingURL=manager.js.map