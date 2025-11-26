# Linux平台密钥存储实现

## 概述

Linux平台的密钥存储实现采用**统一且安全**的双层架构，优先使用系统密钥环服务，并提供安全的加密文件存储作为fallback方案。

## 架构设计

### 1. 优先方案：libsecret（系统密钥环服务）

Linux系统提供了标准化的密钥管理服务，主要通过**Secret Service API**（D-Bus接口）实现。

#### 支持的后端

- **GNOME Keyring** - Ubuntu、Debian、Fedora等使用GNOME桌面环境的发行版
- **KDE Wallet** - KDE桌面环境
- **其他实现** - 任何符合Secret Service API的密钥环

#### 技术实现

通过`keytar`库访问libsecret，keytar在Linux上底层使用libsecret：

```typescript
import * as keytar from 'keytar';

// 存储密钥
await keytar.setPassword('unillm', 'api-key', 'secret-value');

// 读取密钥
const value = await keytar.getPassword('unillm', 'api-key');

// 删除密钥
await keytar.deletePassword('unillm', 'api-key');
```

#### 优点

- ✅ 系统级安全性，密钥由操作系统管理
- ✅ 支持用户登录密码加密
- ✅ 集成到系统密钥环，用户可通过GUI管理
- ✅ 符合Linux安全标准
- ✅ 跨发行版兼容性好

#### 限制

- ⚠️ 需要桌面环境（headless服务器可能不可用）
- ⚠️ 需要安装libsecret库

### 2. Fallback方案：加密文件存储

当libsecret不可用时（如headless服务器、Docker容器等），自动切换到加密文件存储。

#### 安全设计

##### 2.1 加密算法

使用**AES-256-GCM**（Galois/Counter Mode）：

- 256位密钥长度
- 认证加密（AEAD）- 同时提供机密性和完整性
- 随机初始化向量（IV）
- 认证标签防止篡改

```typescript
// 加密格式
{
  iv: string,      // 16字节随机IV（十六进制）
  data: string,    // 加密后的数据（十六进制）
  tag: string      // 16字节认证标签（十六进制）
}
```

##### 2.2 密钥派生

使用**PBKDF2**（Password-Based Key Derivation Function 2）从机器特征派生加密密钥：

```typescript
const keyMaterial = `${machineId}:${username}:${salt}`;
const key = crypto.pbkdf2Sync(keyMaterial, salt, 100000, 32, 'sha256');
```

参数：
- **machineId**: 机器唯一标识（/etc/machine-id）
- **username**: 当前用户名
- **salt**: 固定盐值 `unillm-linux-storage-v1`
- **iterations**: 100,000次迭代
- **keyLength**: 32字节（256位）
- **digest**: SHA-256

##### 2.3 机器ID获取

优先级顺序：

1. `/etc/machine-id` - systemd生成的机器唯一ID
2. `/var/lib/dbus/machine-id` - D-Bus机器ID
3. `os.hostname()` - 主机名（fallback）

##### 2.4 文件权限

- 存储目录：`~/.unillm/secrets/`，权限`700`（drwx------）
- 加密文件：`~/.unillm/secrets/encrypted.json`，权限`600`（-rw-------）

#### 优点

- ✅ 无需额外依赖
- ✅ 适用于headless服务器
- ✅ 跨发行版通用
- ✅ AES-256-GCM提供强加密
- ✅ 基于机器ID的密钥派生，防止密钥文件在其他机器上解密

#### 限制

- ⚠️ 安全性依赖文件系统权限
- ⚠️ 无法防止root用户访问
- ⚠️ 机器ID变化会导致无法解密（重装系统等）

## 发行版兼容性

### Ubuntu / Debian

- **默认密钥环**: GNOME Keyring
- **libsecret支持**: ✅ 原生支持
- **推荐方案**: libsecret（首选）
- **测试版本**: Ubuntu 20.04+, Debian 10+

### CentOS / RHEL

