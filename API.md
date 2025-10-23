# API 参考文档

## 类: LLMManager

主要的管理器类，用于管理和调用不同的 LLM 提供商。

### 方法

#### `init(configPath?: string): Promise<void>`

初始化 LLM Manager。

**参数:**
- `configPath` (可选): 配置文件路径，默认使用内置的 `llm_config.yaml`

**返回:** Promise<void>

**示例:**
```typescript
const manager = new LLMManager();
await manager.init('./my-config.yaml');
```

---

#### `listModels(): string[]`

获取所有配置的模型名称列表。

**返回:** string[] - 模型名称数组

**示例:**
```typescript
const models = manager.listModels();
// ['gpt-4', 'qwen-plus', 'glm-4', ...]
```

---

#### `getModelsInfo(): ModelInfo[]`

获取模型详细信息列表。

**返回:** ModelInfo[] - 包含模型详细信息的数组

**ModelInfo 接口:**
```typescript
interface ModelInfo {
  name: string;      // 模型名称
  provider: string;  // 提供商
  model: string;     // 模型 ID
}
```

**示例:**
```typescript
const info = manager.getModelsInfo();
// [
//   { name: 'gpt-4', provider: 'openai', model: 'gpt-4' },
//   { name: 'qwen-plus', provider: 'qwen', model: 'qwen-plus' },
//   ...
// ]
```

---

#### `selectModel(modelName: string): void`

选择当前使用的模型。

**参数:**
- `modelName`: 模型名称

**抛出:** Error - 如果模型不存在

**示例:**
```typescript
manager.selectModel('gpt-4');
```

---

#### `getCurrentModel(): string | null`

获取当前选择的模型名称。

**返回:** string | null - 当前模型名称，未选择则返回 null

**示例:**
```typescript
const current = manager.getCurrentModel();
// 'gpt-4'
```

---

#### `getModelConfig(modelName: string): Partial<ModelConfig> | null`

获取指定模型的配置（敏感信息已脱敏）。

**参数:**
- `modelName`: 模型名称

**返回:** Partial<ModelConfig> | null - 模型配置，不存在则返回 null

**示例:**
```typescript
const config = manager.getModelConfig('gpt-4');
// {
//   provider: 'openai',
//   model: 'gpt-4',
//   api_key: '[secure]',
//   base_url: 'https://api.openai.com/v1'
// }
```

---

#### `chat(options: ChatCompletionOptions, modelName?: string): Promise<ChatCompletionResponse | AsyncGenerator<string>>`

统一的对话接口，支持流式和非流式响应。

**参数:**
- `options`: 对话选项
- `modelName` (可选): 模型名称，不提供则使用当前选择的模型

**返回:** 
- 非流式: Promise<ChatCompletionResponse>
- 流式: Promise<AsyncGenerator<string>>

**ChatCompletionOptions 接口:**
```typescript
interface ChatCompletionOptions {
  messages: Message[];
  temperature?: number;  // 0-2，默认1
  max_tokens?: number;   // 最大生成 token 数
  stream?: boolean;      // 是否流式返回
  top_p?: number;        // 核采样参数
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}
```

**ChatCompletionResponse 接口:**
```typescript
interface ChatCompletionResponse {
  content: string;
  role: 'assistant';
  finish_reason?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

**示例:**
```typescript
// 非流式
const response = await manager.chat({
  messages: [
    { role: 'user', content: '你好' }
  ],
  temperature: 0.7,
  stream: false
});
console.log(response.content);

// 流式
const stream = await manager.chat({
  messages: [
    { role: 'user', content: '写一首诗' }
  ],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

---

#### `chatSimple(message: string, modelName?: string): Promise<string>`

简化的非流式对话接口。

**参数:**
- `message`: 用户消息
- `modelName` (可选): 模型名称

**返回:** Promise<string> - AI 回复内容

**示例:**
```typescript
const reply = await manager.chatSimple('什么是递归？');
console.log(reply);
```

---

#### `chatStream(message: string, modelName?: string): Promise<AsyncGenerator<string>>`

简化的流式对话接口。

**参数:**
- `message`: 用户消息
- `modelName` (可选): 模型名称

**返回:** Promise<AsyncGenerator<string>> - 流式响应生成器

**示例:**
```typescript
const stream = await manager.chatStream('写一首诗');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

---

#### `getSupportedProviders(): string[]`

获取支持的提供商列表。

**返回:** string[] - 提供商名称数组

**示例:**
```typescript
const providers = manager.getSupportedProviders();
// ['openai', 'qwen', 'zhipu', 'moonshot', 'spark']
```

---

## 安全存储函数

### `setSecret(key: string, value: string): Promise<void>`

存储敏感信息到系统密钥链。

**参数:**
- `key`: 密钥名称
- `value`: 密钥值

**示例:**
```typescript
import { setSecret } from 'unillm-ts';
await setSecret('openai-api-key', 'sk-...');
```

---

### `getSecret(key: string): Promise<string | null>`

从系统密钥链获取敏感信息。

**参数:**
- `key`: 密钥名称

**返回:** Promise<string | null> - 密钥值，不存在则返回 null

**示例:**
```typescript
import { getSecret } from 'unillm-ts';
const key = await getSecret('openai-api-key');
```

---

## 类型定义

### ModelConfig

```typescript
interface ModelConfig {
  provider: string;        // 提供商名称
  model: string;          // 模型 ID
  api_key?: string;       // API Key
  base_url?: string;      // API 基础 URL
  access_key_id?: string; // 阿里云 Access Key ID
  access_key_secret?: string; // 阿里云 Access Key Secret
  app_id?: string;        // 讯飞 App ID
  api_secret?: string;    // 讯飞 API Secret
  [key: string]: any;     // 其他自定义字段
}
```

### Message

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent[];
}
```

### MessageContent (扩展性支持)

```typescript
interface MessageContent {
  type: 'text' | 'image_url' | 'file';
  text?: string;
  image_url?: string;
  file_url?: string;
}
```

### LLMConfig

```typescript
interface LLMConfig {
  models: Record<string, ModelConfig>;
  default_model?: string;
  debug?: boolean;
}
```

---

## 配置文件格式

### YAML 配置示例

```yaml
models:
  gpt-4:
    provider: openai
    model: gpt-4
    api_key: @secret:openai-api-key  # 引用安全存储
    base_url: https://api.openai.com/v1

  qwen-plus:
    provider: qwen
    model: qwen-plus
    api_key: @secret:qwen-api-key

default_model: gpt-4
debug: false
```

### 配置字段说明

- `models`: 模型配置对象
  - 键名: 自定义的模型名称
  - `provider`: 提供商 (openai, qwen, zhipu, moonshot, spark)
  - `model`: 提供商的模型 ID
  - 其他字段根据提供商要求配置

- `default_model`: 默认模型名称
- `debug`: 是否启用调试模式

### 使用 @secret: 语法

在配置文件中，使用 `@secret:key-name` 语法引用存储在系统密钥链中的敏感信息：

```yaml
api_key: @secret:openai-api-key
```

这将在运行时自动从密钥链读取名为 `openai-api-key` 的值。

---

## 错误处理

所有异步方法都可能抛出错误，建议使用 try-catch 处理：

```typescript
try {
  await manager.init();
  const response = await manager.chatSimple('Hello');
  console.log(response);
} catch (error) {
  console.error('Error:', error.message);
}
```

常见错误：
- `Model not found` - 模型不存在
- `LLMManager not initialized` - 未调用 init()
- `No model selected` - 未选择模型
- `keytar is not available` - keytar 未安装
- API 相关错误 - 来自具体提供商的错误

