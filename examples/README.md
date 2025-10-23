# 示例代码

这个目录包含了 UniLLM-TS 的使用示例。

## 运行示例

首先，确保已安装依赖：

```bash
npm install
```

然后，设置你的 API Keys：

```typescript
// 使用 Node.js 运行以下代码设置 API Key
import { setSecret } from 'unillm-ts';

await setSecret('qwen-api-key', 'your-qwen-api-key');
await setSecret('openai-api-key', 'your-openai-api-key');
// ... 其他 API Keys
```

## 示例列表

### 1. basic.ts - 基础使用

演示了库的基本功能：
- 初始化
- 查询模型列表
- 选择模型
- 简单对话
- 流式对话
- 高级对话接口

运行：
```bash
npx ts-node examples/basic.ts
```

### 2. multi-model.ts - 多模型对比

演示如何使用不同的模型回答同一个问题，方便对比各模型的表现。

运行：
```bash
npx ts-node examples/multi-model.ts
```

### 3. conversation.ts - 多轮对话

演示如何维护对话历史，实现多轮对话功能。

运行：
```bash
npx ts-node examples/conversation.ts
```

## 自定义示例

你可以基于这些示例创建自己的应用：

```typescript
import llmManager from 'unillm-ts';

async function myApp() {
  await llmManager.init();
  
  // 你的代码...
}

myApp();
```

## 注意事项

1. **API Key 安全**: 不要在代码中硬编码 API Key
2. **错误处理**: 生产环境中应该添加完善的错误处理
3. **Rate Limiting**: 注意各提供商的 API 调用频率限制
4. **成本控制**: 注意 Token 使用量和费用

## 更多资源

- [完整文档](../README.md)
- [API 参考](../API.md)
- [快速开始](../QUICKSTART.md)

