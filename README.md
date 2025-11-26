# UniLLM-TS

> A unified TypeScript library for calling large language models (LLMs) across multiple providers

[![npm version](https://img.shields.io/npm/v/unillm-ts.svg)](https://www.npmjs.com/package/unillm-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🚀 **Lightweight**: No UI layer and no external service dependencies
- 🔄 **Unified Interface**: A consistent chat API for every provider
- 🔌 **Extensible**: Text chat today, ready to expand to other data formats
- 🔒 **Secure Storage**: Encrypt API keys with keytar (desktop) and react-native-keychain (mobile)
- 👥 **Multi-user Ready**: Built-in user context management prevents key leakage between users
- 📦 **Easy Integration**: Install from npm and import with a single line
- ⚙️ **Config Management**: Use templates and instances to manage API keys, models, and hyperparameters

## Providers on the Roadmap

- [ ] OpenAI (GPT-4, GPT-3.5, etc.)
- [ ] Google Gemini
- [ ] Alibaba Qwen
- [ ] Zhipu AI (GLM-4)
- [ ] Moonshot AI (Kimi)
- [ ] iFlytek Spark (WebSocket implementation required)

## Roadmap
- [ ] Finalize the architecture with complete management and access interfaces
- [ ] Ensure access stability and security
- [ ] Improve provider integrations
- [ ] Support more providers (e.g., Baidu ERNIE Bot, Azure OpenAI)
- [ ] Offer flexible API configuration, selection, and invocation options
- [ ] Add more examples and documentation
- [ ] Support multimodal input (images, audio, etc.)
- [ ] Add MCP support

## Installation

### For Node.js/Desktop Applications

```bash
npm install unillm-ts
```

### For React Native Applications

```bash
npm install unillm-ts react-native-keychain

# iOS setup
cd ios && pod install && cd ..
```

### Platform-Specific Setup

- **Windows**: Uses `keytar` with Windows Credential Manager
- **macOS**: Uses `keytar` with macOS Keychain (implementation in progress)
- **Linux**: Uses `libsecret` (GNOME Keyring/KDE Wallet) with encrypted file fallback
- **iOS**: Uses `react-native-keychain` with iOS Keychain
- **Android**: Uses `react-native-keychain` with Android Keystore
- **Web**: Uses browser's secure storage (when available)

For detailed setup instructions:
- [iOS Keychain Storage](docs/ios-keychain-storage.md)
- [Linux Secure Storage](docs/linux-storage.md)

## Quick Start

### 1. Configure API Keys

First, securely store your API keys:

```typescript
import { setSecret } from 'unillm-ts';

// Store API keys
await setSecret('openai-default-api_key', 'your-openai-key');
await setSecret('qwen-default-api_key', 'your-qwen-key');
await setSecret('zhipu-default-api_key', 'your-zhipu-key');
// Some providers require additional fields, for example:
// await setSecret('qwen-default-access_key_id', 'your-aliyun-ak');
// await setSecret('qwen-default-access_key_secret', 'your-aliyun-sk');
```

### 2. Inspect Templates and Instances

UniLLM-TS bundles all supported models, configuration templates, and default instances derived from those templates. After initialization you can review and manage them:

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

Each instance tells you which `secretKeys` must be configured (for example `qwen-default-api_key`). Once you provide the real values with `setSecret`, you can invoke the corresponding provider.

### 3. Use the Singleton (Recommended)

```typescript
import llmManager from 'unillm-ts';

// Initialize
await llmManager.init();

// Select an instance and model
const instances = llmManager.listInstances();
const current = instances.find(inst => inst.templateId === 'qwen') ?? instances[0];
if (!current) {
  throw new Error('No configuration instance found');
}
await llmManager.setCurrentInstance(current.id);
await llmManager.setCurrentModel('qwen-plus');

// Discover supported models
const models = llmManager.listModels();
console.log('Available models:', models);

// Simple (non-streaming) chat
const response = await llmManager.chatSimple('Hello, introduce yourself.');
console.log(response);

// Streaming chat
const stream = await llmManager.chatStream('Write a poem about spring.');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

### 4. Work with Class Instances

```typescript
import { LLMManager } from 'unillm-ts';

const manager = new LLMManager();
await manager.init();

const instances = manager.listInstances();
const openaiInstance = instances.find(inst => inst.templateId === 'openai');
if (!openaiInstance) {
  throw new Error('OpenAI configuration instance not found');
}
await manager.setCurrentInstance(openaiInstance.id);
await manager.setCurrentModel('gpt-4o');

// Advanced chat interface
const response = await manager.chat({
  messages: [
    { role: 'system', content: 'You are a professional assistant.' },
    { role: 'user', content: 'Please help me review this piece of code.' }
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

## API Overview

### LLMManager

#### `init(): Promise<void>`

Initializes the manager, loads bundled models and templates, and reads configuration instances from the local JSON files.

#### Model Information
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

#### Template and Instance Management
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

#### Chat Interfaces
- `chat(options: ChatCompletionOptions, selector?: string | { instanceId?: string; modelId?: string }): Promise<ChatCompletionResponse | AsyncGenerator<string>>`
- `chatSimple(message: string, selector?: string | { instanceId?: string; modelId?: string }): Promise<string>`
- `chatStream(message: string, selector?: string | { instanceId?: string; modelId?: string }): AsyncGenerator<string>`

#### Miscellaneous
- `getSupportedProviders(): string[]`

### Secure Storage

#### `setSecret(key: string, value: string): Promise<void>`

Stores sensitive data (such as API keys). When a user ID is set, secrets are isolated per user.

#### `getSecret(key: string): Promise<string | null>`

Retrieves a stored secret. Honors the current user ID when present.

#### `deleteSecret(key: string): Promise<boolean>`

Removes a stored secret.

#### `getAllSecrets(): Promise<string[]>`

Returns every stored secret key. Limited to the current user when one is set.

#### `clearAllSecrets(): Promise<void>`

Clears all secrets, scoped to the current user if configured.

### User Context Management

Use user context management to isolate secrets in multi-user applications:

#### `setCurrentUserId(userId: string): void`

Sets the current user ID so subsequent secret operations are user-scoped.

```typescript
import { setCurrentUserId, setSecret } from 'unillm-ts';

// Set the user ID when the user signs in
setCurrentUserId('user-alice');

// Secrets written afterwards are scoped to Alice
await setSecret('openai-default-api_key', 'alice-key-123');
```

#### `getCurrentUserId(): string | null`

Returns the current user ID.

#### `clearCurrentUserId(): void`

Clears the current user ID—typically when the user signs out.

#### `hasCurrentUserId(): boolean`

Checks whether a user ID is currently set.

**Multi-user example:**

```typescript
import { setCurrentUserId, clearCurrentUserId, setSecret, getSecret } from 'unillm-ts';

// User A signs in
setCurrentUserId('user-alice');
await setSecret('openai-default-api_key', 'alice-key-123');

// User A signs out
clearCurrentUserId();

// User B signs in
setCurrentUserId('user-bob');
await setSecret('openai-default-api_key', 'bob-key-456');

// User B retrieves their secret (Alice's secret stays isolated)
const bobKey = await getSecret('openai-default-api_key'); // 'bob-key-456'
```

## Configuration Data

- Model definitions: stored in `src/config/models.json` and include IDs, parameters, and data format metadata.
- Template definitions: stored in `src/config/templates.json` and define default provider configuration and required secrets.
- Config instances: persisted at runtime in `~/.unillm/instances.json`, each containing a name, configuration overrides, and `secretKeys`.
- Current state: the selected instance and model are stored in `~/.unillm/state.json` for automatic restoration.

> Tip: Templates ship with the library and cannot be modified at runtime. To add or adjust templates, update the JSON files before publishing.

## Extensibility

The library is designed to be extensible:

1. **Add a new provider**: Implement the `LLMProvider` abstract class.
2. **Support multimodal input**: The `MessageContent` interface supports text, images, files, and more.
3. **Customize configuration**: Configuration objects accept any extension fields.

### Example: Adding a New Provider

```typescript
import { LLMProvider } from 'unillm-ts';
import { ChatCompletionOptions, ChatCompletionResponse } from 'unillm-ts';

export class MyCustomProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    // Implement your provider logic here
  }
}
```

## Notes

1. **keytar dependency**: Ensure your system supports keytar (extra libraries might be required).
2. **iFlytek Spark**: Currently requires a WebSocket implementation—refer to the official SDK.
3. **API key security**: Use the `@secret:` prefix in configuration files to reference secure storage.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch mode
npm run dev
```

## License

MIT

## Contributing

Issues and pull requests are always welcome.
