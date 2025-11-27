# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Linux Secure Storage Implementation** (`src/storage/linux.ts`)
  - Dual-layer architecture: libsecret (primary) + encrypted file storage (fallback)
  - libsecret integration with GNOME Keyring/KDE Wallet via keytar
  - AES-256-GCM encrypted file storage as secure fallback
  - PBKDF2 key derivation (100,000 iterations) based on machine ID + username
  - Machine ID binding to prevent encrypted file migration
  - File permissions (600/700) for enhanced security
  - Automatic backend detection and switching
  - Support for Ubuntu, Debian, CentOS, RHEL, Fedora, Arch Linux
  - Headless server and Docker container support via encrypted file storage
- Linux storage example in `examples/linux-storage.ts`
- Comprehensive Linux storage test suite in `examples/test-linux-storage.ts`
- Detailed Linux storage documentation:
  - `docs/linux-storage.md` – technical implementation details
  - `docs/linux-installation.md` – installation and troubleshooting guide
  - `docs/LINUX_KEYSTORE_IMPLEMENTATION.md` – feature overview
- iOS Keychain storage implementation using react-native-keychain
- Secure credential storage for iOS devices with biometric authentication support
- iOS-specific storage methods: `canImplyAuthentication()` and `getSupportedBiometryType()`
- Enhanced TypeScript definitions for react-native-keychain
- iOS storage example in `examples/ios-keychain-storage.ts`
- Comprehensive iOS Keychain documentation in `docs/ios-keychain-storage.md`
- User context management for per-user secret isolation
- `setCurrentUserId()` – set the active user ID
- `getCurrentUserId()` – retrieve the active user ID
- `clearCurrentUserId()` – clear the active user ID
- `hasCurrentUserId()` – check whether a user ID is configured
- `getAllSecrets()` – list all stored secrets with user scoping support
- `clearAllSecrets()` – clear secrets with user scoping support
- Added `examples/multi-user.ts` demonstrating multi-user usage
- Exported storage classes and interfaces for advanced usage

### Changed
- Updated `src/storage/factory.ts` to integrate Linux storage
- Updated `src/storage/other-platforms.ts` to remove Linux placeholder
- Updated `src/index.ts` to export storage-related classes and interfaces
- Updated `.gitignore` to exclude `.unillm/` directory (secret storage location)
- Updated `INSTALL.md` with comprehensive Linux installation instructions
- Updated `README.md` to describe Linux secure storage support
- Added npm scripts: `examples:linux-storage` and `test:linux-storage`
- `setSecret()` / `getSecret()` / `deleteSecret()` now support user scoping; when a user ID is set, the ID is automatically encoded into the stored secret names
- Updated the API documentation with the new user context section
- Enhanced README with iOS/React Native installation instructions
- Updated package.json to include react-native-keychain dependency
- Added iOS and React Native related keywords

### Security
- Implemented AES-256-GCM authenticated encryption for Linux file storage
- Random IV generation for each encryption operation
- Authentication tags to prevent tampering
- PBKDF2 key derivation with 100,000 iterations
- Machine ID binding to prevent cross-machine decryption
- Strict file permissions (600 for files, 700 for directories)

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
