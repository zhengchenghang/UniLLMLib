# @unillm-ts/core

Unified TypeScript library for multiple LLM providers (OpenAI, Qwen, ZhiPu, Moonshot, Spark).

## Installation

```bash
npm install @unillm-ts/core
# or
pnpm add @unillm-ts/core
```

## Usage

```typescript
import { LLMManager } from '@unillm-ts/core';

const manager = new LLMManager();
await manager.initialize();

const response = await manager.chat('gpt-3.5-turbo', [
  { role: 'user', content: 'Hello!' }
]);
console.log(response);
```

For more examples, see the [examples](./examples) directory.

## Documentation

This package is part of the unillm-ts monorepo. For full documentation, see the [main repository](../../README.md).

## License

MIT
