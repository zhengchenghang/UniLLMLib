# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-10-23

### Added
- 初始版本发布
- 支持多个 LLM 提供商（OpenAI, Qwen, ZhiPu, Moonshot）
- 统一的对话接口
- 安全的 API Key 存储（使用 keytar）
- 配置文件管理
- 流式和非流式响应支持
- TypeScript 类型定义
- 完整的文档和示例

### Features
- `LLMManager` 核心类
- `listModels()` - 查询支持的模型
- `selectModel()` - 选择当前模型
- `chat()` - 统一对话接口
- `chatSimple()` - 简化的非流式对话
- `chatStream()` - 简化的流式对话
- 配置文件支持 `@secret:` 语法引用安全存储

### Providers
- OpenAI (GPT-4, GPT-3.5)
- 阿里云通义千问 (Qwen)
- 智谱 AI (GLM-4)
- Moonshot AI (Kimi)

### Documentation
- README.md - 使用指南
- INSTALL.md - 安装说明
- API 文档
- 使用示例（基础、多模型、多轮对话）

