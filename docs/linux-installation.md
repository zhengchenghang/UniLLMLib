# Linux平台安装指南

本指南介绍如何在各种Linux发行版上安装和配置UniLLM-TS，以便使用安全的密钥存储功能。

## 快速安装

### Ubuntu / Debian

```bash
# 1. 安装系统依赖（推荐，用于libsecret支持）
sudo apt-get update
sudo apt-get install -y libsecret-1-dev gnome-keyring

# 2. 安装UniLLM-TS
npm install unillm-ts

# 3. 验证安装
npm run examples:linux-storage
```

### CentOS / RHEL

```bash
# 1. 安装系统依赖
sudo yum install -y libsecret-devel gnome-keyring

# 2. 安装UniLLM-TS
npm install unillm-ts

# 3. 验证安装
npm run examples:linux-storage
```

### Fedora

```bash
# 1. 安装系统依赖
sudo dnf install -y libsecret-devel gnome-keyring

# 2. 安装UniLLM-TS
npm install unillm-ts

# 3. 验证安装
npm run examples:linux-storage
```

### Arch Linux

```bash
# 1. 安装系统依赖
sudo pacman -S libsecret gnome-keyring

# 2. 安装UniLLM-TS
npm install unillm-ts

# 3. 验证安装
npm run examples:linux-storage
```

## 详细说明

### 系统依赖说明

#### libsecret-1-dev (Ubuntu/Debian) / libsecret-devel (CentOS/Fedora)

这是libsecret的开发库，用于编译`keytar`模块。libsecret提供了访问Secret Service API的接口。

**作用**:
- 允许应用程序访问系统密钥环
- 提供统一的密钥存储接口
- 支持GNOME Keyring、KDE Wallet等后端

#### GNOME Keyring

GNOME桌面环境的密钥管理服务，是libsecret的主要后端实现。

**作用**:
- 安全存储密码和密钥
- 与用户登录密码集成
- 提供图形界面管理工具

**状态检查**:
```bash
# 检查GNOME Keyring是否运行
ps aux | grep gnome-keyring

# 启动GNOME Keyring（如果未运行）
gnome-keyring-daemon --start
```

### 安装验证

#### 方法1：运行示例

```bash
# 克隆项目或在项目目录中
npm run examples:linux-storage
```

预期输出：
```
=== Linux安全存储示例 ===

1. 存储后端检查
   当前使用的后端: libsecret
   ✓ 使用libsecret (GNOME Keyring/KDE Wallet)
   这是最安全的选项，密钥由系统密钥环管理
...
```

#### 方法2：运行测试

```bash
npm run test:linux-storage
```

预期输出：
```
========================================
     Linux存储功能测试
========================================

=== 测试存储后端 ===
当前后端: libsecret
✓ 使用libsecret (系统密钥环)
✓ libsecret测试通过
...
```

#### 方法3：手动测试

```typescript
import { LinuxStorage } from 'unillm-ts/storage/linux';

const storage = new LinuxStorage();

// 检查后端
console.log('后端:', storage.getStorageBackend());

// 测试libsecret
const available = await storage.testLibsecret();
console.log('libsecret可用:', available);

// 存储测试
await storage.setSecret('test', 'value');
const value = await storage.getSecret('test');
console.log('测试成功:', value === 'value');
```

## 故障排除

### 问题1：keytar编译失败

**错误信息**:
```
node-gyp rebuild
fatal error: libsecret/secret.h: No such file or directory
```

**原因**: 未安装libsecret开发库

**解决方案**:
```bash
# Ubuntu/Debian
sudo apt-get install libsecret-1-dev

# CentOS/RHEL
sudo yum install libsecret-devel

# Fedora
sudo dnf install libsecret-devel

# Arch Linux
sudo pacman -S libsecret

# 重新编译keytar
npm rebuild keytar
```

### 问题2：GNOME Keyring未运行

**错误信息**:
```
[LinuxStorage] Keytar/libsecret not available: Cannot find module 'keytar'
```

或运行时警告：
```
[LinuxStorage] libsecret failed, falling back to encrypted file
```

**原因**: 
- GNOME Keyring服务未启动
- 在headless环境中运行
- 未安装GNOME Keyring

**解决方案**:

1. **桌面环境**:
```bash
# 检查服务状态
systemctl --user status gnome-keyring-daemon

# 启动服务
gnome-keyring-daemon --start --components=secrets

# 设置环境变量
export $(gnome-keyring-daemon --start)
```

2. **Headless服务器**:

在headless环境中，libsecret可能不可用。UniLLM-TS会自动切换到加密文件存储。

```typescript
// 确认使用的后端
const storage = new LinuxStorage();
console.log(storage.getStorageBackend()); // 应输出 'encrypted-file'
```

这是正常的，加密文件存储同样是安全的。

### 问题3：权限错误

**错误信息**:
```
EACCES: permission denied, mkdir '~/.unillm/secrets'
```

**原因**: 目录权限问题

**解决方案**:
```bash
# 修复权限
chmod 700 ~/.unillm
chmod 700 ~/.unillm/secrets
chmod 600 ~/.unillm/secrets/encrypted.json

# 或重新创建
rm -rf ~/.unillm
```

### 问题4：D-Bus连接失败

**错误信息**:
```
Cannot autolaunch D-Bus without X11 $DISPLAY
```

**原因**: 在没有X11显示的环境中运行

**解决方案**:

1. **SSH会话**:
```bash
# 设置DISPLAY变量
export DISPLAY=:0
```

