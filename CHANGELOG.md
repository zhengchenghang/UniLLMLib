# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- User context management for per-user secret isolation
- `setCurrentUserId()` – set the active user ID
- `getCurrentUserId()` – retrieve the active user ID
- `clearCurrentUserId()` – clear the active user ID
- `hasCurrentUserId()` – check whether a user ID is configured
- `getAllSecrets()` – list all stored secrets with user scoping support
- `clearAllSecrets()` – clear secrets with user scoping support
- Added `examples/multi-user.ts` demonstrating multi-user usage

### Changed
- `setSecret()` / `getSecret()` / `deleteSecret()` now support user scoping; when a user ID is set, the ID is automatically encoded into the stored secret names
- Updated the API documentation with the new user context section
- Updated the README to describe multi-user functionality

## [1.0.0] - 2024-10-23

### Added
- Initial release
- Support for multiple LLM providers (OpenAI, Qwen, ZhiPu, Moonshot)
- Unified chat interface
- Secure API key storage (via keytar)
- Configuration file management
- Streaming and non-streaming responses
- TypeScript type definitions
- Comprehensive documentation and examples

### Features
- `LLMManager` core class
- `listModels()` – enumerate supported models
- `selectModel()` – choose the active model
- `chat()` – unified chat interface
- `chatSimple()` – simplified non-streaming chat
- `chatStream()` – simplified streaming chat
- Configuration files support `@secret:` placeholders that resolve to secure storage

### Providers
- OpenAI (GPT-4, GPT-3.5)
- Alibaba Qwen
- Zhipu AI (GLM-4)
- Moonshot AI (Kimi)

### Documentation
- README.md – usage guide
- INSTALL.md – installation instructions
- API reference
- Usage examples (basic usage, multi-model comparison, multi-turn conversation)
