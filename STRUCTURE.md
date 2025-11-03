# Project Structure

```
UniLLM-TS-Lib/
├── src/                          # Source code
│   ├── index.ts                  # Entry point exporting the public API
│   ├── manager.ts                # LLMManager core class
│   ├── types.ts                  # TypeScript type definitions
│   ├── secrets.ts                # Secure storage utilities (keytar)
│   ├── config/                   # Configuration assets
│   │   ├── loader.ts            # Load and persist models/templates/instances
│   │   ├── models.json          # Supported model definitions (static)
│   │   └── templates.json       # Template definitions (static)
│   └── providers/               # Provider implementations
│       ├── base.ts              # Abstract base class
│       ├── openai.ts            # OpenAI implementation
│       ├── qwen.ts              # Alibaba Qwen implementation
│       ├── zhipu.ts             # Zhipu AI implementation
│       ├── moonshot.ts          # Moonshot Kimi implementation
│       └── spark.ts             # iFlytek Spark (WebSocket stub)
│
├── examples/                     # Usage examples
│   ├── basic.ts                 # Basic usage example
│   ├── multi-model.ts           # Compare multiple models
│   ├── conversation.ts          # Multi-turn conversation
│   └── README.md                # Example documentation
│
├── dist/                        # Compiled output for npm publishing
│   ├── index.js
│   ├── index.d.ts
│   └── ...
│
├── package.json                 # npm package metadata
├── tsconfig.json                # TypeScript compiler configuration
├── README.md                    # Main documentation
├── QUICKSTART.md                # Quick start guide
├── API.md                       # API reference
├── INSTALL.md                   # Installation instructions
├── CHANGELOG.md                 # Release notes
├── LICENSE                      # MIT license
├── STRUCTURE.md                 # This file
├── .gitignore                   # Git ignore rules
└── .npmignore                   # npm publish ignore rules
```

## Core Modules

### `src/index.ts`
- Main entry point
- Exports the `LLMManager` class
- Re-exports all type definitions
- Exports `setSecret` and `getSecret`
- Provides the default singleton instance `defaultManager`

### `src/manager.ts`
- Implements the `LLMManager`
- Responsible for:
  - Initialization and configuration loading
  - Model management and switching
  - Unified chat interfaces
  - Dynamic provider loading

### `src/types.ts`
- Central location for TypeScript interfaces:
  - `ModelConfig`: provider configuration
  - `SupportedModel` / `ModelInfo`: model descriptions
  - `ConfigTemplate` / `TemplateSecretField`: template definitions
  - `ConfigInstance` / `ConfigInstanceSummary`: instance structures
  - `InstanceCreationOptions` / `InstanceUpdatePayload`: instance operations
  - `Message` / `MessageContent`: message payloads
  - `ChatCompletionOptions` / `ChatCompletionResponse`: chat input/output

### `src/secrets.ts`
- Secure storage management
- Integrates with the system keychain via `keytar`
- Exposes `setSecret` and `getSecret`
- `resolveValue` parses `@secret:` references in configuration files

### `src/config/loader.ts`
- Loads static model and template JSON files
- Persists instances and state in `~/.unillm`
- Provides helpers such as `loadSupportedModels`, `loadTemplates`, `loadInstances`, `saveInstances`, `loadState`, and `saveState`

### `src/providers/base.ts`
- Defines the abstract `LLMProvider`
- Specifies the required interface for all providers
- Declares the `chatCompletion` abstract method

### `src/providers/*.ts`
- Concrete provider implementations
- Each provider extends `LLMProvider`
- Implements `chatCompletion`
- Handles streaming and non-streaming responses
- Encapsulates provider-specific API logic

## Design Patterns

### 1. Singleton
- Exposes the `defaultManager` singleton
- Also allows creating custom manager instances

### 2. Strategy
- `LLMProvider` acts as the strategy interface
- Each provider implements its own strategy
- `LLMManager` selects the appropriate provider based on configuration

### 3. Factory
- Providers are loaded dynamically
- The `PROVIDERS` map in `manager.ts` serves as a factory

## Extensibility

### Add a New Provider

1. Create a new file under `src/providers/`, e.g. `newprovider.ts`
2. Extend `LLMProvider`
3. Implement `chatCompletion`
4. Register the provider in the `PROVIDERS` map in `manager.ts`

Example:
```typescript
// src/providers/newprovider.ts
import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';

export class NewProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    // Implement provider logic
  }
}
```

```typescript
// Add to PROVIDERS in src/manager.ts
const PROVIDERS: Record<string, any> = {
  // ... existing providers
  newprovider: () => import('./providers/newprovider').then(m => m.NewProvider),
};
```

### Add a New Message Type

Extend the `MessageContent` interface in `types.ts`:

```typescript
export interface MessageContent {
  type: 'text' | 'image_url' | 'file' | 'video' | 'audio';
  text?: string;
  image_url?: string;
  file_url?: string;
  video_url?: string;
  audio_url?: string;
}
```

## Build and Release

### Development
```bash
npm install
npm run dev  # watch mode
```

### Build
```bash
npm run build
```

### Publish
```bash
npm publish
```

## Dependencies

### Runtime
- `keytar`: System keychain integration (optional)

### Development
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions
- `ts-node`: Execute TypeScript examples

## Configuration Files

### `tsconfig.json`
- Target: ES2020
- Module: CommonJS
- Includes DOM types (for `fetch`)
- Strict mode enabled
- Emits declaration files

### `package.json`
- `main`: `dist/index.js`
- `types`: `dist/index.d.ts`
- `files`: controls published assets
- `engines`: Node.js >= 16.0.0

## Best Practices

1. **Error handling**: wrap async methods with `try/catch`
2. **Type safety**: leverage TypeScript types thoroughly
3. **Configuration validation**: verify config during initialization
4. **Security**: store secrets via keytar or environment variables
5. **Testability**: support dependency injection for easier testing
6. **Documentation**: keep code and documentation in sync

## Areas for Improvement

1. Add unit tests
2. Complete the Spark WebSocket implementation
3. Introduce retry mechanisms
4. Add request timeout controls
5. Build a configurable logging system
6. Support custom HTTP clients
7. Integrate more providers
8. Add multimodal input support (images, audio, etc.)
