# UniLLM-TS

> 统一的 TypeScript LLM 调用库，支持多个主流大语言模型提供商

[![npm version](https://img.shields.io/npm/v/unillm-ts.svg)](https://www.npmjs.com/package/unillm-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 特性

- 🚀 **轻量级**：无 UI，不依赖外部服务
- 🔄 **统一接口**：提供一致的对话调用方式
- 🔌 **可扩展**：支持文本对话，后续可扩展其他数据格式
- 🔒 **安全存储**：支持加密存储 API Key（使用 keytar）
- 📦 **易集成**：作为 npm 包，一行代码引入
- ⚙️ **配置管理**：通过模板与实例管理 API Key、模型、超参等

## 目前计划支持的提供商

- [ ] OpenAI (GPT-4, GPT-3.5, etc.)
- [ ] Google（Gemini）
- [ ] 阿里云通义千问 (Qwen)
- [ ] 智谱 AI (GLM-4)
- [ ] Moonshot AI (Kimi)
- [ ] 讯飞星火 (需要 WebSocket 实现)

## Roadmap
- [ ] 完善架构设计，提供完善的管理、访问接口
- [ ] 保证访问的稳定性、安全性
- [ ] 完善对提供方的接入
- [ ] 支持更多提供商（如百度文心一言、微软 Azure OpenAI 等）
- [ ] 支持更灵活的API配置、选择和调用方式
- [ ] 增加更多示例和文档
- [ ] 支持多模态输入（图片、音频等）
- [ ] 支持MCP

## 安装

```bash
npm install unillm-ts
```

## 快速开始

### 1. 配置 API Keys

首先，使用安全存储设置您的 API Keys：

```typescript
import { setSecret } from 'unillm-ts';

// 存储 API Keys
await setSecret('openai-default-api_key', 'your-openai-key');
await setSecret('qwen-default-api_key', 'your-qwen-key');
await setSecret('zhipu-default-api_key', 'your-zhipu-key');
// 根据模板需求，部分提供商还需要额外字段，例如：
// await setSecret('qwen-default-access_key_id', 'your-aliyun-ak');
// await setSecret('qwen-default-access_key_secret', 'your-aliyun-sk');
```

### 2. 查看模板与实例

UniLLM-TS 内置所有支持的模型、配置模板以及基于模板生成的默认实例。初始化后可以查看并管理这些实例：

```typescript
import llmManager from 'unillm-ts';

await llmManager.init();

const templates = llmManager.getConfigTemplates();
const instances = llmManager.listInstances();

console.log('Templates:', templates.map(t => ({ id: t.id, models: t.modelIds })));
console.log('Instances:', instances.map(inst => ({
  id: inst.id,
  template: inst.templateId,
  secretKeys: inst.secretKeys,
})));
```

每个实例都会给出需要配置的 `secretKeys`（例如 `qwen-default-api_key`）。使用 `setSecret` 写入真实值后即可调用对应提供方。

### 3. 使用单例模式（推荐）

```typescript
import llmManager from 'unillm-ts';

// 初始化
await llmManager.init();

// 选择实例与模型
const instances = llmManager.listInstances();
const current = instances.find(inst => inst.templateId === 'qwen') ?? instances[0];
if (!current) {
  throw new Error('未找到可用的配置实例');
}
await llmManager.setCurrentInstance(current.id);
await llmManager.setCurrentModel('qwen-plus');

// 查询支持的模型列表
const models = llmManager.listModels();
console.log('Available models:', models);

// 简单对话（非流式）
const response = await llmManager.chatSimple('你好，请介绍一下自己');
console.log(response);

// 流式对话
const stream = await llmManager.chatStream('写一首诗');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### 4. 使用类实例

```typescript
import { LLMManager } from 'unillm-ts';

const manager = new LLMManager();
await manager.init();

const instances = manager.listInstances();
const openaiInstance = instances.find(inst => inst.templateId === 'openai');
if (!openaiInstance) {
  throw new Error('未找到 OpenAI 配置实例');
}
await manager.setCurrentInstance(openaiInstance.id);
await manager.setCurrentModel('gpt-4o');

// 高级对话接口
const response = await manager.chat({
  messages: [
    { role: 'system', content: '你是一个专业的助手' },
    { role: 'user', content: '请帮我分析一下这段代码' }
  ],
  temperature: 0.7,
  max_tokens: 1000,
  stream: false
});

if (!('content' in response)) {
  throw new Error('Unexpected stream response');
}

console.log(response.content);
console.log('Usage:', response.usage);
```

## API 文档

### LLMManager

#### `init(): Promise<void>`

初始化管理器，加载内置模型与模板，并从本地 JSON 中读取配置实例。

#### 模型信息
- `listModels(): string[]`
- `getModelsInfo(): ModelInfo[]`
- `getSupportedModels(): SupportedModel[]`
- `getCurrentInstanceModels(): SupportedModel[]`

```typescript
interface ModelInfo {
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
```

#### 模板与实例管理
- `getConfigTemplates(): ConfigTemplate[]`
- `createInstanceFromTemplate(templateId: string, options?: InstanceCreationOptions): Promise<ConfigInstanceSummary>`
- `listInstances(): ConfigInstanceSummary[]`
- `getInstance(instanceId: string): ConfigInstanceSummary | null`
- `updateInstance(instanceId: string, payload: InstanceUpdatePayload): Promise<ConfigInstanceSummary>`
- `setCurrentInstance(instanceId: string): Promise<void>`
- `getCurrentInstance(): ConfigInstanceSummary | null`
- `setCurrentModel(modelId: string): Promise<void>`
- `getCurrentModel(): string | null`
- `getModelConfig(modelId: string, instanceId?: string): Partial<ModelConfig> | null`

#### 对话接口
- `chat(options: ChatCompletionOptions, selector?: string | { instanceId?: string; modelId?: string }): Promise<ChatCompletionResponse | AsyncGenerator<string>>`
- `chatSimple(message: string, selector?: string | { instanceId?: string; modelId?: string }): Promise<string>`
- `chatStream(message: string, selector?: string | { instanceId?: string; modelId?: string }): AsyncGenerator<string>`

#### 其他
- `getSupportedProviders(): string[]`

### 安全存储

#### `setSecret(key: string, value: string): Promise<void>`

存储敏感信息（如 API Key）。

#### `getSecret(key: string): Promise<string | null>`

获取存储的敏感信息。

## 配置数据说明

- 模型信息：保存在 `src/config/models.json`，提供模型 ID、参数、数据格式等描述。
- 模板信息：保存在 `src/config/templates.json`，定义每个提供方的默认配置与所需密钥。
- 配置实例：运行时保存在用户目录 `~/.unillm/instances.json`，每个实例包含名称、配置覆盖项与 `secretKeys`。
- 当前状态：当前实例与模型保存在 `~/.unillm/state.json`，便于下次启动时恢复。

> 提示：模板仅由开发者提供，构建后无法通过运行时修改模板文件。若需要新增或调整模板，请在发布前更新对应 JSON。

## 扩展性

库设计为可扩展的，支持：

1. **添加新的提供商**：实现 `LLMProvider` 抽象类
2. **多模态输入**：`MessageContent` 接口支持文本、图片、文件等类型
3. **自定义配置**：配置项支持任意扩展字段

### 添加新提供商示例

```typescript
import { LLMProvider } from 'unillm-ts';
import { ChatCompletionOptions, ChatCompletionResponse } from 'unillm-ts';

export class MyCustomProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    // 实现您的提供商逻辑
  }
}
```

## 注意事项

1. **keytar 依赖**：需要系统支持 keytar（可能需要额外的系统库）
2. **讯飞星火**：目前需要 WebSocket 实现，请参考官方 SDK
3. **API 密钥安全**：建议使用 `@secret:` 前缀存储敏感信息

## 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式（watch）
npm run dev
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

