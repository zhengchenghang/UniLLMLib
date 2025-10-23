# 贡献指南

感谢您对 UniLLM-TS 的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告问题

如果您发现了 Bug 或有功能建议：

1. 先搜索 [Issues](https://github.com/your-repo/unillm-ts/issues) 确认问题未被报告
2. 创建新 Issue，描述清楚：
   - 问题的详细描述
   - 复现步骤
   - 期望行为
   - 实际行为
   - 环境信息（Node 版本、OS 等）

### 提交代码

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/unillm-ts.git
   cd unillm-ts
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **开发**
   ```bash
   npm run dev  # 启动监听模式
   ```

5. **测试**
   - 确保代码没有 linter 错误
   - 测试你的改动
   - 添加必要的单元测试（如果适用）

6. **提交**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # 或
   git commit -m "fix: fix bug description"
   ```

   提交信息格式：
   - `feat:` 新功能
   - `fix:` Bug 修复
   - `docs:` 文档更新
   - `style:` 代码格式（不影响功能）
   - `refactor:` 重构
   - `test:` 测试相关
   - `chore:` 构建/工具相关

7. **推送并创建 PR**
   ```bash
   git push origin your-branch-name
   ```
   
   然后在 GitHub 上创建 Pull Request。

## 开发指南

### 项目结构

请查看 [STRUCTURE.md](./STRUCTURE.md) 了解项目结构。

### 添加新的 Provider

1. 在 `src/providers/` 创建新文件
2. 继承 `LLMProvider` 抽象类
3. 实现 `chatCompletion` 方法
4. 在 `manager.ts` 中注册
5. 更新配置文件示例
6. 添加文档

示例：
```typescript
// src/providers/mynewprovider.ts
import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';

export class MyNewProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    const { api_key, model } = this.config;
    
    // 实现 API 调用逻辑
    
    if (options.stream) {
      return this.handleStream(response);
    } else {
      return {
        content: 'response content',
        role: 'assistant',
      };
    }
  }

  private async *handleStream(response: Response): AsyncGenerator<string> {
    // 实现流式响应处理
  }
}
```

### 代码规范

- 使用 TypeScript
- 遵循现有代码风格
- 添加适当的注释
- 导出的函数/类添加 JSDoc 注释
- 保持代码简洁易读

### 测试

- 测试你的改动
- 确保现有功能不受影响
- 添加新的测试用例（如果适用）

### 文档

如果你的改动影响了使用方式：
- 更新 README.md
- 更新 API.md
- 更新相关示例
- 更新 CHANGELOG.md

## 提 PR 检查清单

在提交 PR 前，请确保：

- [ ] 代码符合项目规范
- [ ] 没有 TypeScript 编译错误
- [ ] 没有 linter 错误
- [ ] 测试通过
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] 提交信息清晰明确

## 优先级需求

我们特别欢迎以下方面的贡献：

### 高优先级
1. **单元测试**: 添加完整的测试覆盖
2. **讯飞星火**: 完善 WebSocket 实现
3. **错误处理**: 改进错误提示和处理
4. **文档**: 改进文档和示例

### 中优先级
1. **新 Provider**: 添加更多 LLM 提供商支持
2. **重试机制**: 添加自动重试功能
3. **超时控制**: 添加请求超时设置
4. **日志系统**: 添加可配置的日志

### 低优先级
1. **多模态**: 支持图片、音频等输入
2. **流式优化**: 改进流式响应处理
3. **性能优化**: 提升性能和内存使用

## 行为准则

- 尊重所有贡献者
- 建设性的反馈
- 友好和包容的态度
- 专注于项目改进

## 获取帮助

如果您有任何问题：

1. 查看现有文档
2. 搜索 Issues
3. 创建新 Issue 提问
4. 加入讨论

## 许可证

贡献的代码将采用 MIT 许可证。

## 感谢

感谢所有为项目做出贡献的开发者！

