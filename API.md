# API Reference

## Class: `LLMManager`

`LLMManager` is the core class of the library. It loads bundled models and templates, manages runtime configuration instances, and normalizes chat interfaces for every LLM provider.

### Initialization

#### `init(configPath?: string): Promise<void>`

Initializes the manager, loads built-in models and templates, and reads configuration instances and the current state from the local data directory (defaults to `~/.unillm`). If no instances exist yet, default instances are generated from the templates. The optional `configPath` parameter allows you to load `models.json` and `templates.json` from a custom path. The path can point to a directory containing both files or to either file individually. When omitted, the built-in defaults are used.

```typescript
const manager = new LLMManager();
await manager.init();

const customManager = new LLMManager();
await customManager.init('/path/to/custom/config');
```

> Initialization is idempotent; repeated calls do not rewrite local files. After initializing a manager with a custom configuration path, create a new `LLMManager` if you want to switch to another configuration source.

### Model Information

#### `listModels(): string[]`
Returns a list of supported model IDs.

#### `getModelsInfo(): ModelInfo[]`
Returns detailed information for every model.

#### `getSupportedModels(): SupportedModel[]`
Equivalent to `getModelsInfo()`, providing the full model descriptors.

#### `getCurrentInstanceModels(): SupportedModel[]`
Returns the models available to the currently selected instance.

```typescript
const models = manager.getModelsInfo();
models.forEach(model => {
  console.log(model.id, model.parameters.maxInputTokens);
});
```

Structure of `ModelInfo` / `SupportedModel`:

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

### Template and Instance Management

#### `getConfigTemplates(): ConfigTemplate[]`
Returns the built-in template list (read-only).

#### `createInstanceFromTemplate(templateId: string, options?: InstanceCreationOptions): Promise<ConfigInstanceSummary>`
Creates a new configuration instance from a template. You can customize the name, configuration overrides, and default model.

#### `listInstances(): ConfigInstanceSummary[]`
Lists all instances. Secret values are masked with `[secure]`.

#### `getInstance(instanceId: string): ConfigInstanceSummary | null`
Returns information about a single instance.

#### `updateInstance(instanceId: string, payload: InstanceUpdatePayload): Promise<ConfigInstanceSummary>`
Updates an instance name, configuration overrides, secrets, or default model.

#### `setCurrentInstance(instanceId: string): Promise<void>`
Sets the active instance and synchronizes its default model.

#### `getCurrentInstance(): ConfigInstanceSummary | null`
Returns the active instance (with secrets masked).

#### `setCurrentModel(modelId: string): Promise<void>`
Sets the model used for future calls. `selectModel` is an alias for backward compatibility.

#### `getCurrentModel(): string | null`
Returns the currently selected model ID.

#### `getModelConfig(modelId: string, instanceId?: string): Partial<ModelConfig> | null`
Returns a snapshot of the resolved configuration for a specific model within an instance (with secrets redacted).

Example:

```typescript
await manager.init();

const templates = manager.getConfigTemplates();
const instances = manager.listInstances();

const qwenInstance = instances.find(inst => inst.templateId === 'qwen');
if (!qwenInstance) {
  throw new Error('No Qwen instance available.');
}

await manager.setCurrentInstance(qwenInstance.id);
await manager.setCurrentModel('qwen-plus');

const preview = manager.getModelConfig('qwen-plus');
console.log(preview);
```

Common types:

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

### Chat Interfaces

#### `chat(options: ChatCompletionOptions, selector?: string | { instanceId?: string; modelId?: string }): Promise<ChatCompletionResponse | AsyncGenerator<string>>`
Unified chat interface. The optional `selector` lets you choose a model ID or specify both instance and model. When omitted, the current instance and model are used.

#### `chatSimple(message: string, selector?: string | { instanceId?: string; modelId?: string }): Promise<string>`
Convenience wrapper for non-streaming calls.

#### `chatStream(message: string, selector?: string | { instanceId?: string; modelId?: string }): AsyncGenerator<string>`
Convenience wrapper for streaming responses.

