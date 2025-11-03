# Quick Start

This guide walks you through getting started with UniLLM-TS in five minutes and explains how templates and instances work together.

## 1. Install

```bash
npm install unillm-ts
```

## 2. Initialize and Inspect Templates/Instances

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

> Tip: After initialization the library creates `instances.json` and `state.json` under `~/.unillm/` to persist configuration instances and current state.

## 3. Provide API Keys

Each instance exposes a `secretKeys` field that lists the secret names you must set. Use `setSecret` to store real API keys:

```typescript
import { setSecret } from 'unillm-ts';

// Default instance key naming: <instanceId>-<field>
await setSecret('qwen-default-api_key', 'your-qwen-key');
await setSecret('qwen-default-access_key_id', 'your-aliyun-ak');
await setSecret('qwen-default-access_key_secret', 'your-aliyun-sk');

await setSecret('openai-default-api_key', 'sk-your-openai-key');
```

Custom instances follow the generated instance ID, for example `openai-<uuid>-api_key`. Call `listInstances()` whenever you need to confirm the names.

## 4. Send Your First Message

```typescript
import llmManager from 'unillm-ts';

async function main() {
  await llmManager.init();

  const instances = llmManager.listInstances();
  const qwen = instances.find(inst => inst.templateId === 'qwen');
  if (!qwen) throw new Error('No Qwen instance available.');

  await llmManager.setCurrentInstance(qwen.id);
  await llmManager.setCurrentModel('qwen-plus');

  const reply = await llmManager.chatSimple('Hello, can you introduce yourself?');
  console.log(reply);
}

main().catch(console.error);
```

## 5. Streaming Responses

```typescript
await llmManager.init();
await llmManager.setCurrentInstance('openai-default');
await llmManager.setCurrentModel('gpt-4o');

const stream = await llmManager.chatStream('Write a poem about spring.');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

## 6. Multi-turn Conversations

```typescript
import llmManager, { Message } from 'unillm-ts';

await llmManager.init();
await llmManager.setCurrentInstance('qwen-default');
await llmManager.setCurrentModel('qwen-plus');

const history: Message[] = [
  { role: 'system', content: 'You are a friendly assistant.' },
  { role: 'user', content: 'What is TypeScript?' },
];

const response = await llmManager.chat({ messages: history, stream: false });
if (!('content' in response)) throw new Error('Unexpected stream response');

history.push({ role: 'assistant', content: response.content });
console.log(response.content);
```

## 7. Switch Models

```typescript
await llmManager.init();
await llmManager.setCurrentInstance('openai-default');

console.log('Available models:', llmManager.getCurrentInstanceModels().map(m => m.id));
await llmManager.setCurrentModel('gpt-4o');

const answer = await llmManager.chatSimple('Hello!');
console.log(answer);
```

You can also specify a `selector` for ad-hoc calls:

```typescript
const reply = await llmManager.chatSimple('Hello!', { modelId: 'glm-4' });
const special = await llmManager.chatSimple('Ping', { instanceId: 'openai-default', modelId: 'gpt-4o' });
```

## 8. End-to-end Example

```typescript
import llmManager, { setSecret } from 'unillm-ts';

async function main() {
  // 1. Initialize (make sure to call setSecret beforehand)
  await llmManager.init();

  // 2. Inspect supported models and templates
  console.log('Model IDs:', llmManager.getModelsInfo().map(m => m.id));
  console.log('Templates:', llmManager.getConfigTemplates().map(t => t.id));

  // 3. Choose an instance and model
  const instances = llmManager.listInstances();
  const openai = instances.find(inst => inst.templateId === 'openai');
  if (!openai) throw new Error('OpenAI instance not found.');

  await llmManager.setCurrentInstance(openai.id);
  await llmManager.setCurrentModel('gpt-4o');

  // 4. Simple chat
  console.log('\n=== Simple Chat ===');
  console.log(await llmManager.chatSimple('What is artificial intelligence?'));

  // 5. Streaming chat
  console.log('\n=== Streaming Chat ===');
  const stream = await llmManager.chatStream('Write a Hello World program.');
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  console.log('\n');

  // 6. Advanced usage with a system prompt
  console.log('\n=== Chat with System Prompt ===');
  const response = await llmManager.chat({
    messages: [
      { role: 'system', content: 'You are a professional TypeScript developer.' },
      { role: 'user', content: 'How do I use generics in TypeScript?' },
    ],
    temperature: 0.7,
    max_tokens: 500,
    stream: false,
  });

  if (!('content' in response)) {
    throw new Error('Unexpected stream response');
  }

  console.log(response.content);
  if (response.usage) {
    console.log('\nToken usage:', response.usage);
  }
}

main().catch(console.error);
```

## 9. FAQ

### Q: How do I discover secret names?
Call `listInstances()` after initialization and inspect each instance's `secretKeys` field.

### Q: Where is data stored?
By default in the `~/.unillm/` directory (`instances.json` and `state.json`). Back up or delete those files if you need to reset your configuration.

### Q: Can I modify templates or models?
Templates and models live in `src/config/*.json` and should be edited during development only. At runtime you can create new instances and override configuration values.

### Q: What if keytar fails to install?
Keytar requires OS-specific dependencies. During development you can temporarily store placeholder values with `setSecret`, or fall back to environment variables.

### Q: Which models are supported?
Use `llmManager.getModelsInfo()` or check the README. The bundle currently includes representative models from OpenAI, Qwen, Zhipu, Moonshot, and iFlytek Spark.

## 10. Where to Go Next

- Read the [README](./README.md) for more details
- Consult the [API reference](./API.md)
- Explore the [example scripts](./examples/)
