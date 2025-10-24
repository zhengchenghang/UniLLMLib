# 快速开始

本指南将帮助你在 5 分钟内开始使用 UniLLM-TS，并了解模板 + 实例的配置方式。

## 1. 安装

```bash
npm install unillm-ts
```

## 2. 初始化并查看模板/实例

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

> 小提示：初始化后会在用户目录 `~/.unillm/` 下生成 `instances.json` 和 `state.json`，用于持久化配置实例和当前状态。

## 3. 配置 API 密钥

每个实例的 `secretKeys` 字段会列出需要设置的密钥名称。使用 `setSecret` 写入真实的 API Key：

```typescript
import { setSecret } from 'unillm-ts';

// 默认实例的密钥命名格式: <实例ID>-<字段名>
await setSecret('qwen-default-api_key', 'your-qwen-key');
await setSecret('qwen-default-access_key_id', 'your-aliyun-ak');
await setSecret('qwen-default-access_key_secret', 'your-aliyun-sk');

await setSecret('openai-default-api_key', 'sk-your-openai-key');
```

自定义实例会按生成的实例 ID 命名，例如 `openai-<uuid>-api_key`。你可以通过 `listInstances()` 随时查看。

## 4. 发送第一条消息

```typescript
import llmManager from 'unillm-ts';

async function main() {
  await llmManager.init();

  const instances = llmManager.listInstances();
  const qwen = instances.find(inst => inst.templateId === 'qwen');
  if (!qwen) throw new Error('没有可用的 Qwen 实例');

  await llmManager.setCurrentInstance(qwen.id);
  await llmManager.setCurrentModel('qwen-plus');

  const reply = await llmManager.chatSimple('你好，请介绍一下自己');
  console.log(reply);
}

main().catch(console.error);
```

## 5. 流式响应

```typescript
await llmManager.init();
await llmManager.setCurrentInstance('openai-default');
await llmManager.setCurrentModel('gpt-4o');

const stream = await llmManager.chatStream('写一首关于春天的诗');
for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

## 6. 多轮对话

```typescript
import llmManager, { Message } from 'unillm-ts';

await llmManager.init();
await llmManager.setCurrentInstance('qwen-default');
await llmManager.setCurrentModel('qwen-plus');

const history: Message[] = [
  { role: 'system', content: '你是一个友好的助手' },
  { role: 'user', content: '什么是 TypeScript？' },
];

const response = await llmManager.chat({ messages: history, stream: false });
if (!('content' in response)) throw new Error('Unexpected stream response');

history.push({ role: 'assistant', content: response.content });
console.log(response.content);
```

## 7. 切换模型

```typescript
await llmManager.init();
await llmManager.setCurrentInstance('openai-default');

console.log('可用模型:', llmManager.getCurrentInstanceModels().map(m => m.id));
await llmManager.setCurrentModel('gpt-4o');

const answer = await llmManager.chatSimple('Hello!');
console.log(answer);
```

也可以在单次调用时传入 `selector` 参数：

```typescript
const reply = await llmManager.chatSimple('Hello!', { modelId: 'glm-4' });
const special = await llmManager.chatSimple('Ping', { instanceId: 'openai-default', modelId: 'gpt-4o' });
```

## 8. 完整示例

```typescript
import llmManager, { setSecret } from 'unillm-ts';

async function main() {
  // 1. 初始化（首次运行前请先 setSecret）
  await llmManager.init();

  // 2. 查看支持的模型与模板
  console.log('模型列表:', llmManager.getModelsInfo().map(m => m.id));
  console.log('模板:', llmManager.getConfigTemplates().map(t => t.id));

  // 3. 选择实例与模型
  const instances = llmManager.listInstances();
  const openai = instances.find(inst => inst.templateId === 'openai');
  if (!openai) throw new Error('未找到 OpenAI 实例');

  await llmManager.setCurrentInstance(openai.id);
  await llmManager.setCurrentModel('gpt-4o');

  // 4. 简单对话
  console.log('\n=== 简单对话 ===');
  console.log(await llmManager.chatSimple('什么是人工智能？'));

  // 5. 流式对话
  console.log('\n=== 流式对话 ===');
  const stream = await llmManager.chatStream('写一个 Hello World 程序');
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  console.log('\n');

  // 6. 高级用法 - 带系统提示
  console.log('\n=== 带系统提示的对话 ===');
  const response = await llmManager.chat({
    messages: [
      { role: 'system', content: '你是一个专业的 TypeScript 开发者' },
      { role: 'user', content: '如何在 TS 中使用泛型？' },
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
    console.log('\nToken 使用:', response.usage);
  }
}

main().catch(console.error);
```

## 9. 常见问题

### Q: 如何获取密钥名称？
初始化后调用 `listInstances()`，查看实例的 `secretKeys` 字段即可。

### Q: 数据存储在哪里？
默认在 `~/.unillm/` 目录下的 `instances.json` 与 `state.json`。你可以备份或删除它们来重置配置。

### Q: 可以修改模板或模型吗？
模板与模型定义位于包内的 `src/config/*.json`，仅在构建阶段修改。运行时可以创建新的实例来自定义配置覆盖。

### Q: keytar 安装失败怎么办？
目前需要系统支持 `keytar` 才能安全存储密钥。开发环境下可临时使用 `setSecret` 存放假的值，或改用环境变量方案。

### Q: 支持哪些模型？
查看 `llmManager.getModelsInfo()` 或参考 README。默认包含 OpenAI、通义千问、智谱、Moonshot、讯飞星火的典型模型。

## 10. 下一步

- 阅读 [README](./README.md) 了解更多
- 查阅 [API 参考](./API.md)
- 浏览 [示例代码](./examples/)
