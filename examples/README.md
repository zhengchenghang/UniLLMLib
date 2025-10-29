# 示例代码

这个目录包含了 UniLLM-TS 的使用示例。

## 运行示例

1. 安装依赖：

   ```bash
   npm install
   ```

2. 配置凭证：
   - **推荐** 设置以下环境变量，示例脚本会自动读取：
     - `OPENAI_API_KEY`
     - `QWEN_API_KEY`
     - `QWEN_ACCESS_KEY_ID`
     - `QWEN_ACCESS_KEY_SECRET`
     - `ZHIPU_API_KEY`
     - `MOONSHOT_API_KEY`
     - `SPARK_APP_ID`
     - `SPARK_API_KEY`
     - `SPARK_API_SECRET`
   - 或运行 `npm run examples:setup` 查看各实例缺少的字段并获取写入指引。

在某些尚未实现安全存储的平台上，示例会自动回退到 `~/.unillm/examples-secrets.json` 文件保存凭证，该方式仅适用于本地调试，请勿用于生产环境。

## 示例列表

### 1. basic.ts - 基础使用

演示库的核心功能：
- 初始化
- 查询模型列表
- 选择模型
- 简单对话
- 流式对话
- 高级对话接口

运行：
```bash
npm run examples:basic
```

### 2. multi-model.ts - 多模型对比

演示如何使用不同的模型回答同一个问题，方便对比各模型的表现。

运行：
```bash
npm run examples:multi-model
```

### 3. conversation.ts - 多轮对话

演示如何维护对话历史，实现多轮对话功能。

运行：
```bash
npm run examples:conversation
```

### 4. setup-keys.ts - 凭证配置助手

帮助你检查当前凭证状态，并给出环境变量或 `setSecret` 写入示例。

运行：
```bash
npm run examples:setup
```

你也可以一次性运行所有示例（除凭证检查外）：

```bash
npm run examples:all
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