- **默认密钥环**: 根据桌面环境（GNOME Keyring或无）
- **libsecret支持**: ✅ 需安装`libsecret`包
- **推荐方案**: libsecret（桌面环境）或加密文件（服务器）
- **测试版本**: CentOS 7+, RHEL 8+

### Fedora

- **默认密钥环**: GNOME Keyring
- **libsecret支持**: ✅ 原生支持
- **推荐方案**: libsecret（首选）
- **测试版本**: Fedora 35+

### Arch Linux

- **默认密钥环**: 根据桌面环境
- **libsecret支持**: ✅ 需安装`libsecret`包
- **推荐方案**: libsecret（桌面环境）或加密文件（服务器）

### Headless服务器 / Docker容器

- **密钥环支持**: ❌ 通常不可用
- **推荐方案**: 加密文件存储
- **安全建议**: 
  - 使用环境变量传递敏感配置
  - 使用Docker secrets或Kubernetes secrets
  - 考虑使用外部密钥管理服务（HashiCorp Vault等）

## 使用示例

### 基本使用

```typescript
import { LinuxStorage } from 'unillm-ts/storage/linux';

const storage = new LinuxStorage('unillm');

// 存储密钥
await storage.setSecret('api-key', 'sk-xxxx');

// 读取密钥
const apiKey = await storage.getSecret('api-key');

// 删除密钥
await storage.deleteSecret('api-key');

// 列出所有密钥
const keys = await storage.getAllKeys();

// 清空所有密钥
await storage.clearAll();
```

### 检查存储后端

```typescript
const storage = new LinuxStorage();

// 获取当前使用的后端
const backend = storage.getStorageBackend();
console.log(`使用后端: ${backend}`); // 'libsecret' 或 'encrypted-file'

// 测试libsecret是否可用
const available = await storage.testLibsecret();
console.log(`libsecret可用: ${available}`);
```

### 与LLMManager集成

```typescript
import llmManager from 'unillm-ts';

// Linux平台会自动使用LinuxStorage
await llmManager.init();

// 存储API密钥（自动使用Linux安全存储）
await llmManager.setSecret('openai-default-api_key', 'sk-xxxx');

// 使用模型
await llmManager.setCurrentInstance('openai-default');
await llmManager.setCurrentModel('gpt-4o');
const response = await llmManager.chatSimple('Hello!');
```

## 安全性分析

### libsecret方案

| 威胁模型 | 防护能力 | 说明 |
|---------|---------|------|
| 本地恶意软件 | 高 | 需要用户权限才能访问 |
| 内存转储攻击 | 中 | 密钥在使用时存在于内存 |
| 文件系统攻击 | 高 | 密钥由系统管理，加密存储 |
| Root权限攻击 | 低 | Root可访问所有用户数据 |
| 跨用户访问 | 高 | 用户隔离，无法跨用户访问 |
| 物理访问 | 中 | 依赖用户登录密码 |

### 加密文件方案

| 威胁模型 | 防护能力 | 说明 |
|---------|---------|------|
| 本地恶意软件 | 中 | 文件权限保护，但同用户可访问 |
| 内存转储攻击 | 低 | 密钥派生算法在内存中 |
| 文件系统攻击 | 中 | AES-256-GCM加密，但密钥可推导 |
| Root权限攻击 | 低 | Root可访问文件和推导密钥 |
| 跨用户访问 | 高 | 基于用户名派生密钥 |
| 物理访问 | 低 | 只要知道机器ID即可推导密钥 |
| 文件复制攻击 | 高 | 基于机器ID，复制到其他机器无法解密 |

### 最佳实践建议

1. **生产环境**
   - 优先使用libsecret（桌面应用）
   - 服务器环境考虑外部密钥管理服务
   - 定期轮换API密钥

2. **开发环境**
   - 可使用加密文件存储
   - 不要在代码中硬编码密钥
   - 使用环境变量作为额外保护层