2. **使用加密文件存储**:

这是自动fallback，无需额外配置。确认：
```typescript
const storage = new LinuxStorage();
console.log(storage.getStorageBackend()); // 'encrypted-file'
```

### 问题5：多用户环境中的密钥隔离

**场景**: 多个用户共享同一台机器

**解决方案**:

使用用户上下文管理：

```typescript
import { setCurrentUserId, setSecret } from 'unillm-ts';

// 用户A登录
setCurrentUserId('user-alice');
await setSecret('api-key', 'alice-key');

// 用户B登录
setCurrentUserId('user-bob');
await setSecret('api-key', 'bob-key');

// 密钥自动隔离
```

## 高级配置

### 自定义存储目录

默认情况下，加密文件存储在`~/.unillm/secrets/`。如需自定义：

```typescript
import { LinuxStorage } from 'unillm-ts/storage/linux';
import * as path from 'path';
import * as os from 'os';

class CustomLinuxStorage extends LinuxStorage {
  constructor(serviceName: string = 'unillm') {
    super(serviceName);
    // 在构造后修改路径（需要修改源码或使用环境变量）
  }
}
```

**推荐方式**: 使用环境变量

```bash
export UNILLM_SECRETS_DIR=/custom/path/secrets
```

（需要在代码中实现环境变量支持）

### 密钥环GUI管理

#### GNOME Keyring (Seahorse)

```bash
# 安装Seahorse（GNOME密钥环管理器）
sudo apt-get install seahorse  # Ubuntu/Debian
sudo dnf install seahorse      # Fedora

# 启动
seahorse
```

在Seahorse中可以查看、编辑、删除存储的密钥。

#### KDE Wallet (KWalletManager)

```bash
# 安装KWalletManager
sudo apt-get install kwalletmanager  # Ubuntu/Debian
sudo dnf install kwalletmanager      # Fedora

# 启动
kwalletmanager5
```

### 安全增强

#### 1. 启用密钥环加密

确保密钥环使用密码保护：

```bash
# GNOME Keyring - 在首次使用时会提示设置密码
# 建议使用强密码并与登录密码不同
```

#### 2. 自动锁定

配置密钥环在空闲时自动锁定：

```bash
# 通过Seahorse配置
# Preferences -> Automatically lock after: 5 minutes
```

#### 3. 文件权限审计

```bash
# 检查存储目录权限
ls -la ~/.unillm/secrets

# 应显示：
# drwx------ (700) - 目录
# -rw------- (600) - encrypted.json
```

## Docker/容器环境

### 推荐配置

在容器中，通常libsecret不可用，建议使用加密文件存储：

```dockerfile
FROM node:18-alpine

# 安装依赖
WORKDIR /app
COPY package*.json ./
RUN npm install

# 创建存储目录
RUN mkdir -p /app/.unillm/secrets && chmod 700 /app/.unillm/secrets

# 复制代码
COPY . .

# 运行应用
CMD ["node", "dist/index.js"]
```

### 使用Docker Secrets

更安全的做法是使用Docker secrets或Kubernetes secrets：

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: myapp
    secrets:
      - openai_key
      - qwen_key
    environment:
      - OPENAI_API_KEY_FILE=/run/secrets/openai_key
      - QWEN_API_KEY_FILE=/run/secrets/qwen_key

secrets:
  openai_key:
    file: ./secrets/openai_key.txt
  qwen_key:
    file: ./secrets/qwen_key.txt
```

## 性能优化

### 1. 预热密钥环

首次访问密钥环可能较慢，可以预热：

```typescript
const storage = new LinuxStorage();

// 应用启动时预热
await storage.testLibsecret();
```

### 2. 批量操作

```typescript
// 一次性获取所有密钥
const allKeys = await storage.getAllKeys();
const values = await Promise.all(
  allKeys.map(key => storage.getSecret(key))
);
```

### 3. 缓存策略

对于频繁访问的密钥，考虑内存缓存：

```typescript
class CachedLinuxStorage extends LinuxStorage {
  private cache = new Map<string, string>();
  private cacheDuration = 5 * 60 * 1000; // 5分钟

  async getSecret(key: string): Promise<string | null> {
    // 检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // 从存储读取
    const value = await super.getSecret(key);
    
    // 缓存
    if (value !== null) {
      this.cache.set(key, value);
      setTimeout(() => this.cache.delete(key), this.cacheDuration);
    }

    return value;
  }
}
```

## 生产环境清单

- [ ] 安装libsecret系统依赖
- [ ] 安装并配置GNOME Keyring或KDE Wallet
- [ ] 测试libsecret可用性
- [ ] 配置密钥环密码保护
- [ ] 设置自动锁定策略
- [ ] 验证文件权限（700/600）
- [ ] 配置备份策略
- [ ] 实现密钥轮换机制
- [ ] 设置监控和告警
- [ ] 审计日志配置

## 支持和反馈

如果遇到问题：

1. 查看[故障排除](#故障排除)部分
2. 阅读[Linux存储实现文档](./linux-storage.md)
3. 运行测试：`npm run test:linux-storage`
4. 提交Issue到GitHub

## 相关资源

- [Linux存储实现文档](./linux-storage.md) - 详细的技术实现说明
- [libsecret官方文档](https://wiki.gnome.org/Projects/Libsecret)
- [GNOME Keyring文档](https://wiki.gnome.org/Projects/GnomeKeyring)
- [Secret Service API规范](https://specifications.freedesktop.org/secret-service/)
