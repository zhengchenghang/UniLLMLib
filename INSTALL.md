# Installation Guide

## Basic Installation

```bash
npm install unillm-ts
```

## Keytar Dependency

The library uses `keytar` to store API keys securely. Some platforms require extra system packages before keytar can be installed.

### Windows

Install the Visual Studio Build Tools:

```bash
npm install --global windows-build-tools
```

### macOS

No additional configuration is typically required.

### Linux

UniLLM-TS on Linux uses a dual-layer secure storage approach:
1. **libsecret** (GNOME Keyring/KDE Wallet) - Primary method
2. **Encrypted file storage** - Automatic fallback using AES-256-GCM

#### Ubuntu / Debian
```bash
# Install libsecret and GNOME Keyring (recommended)
sudo apt-get update
sudo apt-get install -y libsecret-1-dev gnome-keyring
```

#### Red Hat / CentOS / Fedora
```bash
# CentOS/RHEL
sudo yum install -y libsecret-devel gnome-keyring

# Fedora
sudo dnf install -y libsecret-devel gnome-keyring
```

#### Arch Linux
```bash
sudo pacman -S libsecret gnome-keyring
```

#### Headless Servers

On headless servers (no desktop environment), libsecret may not be available. UniLLM-TS will automatically use encrypted file storage as a secure fallback.

For detailed Linux setup and troubleshooting, see [Linux Installation Guide](docs/linux-installation.md).

## Optional: Working Without Keytar

If keytar is not available in your environment, consider these alternatives:

1. **Initialize secrets from environment variables**:
   ```typescript
   import { setSecret } from 'unillm-ts';

   await setSecret('openai-default-api_key', process.env.OPENAI_API_KEY ?? '');
   ```
2. **Customize secret management**: extend or replace `src/secrets.ts` to redirect secret storage to environment variables, files, or a cloud secret manager.

> Note: Never commit plaintext secrets to your repository.

## Verify the Installation

```typescript
import llmManager from 'unillm-ts';

async function test() {
  await llmManager.init();
  console.log('Installed models:', llmManager.listModels());
}

test();
```

## FAQ

### Q: What should I do if keytar fails to install?

A: Try the following steps:
1. Ensure the required system dependencies are installed.
2. Use environment variables or temporary plaintext configuration during development only.
3. Ask your system administrator for assistance.

### Q: How do I use the library inside Docker?

A: In Docker containers we recommend using environment variables instead of keytar:

```dockerfile
FROM node:20
ENV OPENAI_API_KEY=your-key
# ... other configuration
```

### Q: Can I use another secret management solution?

A: Yes. You can:
1. Extend `secrets.ts` to implement your own storage backend.
2. Integrate with AWS Secrets Manager, Azure Key Vault, or similar services.
3. Hard-code values in your configuration (not recommended for production; requires modifying `ModelConfig`).