```typescript
await manager.setCurrentInstance('openai-default');
await manager.setCurrentModel('gpt-4o');

const answer = await manager.chatSimple('Hello!');
console.log(answer);

const stream = await manager.chatStream('Write a poem.');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

Refer to `src/types.ts` for full definitions of `ChatCompletionOptions` and `ChatCompletionResponse`.

### Other Methods

#### `getSupportedProviders(): string[]`
Returns the list of implemented providers, e.g. `['openai', 'qwen', ...]`.

---

## Secure Storage Functions

### `setSecret(key: string, value: string): Promise<void>`
Writes sensitive information to the system keychain. Secret names normally come from an instance's `secretKeys`. When a user ID is set, the key is automatically scoped to that user.

### `getSecret(key: string): Promise<string | null>`
Reads a secret value. Honors the current user ID when present.

### `deleteSecret(key: string): Promise<boolean>`
Deletes a secret. Scoped to the current user when one is set.

### `getAllSecrets(): Promise<string[]>`
Returns the stored secret names. When a user ID is set, only that user's secrets are returned; otherwise the unscoped secrets are listed for backward compatibility.

### `clearAllSecrets(): Promise<void>`
Clears all secrets. Behaves similarly to `getAllSecrets()` by respecting user scoping.

> Secrets are managed by `keytar`; behavior may vary by platform.

---

## User Context Management

To support multi-user scenarios and prevent key collisions, the library offers user context helpers. Once a user ID is set, all secret operations are automatically scoped.

### `setCurrentUserId(userId: string): void`
Sets the current user ID so subsequent secret operations automatically incorporate it.

```typescript
import { setCurrentUserId } from 'unillm-ts';

// Invoke when a user signs in
setCurrentUserId('user-12345');
```

### `getCurrentUserId(): string | null`
Returns the current user ID, or `null` if none is set.

```typescript
const userId = getCurrentUserId();
console.log(`Current user ID: ${userId}`);
```

### `clearCurrentUserId(): void`
Clears the current user ID, returning to the default unscoped behavior.

```typescript
// Clear the user ID when the user signs out
clearCurrentUserId();
```

### `hasCurrentUserId(): boolean`
Checks whether a user ID is currently set.

```typescript
if (hasCurrentUserId()) {
  console.log('User context is active.');
}
```

### Multi-user Example

```typescript
import {
  setCurrentUserId,
  clearCurrentUserId,
  setSecret,
  getSecret,
  LLMManager,
} from 'unillm-ts';

// User Alice signs in
setCurrentUserId('user-alice');
await setSecret('openai_api_key', 'alice-key-123');

const manager = new LLMManager();
await manager.init();
// The manager now uses Alice's secrets

// Alice signs out
clearCurrentUserId();

// User Bob signs in
setCurrentUserId('user-bob');
await setSecret('openai_api_key', 'bob-key-456');
// Bob's secret does not overwrite Alice's

// Fetch Bob's secret
const bobKey = await getSecret('openai_api_key'); // 'bob-key-456'
```

> **Note:** Secret keys are encoded as `user:{userId}:{originalKey}` when a user ID is set. Without a user ID, secret operations behave exactly as in previous versions for full backward compatibility.

---

## Frequently Used Types

Additional types are defined in `src/types.ts`. The following snippet highlights the most commonly used interfaces:

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

## Configuration Data and Directories

- **Static definitions**:
  - `src/config/models.json` — model information (immutable at runtime)
  - `src/config/templates.json` — template definitions (immutable at runtime)
- **Runtime data** (stored in `~/.unillm` by default):
  - `instances.json` — list of configuration instances
  - `state.json` — current instance and selected model

Templates are intended for development-time changes only. Customize behavior at runtime by creating instances and managing secrets.

---

## Error Handling

Wrap operations that touch the network or secrets in `try/catch` blocks:

```typescript
try {
  await manager.init();
  await manager.setCurrentInstance('openai-default');
  await manager.setCurrentModel('gpt-4o');
  const reply = await manager.chatSimple('Hello');
  console.log(reply);
} catch (error) {
  console.error('Request failed:', (error as Error).message);
}
```

Common errors:
- `LLMManager not initialized` — forgot to call `init()`
- `Configuration instance ... not found` — instance ID does not exist
- `Model ... is not available for instance ...` — instance/model mismatch
- Provider-specific errors — returned by the underlying service
- `keytar` errors — the current environment does not support secure storage

---

## Secret Naming Convention

Default instance secrets follow the `<instanceId>-<field>` pattern, for example:
- `openai-default-api_key`
- `qwen-default-api_key`
- `qwen-default-access_key_id`
- `spark-default-api_secret`

Custom instances use their generated ID (e.g. `openai-<uuid>-api_key`). Inspect `ConfigInstanceSummary.secretKeys` whenever you need to confirm the actual names.
