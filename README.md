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
- ⚙️ **配置管理**：通过配置文件管理 API Key、模型、超参等

## 支持的提供商

- ✅ OpenAI (GPT-4, GPT-3.5, etc.)
- ✅ 阿里云通义千问 (Qwen)
- ✅ 智谱 AI (GLM-4)
- ✅ Moonshot AI (Kimi)
- ⚠️ 讯飞星火 (需要 WebSocket 实现)

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
await setSecret('openai-api-key', 'your-openai-key');
await setSecret('qwen-api-key', 'your-qwen-key');
await setSecret('zhipu-api-key', 'your-zhipu-key');
```

### 2. 创建配置文件

创建 `llm_config.yaml` 文件（或使用默认配置）：

```yaml
models:
  gpt-4:
    provider: openai
    model: gpt-4
    api_key: @secret:openai-api-key
    base_url: https://api.openai.com/v1

  qwen-plus:
    provider: qwen
    model: qwen-plus
    api_key: @secret:qwen-api-key

  glm-4:
    provider: zhipu
    model: glm-4
    api_key: @secret:zhipu-api-key

default_model: qwen-plus
debug: false
```

### 3. 使用单例模式（推荐）

```typescript
import llmManager from 'unillm-ts';

// 初始化
await llmManager.init();

// 查询支持的模型列表
const models = llmManager.listModels();
console.log('Available models:', models);

// 选择模型
llmManager.selectModel('qwen-plus');

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
await manager.init('./my-config.yaml');

// 高级对话接口
const response = await manager.chat({
  messages: [
    { role: 'system', content: '你是一个专业的助手' },
    { role: 'user', content: '请帮我分析一下这段代码' }
  ],
  temperature: 0.7,
  max_tokens: 1000,
  stream: false
}, 'gpt-4');

if (!isStream(response)) {
  console.log(response.content);
  console.log('Usage:', response.usage);
}
```

## API 文档

### LLMManager

#### `init(configPath?: string): Promise<void>`

初始化管理器，加载配置文件。

#### `listModels(): string[]`

获取所有配置的模型名称列表。

#### `getModelsInfo(): ModelInfo[]`

获取模型详细信息列表。

```typescript
interface ModelInfo {
  name: string;
  provider: string;
  model: string;
}
```

#### `selectModel(modelName: string): void`

选择当前使用的模型。

#### `getCurrentModel(): string | null`

获取当前选择的模型名称。

#### `getModelConfig(modelName: string): Partial<ModelConfig> | null`

获取指定模型的配置（敏感信息已脱敏）。

#### `chat(options: ChatCompletionOptions, modelName?: string): Promise<ChatCompletionResponse | AsyncGenerator<string>>`

统一的对话接口。

```typescript
interface ChatCompletionOptions {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}
```

#### `chatSimple(message: string, modelName?: string): Promise<string>`

简化的非流式对话接口。

#### `chatStream(message: string, modelName?: string): AsyncGenerator<string>`

简化的流式对话接口。

#### `getSupportedProviders(): string[]`

获取支持的提供商列表。

### 安全存储

#### `setSecret(key: string, value: string): Promise<void>`

存储敏感信息（如 API Key）。

#### `getSecret(key: string): Promise<string | null>`

获取存储的敏感信息。

## 配置文件说明

配置文件使用 YAML 格式，支持以下字段：

```yaml
models:
  model-name:
    provider: openai  # 提供商名称
    model: gpt-4      # 模型名称
    api_key: @secret:key-name  # 使用 @secret: 前缀引用安全存储的密钥
    # 其他提供商特定的配置...

default_model: model-name  # 默认使用的模型
debug: false  # 是否启用调试模式
```

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

