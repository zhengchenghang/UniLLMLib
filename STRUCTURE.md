# 项目结构

```
UniLLM-TS-Lib/
├── src/                          # 源代码目录
│   ├── index.ts                  # 主入口文件，导出所有公共 API
│   ├── manager.ts                # LLMManager 核心管理类
│   ├── types.ts                  # TypeScript 类型定义
│   ├── secrets.ts                # 安全存储模块（keytar）
│   ├── config/                   # 配置相关
│   │   ├── loader.ts            # 模型/模板/实例的加载与持久化
│   │   ├── models.json          # 支持模型定义（静态）
│   │   └── templates.json       # 配置模板定义（静态）
│   └── providers/               # LLM 提供商实现
│       ├── base.ts              # 抽象基类
│       ├── openai.ts            # OpenAI 实现
│       ├── qwen.ts              # 阿里云通义千问实现
│       ├── zhipu.ts             # 智谱 AI 实现
│       ├── moonshot.ts          # Moonshot Kimi 实现
│       └── spark.ts             # 讯飞星火实现（需完善）
│
├── examples/                     # 使用示例
│   ├── basic.ts                 # 基础使用示例
│   ├── multi-model.ts           # 多模型对比示例
│   ├── conversation.ts          # 多轮对话示例
│   └── README.md                # 示例说明
│
├── dist/                        # 编译输出目录（npm 发布）
│   ├── index.js
│   ├── index.d.ts
│   └── ...
│
├── package.json                 # npm 包配置
├── tsconfig.json                # TypeScript 编译配置
├── README.md                    # 主文档
├── QUICKSTART.md                # 快速开始指南
├── API.md                       # API 参考文档
├── INSTALL.md                   # 安装说明
├── CHANGELOG.md                 # 更新日志
├── LICENSE                      # MIT 许可证
├── STRUCTURE.md                 # 本文件
├── .gitignore                   # Git 忽略配置
└── .npmignore                   # npm 发布忽略配置
```

## 核心模块说明

### src/index.ts
- 库的主入口点
- 导出 `LLMManager` 类
- 导出所有类型定义
- 导出 `setSecret` 和 `getSecret` 工具函数
- 提供默认单例实例 `defaultManager`

### src/manager.ts
- `LLMManager` 类：核心管理类
- 负责：
  - 初始化和配置加载
  - 模型管理和切换
  - 统一的对话接口
  - Provider 的动态加载

### src/types.ts
- 所有 TypeScript 接口定义：
  - `ModelConfig`: Provider 调用时使用的配置
  - `SupportedModel` / `ModelInfo`: 模型描述信息
  - `ConfigTemplate` / `TemplateSecretField`: 模板定义
  - `ConfigInstance` / `ConfigInstanceSummary`: 配置实例结构
  - `InstanceCreationOptions` / `InstanceUpdatePayload`: 实例管理输入
  - `Message` / `MessageContent`: 消息与内容表示
  - `ChatCompletionOptions` / `ChatCompletionResponse`: 对话输入输出

### src/secrets.ts
- 安全存储管理
- 使用 `keytar` 库与系统密钥链集成
- 提供 `setSecret` 和 `getSecret` 函数
- `resolveValue` 函数解析配置中的 `@secret:` 引用

### src/config/loader.ts
- 负责加载静态的模型与模板 JSON
- 在用户目录 `~/.unillm` 中读写实例与状态 JSON
- 提供 `loadSupportedModels`、`loadTemplates`、`loadInstances`、`saveInstances`、`loadState`、`saveState` 等工具函数

### src/providers/base.ts
- `LLMProvider` 抽象基类
- 定义了所有 Provider 必须实现的接口
- `chatCompletion` 抽象方法

### src/providers/*.ts
- 各个 LLM 提供商的具体实现
- 每个 Provider 继承 `LLMProvider`
- 实现 `chatCompletion` 方法
- 处理流式和非流式响应
- 实现 Provider 特定的 API 调用逻辑

## 设计模式

### 1. 单例模式
- 提供默认的 `defaultManager` 实例
- 也支持创建自定义实例

### 2. 策略模式
- `LLMProvider` 作为策略接口
- 不同的 Provider 实现不同的策略
- `LLMManager` 根据配置选择合适的策略

### 3. 工厂模式
- 动态导入 Provider
- `PROVIDERS` 对象充当工厂

## 扩展性设计

### 添加新的 Provider

1. 在 `src/providers/` 下创建新文件，如 `newprovider.ts`
2. 继承 `LLMProvider` 类
3. 实现 `chatCompletion` 方法
4. 在 `manager.ts` 的 `PROVIDERS` 中注册

示例：
```typescript
// src/providers/newprovider.ts
import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';

export class NewProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    // 实现逻辑
  }
}
```

```typescript
// src/manager.ts 中添加
const PROVIDERS: Record<string, any> = {
  // ... 现有 providers
  newprovider: () => import('./providers/newprovider').then(m => m.NewProvider),
};
```

### 添加新的消息类型

在 `types.ts` 中扩展 `MessageContent` 接口：

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

## 构建和发布

### 开发
```bash
npm install
npm run dev  # 监听模式
```

### 构建
```bash
npm run build
```

### 发布
```bash
npm publish
```

## 依赖关系

### 运行时依赖
- `keytar`: 系统密钥链集成（可选，可按需安装）

### 开发依赖
- `typescript`: TypeScript 编译器
- `@types/node`: Node.js 类型定义
- `ts-node`: 示例运行工具

## 配置文件

### tsconfig.json
- Target: ES2020
- Module: CommonJS
- 包含 DOM 类型（用于 fetch）
- 严格模式
- 输出声明文件

### package.json
- `main`: dist/index.js（编译后的入口）
- `types`: dist/index.d.ts（类型声明）
- `files`: 指定发布文件
- `engines`: Node.js >= 16.0.0

## 最佳实践

1. **错误处理**: 所有异步方法都应该使用 try-catch
2. **类型安全**: 充分利用 TypeScript 类型系统
3. **配置验证**: 在 init 时验证配置有效性
4. **安全性**: 敏感信息使用 keytar 或环境变量
5. **可测试性**: 支持依赖注入，便于单元测试
6. **文档**: 保持代码和文档同步更新

## 待优化项

1. 添加单元测试
2. 完善讯飞星火的 WebSocket 实现
3. 添加重试机制
4. 添加请求超时控制
5. 添加日志系统
6. 支持自定义 HTTP 客户端
7. 添加更多 Provider
8. 支持多模态输入（图片、音频等）

