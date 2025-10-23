# 快速开始

这个指南将帮助你在 5 分钟内开始使用 UniLLM-TS。

## 1. 安装

```bash
npm install unillm-ts
```

## 2. 配置 API Key

选择以下方式之一配置你的 API Key：

### 方式 A：使用安全存储（推荐）

```typescript
import { setSecret } from 'unillm-ts';

// 只需要设置一次
await setSecret('qwen-api-key', 'your-qwen-api-key-here');
```

### 方式 B：使用配置文件

创建 `llm_config.yaml`：

```yaml
models:
  qwen-plus:
    provider: qwen
    model: qwen-plus
    api_key: your-api-key-here  # 直接写入（仅用于测试）

default_model: qwen-plus
```

## 3. 开始使用

### 最简单的例子

```typescript
import llmManager from 'unillm-ts';

async function main() {
  // 初始化
  await llmManager.init();
  
  // 发送消息
  const response = await llmManager.chatSimple('你好，请介绍一下自己');
  console.log(response);
}

main();
```

### 流式输出

```typescript
import llmManager from 'unillm-ts';

async function main() {
  await llmManager.init();
  
  const stream = await llmManager.chatStream('写一首关于春天的诗');
  
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
}

main();
```

### 多轮对话

```typescript
import llmManager, { Message } from 'unillm-ts';

async function main() {
  await llmManager.init();
  
  const messages: Message[] = [
    { role: 'system', content: '你是一个友好的助手' },
    { role: 'user', content: '什么是 TypeScript？' }
  ];
  
  const response = await llmManager.chat({
    messages,
    temperature: 0.7,
    stream: false
  });
  
  if ('content' in response) {
    console.log(response.content);
  }
}

main();
```

## 4. 切换模型

```typescript
import llmManager from 'unillm-ts';

async function main() {
  await llmManager.init();
  
  // 查看可用模型
  console.log('可用模型:', llmManager.listModels());
  
  // 切换到 GPT-4
  llmManager.selectModel('gpt-4');
  
  const response = await llmManager.chatSimple('Hello!');
  console.log(response);
}

main();
```

## 5. 完整示例

```typescript
import llmManager, { setSecret } from 'unillm-ts';

async function main() {
  // 1. 设置 API Key（首次运行）
  // await setSecret('qwen-api-key', 'your-key');
  
  // 2. 初始化
  await llmManager.init();
  
  // 3. 查看支持的模型
  const models = llmManager.listModels();
  console.log('支持的模型:', models);
  
  // 4. 选择模型
  llmManager.selectModel('qwen-plus');
  console.log('当前模型:', llmManager.getCurrentModel());
  
  // 5. 简单对话
  console.log('\n=== 简单对话 ===');
  const answer1 = await llmManager.chatSimple('什么是人工智能？');
  console.log(answer1);
  
  // 6. 流式对话
  console.log('\n=== 流式对话 ===');
  const stream = await llmManager.chatStream('写一个 Hello World 程序');
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
  console.log('\n');
  
  // 7. 高级用法 - 带系统提示
  console.log('\n=== 带系统提示的对话 ===');
  const response = await llmManager.chat({
    messages: [
      { role: 'system', content: '你是一个专业的 TypeScript 开发者' },
      { role: 'user', content: '如何在 TS 中使用泛型？' }
    ],
    temperature: 0.7,
    max_tokens: 500,
    stream: false
  });
  
  if ('content' in response) {
    console.log(response.content);
    if (response.usage) {
      console.log('\nToken 使用:', response.usage);
    }
  }
}

main().catch(console.error);
```

## 下一步

- 阅读 [完整文档](./README.md)
- 查看 [API 参考](./API.md)
- 浏览 [示例代码](./examples/)
- 了解 [配置选项](./README.md#配置文件说明)

## 常见问题

### Q: 如何获取 API Key？

- **通义千问**: https://dashscope.console.aliyun.com/
- **OpenAI**: https://platform.openai.com/api-keys
- **智谱 AI**: https://open.bigmodel.cn/
- **Moonshot**: https://platform.moonshot.cn/

### Q: keytar 安装失败怎么办？

如果无法安装 keytar，可以直接在配置文件中使用明文 API Key（仅用于开发测试）：

```yaml
models:
  qwen-plus:
    provider: qwen
    model: qwen-plus
    api_key: your-api-key-here
```

### Q: 如何添加自定义模型？

在配置文件中添加新的模型配置：

```yaml
models:
  my-custom-model:
    provider: openai  # 使用兼容 OpenAI 接口的提供商
    model: custom-model-name
    api_key: @secret:custom-key
    base_url: https://your-api.com/v1
```

### Q: 支持哪些模型？

目前支持：
- OpenAI (GPT-4, GPT-3.5, etc.)
- 阿里云通义千问
- 智谱 AI GLM-4
- Moonshot Kimi

更多提供商正在陆续支持中。

## 需要帮助？

- [GitHub Issues](https://github.com/your-repo/unillm-ts/issues)
- [文档](./README.md)
- [示例](./examples/)

