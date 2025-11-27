# UniLLM-TS Monorepo

> A unified TypeScript library for calling large language models (LLMs) across multiple providers

[![npm version](https://img.shields.io/npm/v/unillm-ts.svg)](https://www.npmjs.com/package/unillm-ts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## 📦 Monorepo Structure

This project is organized as a monorepo with multiple packages:

```
unillm-ts/
├── packages/
│   ├── core/      # Core library - can be imported as a package
│   ├── server/    # RESTful API server wrapping the core
│   └── web/       # Web frontend (coming soon)
├── pnpm-workspace.yaml
└── package.json
```

### Packages

- **[@unillm-ts/core](./packages/core)** - Core library for unified LLM access
- **[@unillm-ts/server](./packages/server)** - Express-based RESTful API server
- **[@unillm-ts/web](./packages/web)** - Web frontend (planned)

## Features

- 🚀 **Lightweight**: No UI layer and no external service dependencies
- 🔄 **Unified Interface**: A consistent chat API for every provider
- 🔌 **Extensible**: Text chat today, ready to expand to other data formats
- 🔒 **Secure Storage**: Encrypt API keys with keytar (desktop) and react-native-keychain (mobile)
- 👥 **Multi-user Ready**: Built-in user context management prevents key leakage between users
- 📦 **Easy Integration**: Install from npm and import with a single line
- ⚙️ **Config Management**: Use templates and instances to manage API keys, models, and hyperparameters
- 🌐 **RESTful API**: Server package provides HTTP endpoints for all core functionality

## Installation

### Prerequisites

```bash
# Install pnpm if you haven't already
npm install -g pnpm
```

### Install Dependencies

```bash
pnpm install
```

## Usage

### Option 1: Use as a Library

Install the core package in your project:

```bash
npm install @unillm-ts/core
# or
pnpm add @unillm-ts/core
```

```typescript
import { LLMManager } from '@unillm-ts/core';

const manager = new LLMManager();
await manager.initialize();

const response = await manager.chat('gpt-3.5-turbo', [
  { role: 'user', content: 'Hello!' }
]);
console.log(response);
```

See the [core package documentation](./packages/core/README.md) for more details.

### Option 2: Use as a Server

Run the API server:

```bash
# Development mode
pnpm dev:server

# Production mode
pnpm build:server
pnpm start:server
```

The server will start on `http://localhost:3000` by default.

**Example API request:**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      { "role": "user", "content": "Hello!" }
    ]
  }'
```

See the [server package documentation](./packages/server/README.md) for API details.

## Development

### Build All Packages

```bash
pnpm build
```

### Build Specific Package

```bash
pnpm build:core
pnpm build:server
```

### Clean Build Artifacts

```bash
pnpm clean
```

### Run Examples

```bash
pnpm examples:core
```

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
- [ ] Build web frontend UI
- [ ] Add comprehensive test coverage

## Project Structure

```
unillm-ts/
├── packages/
│   ├── core/                 # Core library
│   │   ├── src/
│   │   │   ├── manager.ts    # Main LLMManager class
│   │   │   ├── providers/    # Provider implementations
│   │   │   ├── storage/      # Secure storage implementations
│   │   │   ├── types.ts      # Type definitions
│   │   │   └── index.ts      # Public API exports
│   │   ├── examples/         # Usage examples
│   │   ├── build/            # Build configuration
│   │   └── package.json
│   │
│   ├── server/               # API server
│   │   ├── src/
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── middleware/   # Express middleware
│   │   │   └── index.ts      # Server entry point
│   │   └── package.json
│   │
│   └── web/                  # Frontend (planned)
│       └── package.json
│
├── pnpm-workspace.yaml       # Workspace configuration
├── package.json              # Root package.json
├── tsconfig.json             # Shared TypeScript config
└── README.md                 # This file
```

## Configuration Data

- Model definitions: stored in `packages/core/src/config/models.json`
- Template definitions: stored in `packages/core/src/config/templates.json`
- Config instances: persisted at runtime in `~/.unillm/instances.json`
- Current state: stored in `~/.unillm/state.json`

## Platform Support

- **Windows**: Uses `keytar` with Windows Credential Manager
- **macOS**: Uses `keytar` with macOS Keychain
- **Linux**: Uses `libsecret` (GNOME Keyring/KDE Wallet) with encrypted file fallback
- **iOS**: Uses `react-native-keychain` with iOS Keychain
- **Android**: Uses `react-native-keychain` with Android Keystore

## License

MIT

## Contributing

Issues and pull requests are always welcome. Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.
