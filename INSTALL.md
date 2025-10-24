# 安装说明

## 基础安装

```bash
npm install unillm-ts
```

## Keytar 依赖

本库使用 `keytar` 进行 API Key 的安全存储。在某些平台上，keytar 需要额外的系统依赖。

### Windows

需要安装 Visual Studio Build Tools：

```bash
npm install --global windows-build-tools
```

### macOS

通常无需额外配置。

### Linux

需要安装 libsecret：

#### Ubuntu/Debian
```bash
sudo apt-get install libsecret-1-dev
```

#### Red Hat/Fedora
```bash
sudo yum install libsecret-devel
```

#### Arch Linux
```bash
sudo pacman -S libsecret
```

## 可选：不使用 Keytar

如果您的环境不支持 keytar，可以：

1. **使用环境变量初始化密钥**：
   ```typescript
   import { setSecret } from 'unillm-ts';

   await setSecret('openai-default-api_key', process.env.OPENAI_API_KEY ?? '');
   ```
2. **自定义密钥管理**：扩展或替换 `src/secrets.ts`，将密钥读写重定向到环境变量、文件或云密钥服务。

> 注意：请避免在代码仓库中保存明文密钥。

## 验证安装

```typescript
import llmManager from 'unillm-ts';

async function test() {
  await llmManager.init();
  console.log('Installed models:', llmManager.listModels());
}

test();
```

## 常见问题

### Q: keytar 安装失败怎么办？

A: 如果 keytar 安装失败，您可以：
1. 检查系统依赖是否已安装
2. 使用环境变量或明文配置（仅开发环境）
3. 联系系统管理员获取帮助

### Q: 如何在 Docker 中使用？

A: 在 Docker 容器中，推荐使用环境变量而非 keytar：

```dockerfile
FROM node:20
ENV OPENAI_API_KEY=your-key
# ... 其他配置
```

### Q: 可以使用其他密钥管理方案吗？

A: 可以。您可以：
1. 扩展 `secrets.ts` 实现自己的密钥管理
2. 使用 AWS Secrets Manager、Azure Key Vault 等云服务
3. 直接在代码中配置（需修改 ModelConfig）