3. **Docker/容器环境**
   - 使用Docker secrets或Kubernetes secrets
   - 挂载密钥文件为只读
   - 限制容器权限

4. **多用户场景**
   - 使用`setCurrentUserId()`隔离不同用户的密钥
   - 每个用户单独管理其API密钥

## 依赖和安装

### 依赖库

- **必需**: 无（加密文件存储）
- **推荐**: `keytar` >= 7.9.0（libsecret支持）

### 系统依赖

#### Ubuntu/Debian

```bash
# libsecret支持
sudo apt-get install libsecret-1-dev

# GNOME Keyring (通常已预装)
sudo apt-get install gnome-keyring
```

#### CentOS/RHEL

```bash
# libsecret支持
sudo yum install libsecret-devel

# GNOME Keyring
sudo yum install gnome-keyring
```

#### Fedora

```bash
# libsecret支持
sudo dnf install libsecret-devel

# GNOME Keyring
sudo dnf install gnome-keyring
```

#### Arch Linux

```bash
# libsecret支持
sudo pacman -S libsecret

# GNOME Keyring
sudo pacman -S gnome-keyring
```

### npm安装

```bash
npm install unillm-ts

# 如果需要libsecret支持，确保先安装系统依赖
```

## 故障排除

### libsecret不可用

**现象**: 日志显示 "Keytar/libsecret not available"

**原因**:
- 系统未安装libsecret开发库
- 未安装密钥环服务（GNOME Keyring等）
- Headless环境无桌面环境

**解决方案**:
1. 安装系统依赖（见上文）
2. 重新安装keytar: `npm rebuild keytar`
3. 使用加密文件存储（自动fallback）

### 密钥无法解密

**现象**: "Failed to decrypt data - data may be corrupted"

**原因**:
- 机器ID发生变化（重装系统、虚拟机克隆等）
- 用户名发生变化
- 文件被损坏

**解决方案**:
1. 删除 `~/.unillm/secrets/encrypted.json`
2. 重新设置所有密钥

### 权限错误

**现象**: "EACCES: permission denied"

**原因**: 
- 存储目录权限不正确
- 文件被其他用户创建

**解决方案**:
```bash
# 修复目录权限
chmod 700 ~/.unillm/secrets
chmod 600 ~/.unillm/secrets/encrypted.json

# 或删除并重新创建
rm -rf ~/.unillm/secrets
```

## 性能考虑

### libsecret

- **首次访问**: ~50-100ms（D-Bus通信）
- **后续访问**: ~10-50ms
- **建议**: 适合交互式应用

### 加密文件

- **首次访问**: ~5-10ms（文件读取+解密）
- **后续访问**: ~5-10ms（每次都需要解密）
- **建议**: 适合频繁访问场景

### 优化建议

1. **缓存密钥**: 在内存中缓存常用密钥（注意安全风险）
2. **批量操作**: 使用`getAllKeys()`一次性获取所有密钥
3. **懒加载**: 只在需要时加载storage实例

## 安全审计清单

- [x] 使用行业标准加密算法（AES-256-GCM）
- [x] 随机IV，防止重放攻击
- [x] 认证标签，防止篡改
- [x] 基于机器ID的密钥派生
- [x] 文件权限保护（600/700）
- [x] 自动fallback机制
- [x] 无明文密钥日志输出
- [x] 用户隔离支持
- [x] 符合Linux安全标准

## 未来改进

- [ ] 支持硬件安全模块（TPM）
- [ ] 支持用户密码保护
- [ ] 密钥自动轮换机制
- [ ] 审计日志
- [ ] 支持Pass（标准Unix密码管理器）
- [ ] 集成Vault等企业级密钥管理

## 参考资料

- [Secret Service API Specification](https://specifications.freedesktop.org/secret-service/)
- [GNOME Keyring Documentation](https://wiki.gnome.org/Projects/GnomeKeyring)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [NIST AES-GCM Guidelines](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [PBKDF2 Specification (RFC 2898)](https://tools.ietf.org/html/rfc2898)
