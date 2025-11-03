# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- 用户上下文管理功能，支持多用户场景下的密钥隔离
- `setCurrentUserId()` - 设置当前用户ID
- `getCurrentUserId()` - 获取当前用户ID
- `clearCurrentUserId()` - 清除当前用户ID
- `hasCurrentUserId()` - 检查是否已设置用户ID
- `getAllSecrets()` - 获取所有密钥列表（支持用户隔离）
- `clearAllSecrets()` - 清除所有密钥（支持用户隔离）
- 新增多用户使用示例 `examples/multi-user.ts`

### Changed
- `setSecret()` / `getSecret()` / `deleteSecret()` 现在支持用户隔离，设置用户ID后会自动将用户ID编码到密钥名称中
- 更新API文档，添加用户上下文管理部分
- 更新README，添加多用户功能说明

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

