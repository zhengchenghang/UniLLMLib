# API 参考文档

## 类: LLMManager

`LLMManager` 是库的核心管理类，负责加载内置模型与模板、管理运行时配置实例，并统一对接各个 LLM 提供商的聊天接口。

### 初始化

#### `init(): Promise<void>`

初始化管理器，加载内置模型与模板，并从本地数据目录（默认 `~/.unillm`）读取配置实例和当前状态。如果本地没有实例文件，会根据模板自动生成默认实例。

```typescript
const manager = new LLMManager();
await manager.init();
```

> 说明：初始化过程是幂等的；重复调用不会重新写入文件。

### 模型信息

#### `listModels(): string[]`
返回所有支持的模型 ID 列表。

#### `getModelsInfo(): ModelInfo[]`
返回全部模型的详细信息。

#### `getSupportedModels(): SupportedModel[]`
与 `getModelsInfo` 等价，提供完整模型描述。

#### `getCurrentInstanceModels(): SupportedModel[]`
返回当前选中实例可用的模型列表。

```typescript
const models = manager.getModelsInfo();
models.forEach(model => {
  console.log(model.id, model.parameters.maxInputTokens);
});
```

`ModelInfo`/`SupportedModel` 结构：

```typescript
interface SupportedModel {
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

### 模板与实例管理

#### `getConfigTemplates(): ConfigTemplate[]`
读取内置模板列表（只读）。

#### `createInstanceFromTemplate(templateId: string, options?: InstanceCreationOptions): Promise<ConfigInstanceSummary>`
基于模板创建新的配置实例，可自定义名称、配置覆盖和预设模型。

#### `listInstances(): ConfigInstanceSummary[]`
列出全部实例（密钥字段会以 `[secure]` 形式呈现）。

#### `getInstance(instanceId: string): ConfigInstanceSummary | null`
获取单个实例信息。

#### `updateInstance(instanceId: string, payload: InstanceUpdatePayload): Promise<ConfigInstanceSummary>`
更新实例的名称、配置覆盖、密钥值或默认模型。

#### `setCurrentInstance(instanceId: string): Promise<void>`
设置当前使用的实例，并自动同步默认模型。

#### `getCurrentInstance(): ConfigInstanceSummary | null`
返回当前实例（脱敏）。

#### `setCurrentModel(modelId: string): Promise<void>`
设置当前实例下次调用时使用的模型。`selectModel` 是其兼容别名。

#### `getCurrentModel(): string | null`
返回当前实例选择的模型 ID。

#### `getModelConfig(modelId: string, instanceId?: string): Partial<ModelConfig> | null`
返回指定模型在实例中的配置快照（密钥字段脱敏）。

示例：

```typescript
await manager.init();

const templates = manager.getConfigTemplates();
const instances = manager.listInstances();

const qwenInstance = instances.find(inst => inst.templateId === 'qwen');
if (!qwenInstance) {
  throw new Error('没有可用的 Qwen 实例');
}

await manager.setCurrentInstance(qwenInstance.id);
await manager.setCurrentModel('qwen-plus');

const preview = manager.getModelConfig('qwen-plus');
console.log(preview);
```

常用类型：

```typescript
interface ConfigTemplate {
  id: string;
  name: string;
  provider: string;
  description?: string;
  modelIds: string[];
  defaultConfig: Record<string, any>;
  secretFields: TemplateSecretField[];
  defaultInstance?: TemplateDefaultInstance;
}

interface TemplateSecretField {
  key: string;
  label?: string;
  description?: string;
  required?: boolean;
}

interface ConfigInstanceSummary {
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

interface InstanceCreationOptions {
  name?: string;
  config?: Record<string, any>;
  secrets?: Record<string, string>;
  selectedModelId?: string;
}

interface InstanceUpdatePayload {
  name?: string;
  config?: Record<string, any>;
  secrets?: Record<string, string | null>;
  selectedModelId?: string;
}
```

### 对话接口

#### `chat(options: ChatCompletionOptions, selector?: string | { instanceId?: string; modelId?: string }): Promise<ChatCompletionResponse | AsyncGenerator<string>>`
统一对话接口。`selector` 参数可以指定模型 ID 或包含实例/模型的选择对象；省略时使用当前实例与模型。

#### `chatSimple(message: string, selector?: string | { instanceId?: string; modelId?: string }): Promise<string>`
非流式快捷方法。

#### `chatStream(message: string, selector?: string | { instanceId?: string; modelId?: string }): AsyncGenerator<string>`
流式快捷方法。

```typescript
await manager.setCurrentInstance('openai-default');
await manager.setCurrentModel('gpt-4o');

const answer = await manager.chatSimple('你好！');
console.log(answer);

const stream = await manager.chatStream('写一首诗');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

`ChatCompletionOptions` 与 `ChatCompletionResponse` 类型见 `src/types.ts`。

### 其他方法

#### `getSupportedProviders(): string[]`
返回已实现的提供商列表，如 `['openai', 'qwen', ...]`。

---

## 安全存储函数

### `setSecret(key: string, value: string): Promise<void>`
将敏感信息写入系统密钥链。密钥名称通常来源于实例的 `secretKeys`。

### `getSecret(key: string): Promise<string | null>`
读取密钥值。

### `deleteSecret(key: string): Promise<boolean>`
删除密钥。

### `getAllSecrets(): Promise<string[]>`
列出当前服务下保存的所有密钥名称。

> 秘钥存储由 `keytar` 提供，具体行为取决于运行平台。

---

## 常用类型

更多类型定义见 `src/types.ts`，以下为核心接口摘要：

```typescript
interface ModelConfig {
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

interface ChatCompletionOptions {
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  [key: string]: any;
}

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

---

## 配置数据与目录

- **静态定义**：
  - `src/config/models.json` —— 模型信息（不可在运行时修改）
  - `src/config/templates.json` —— 模板定义（不可在运行时修改）
- **运行时数据**（默认存放在 `~/.unillm`）：
  - `instances.json` —— 实例列表
  - `state.json` —— 当前实例与模型状态

模板只能在开发阶段修改；运行时只能通过实例和密钥进行定制。

---

## 错误处理

建议为涉及网络或密钥的调用编写 `try/catch`：

```typescript
try {
  await manager.init();
  await manager.setCurrentInstance('openai-default');
  await manager.setCurrentModel('gpt-4o');
  const reply = await manager.chatSimple('Hello');
  console.log(reply);
} catch (error) {
  console.error('调用失败:', (error as Error).message);
}
```

常见错误：
- `LLMManager not initialized` —— 忘记调用 `init()`
- `Configuration instance ... not found` —— 实例不存在
- `Model ... is not available for instance ...` —— 模型与实例不匹配
- Provider 相关错误 —— 来自具体服务端
- `keytar` 相关错误 —— 当前环境不支持安全存储

---

## 附：密钥命名约定

默认实例的密钥名称格式为 `<实例ID>-<字段名>`，例如：
- `openai-default-api_key`
- `qwen-default-api_key`
- `qwen-default-access_key_id`
- `spark-default-api_secret`

自定义实例将使用生成的实例 ID（如 `openai-<uuid>-api_key`）。通过 `ConfigInstanceSummary.secretKeys` 可随时查询对应名称。
