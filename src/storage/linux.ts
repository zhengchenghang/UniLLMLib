// src/storage/linux.ts
import { SecureStorageInterface } from './interface';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Linux平台安全存储实现
 * 
 * 实现策略：
 * 1. 优先使用libsecret（通过keytar）- 支持GNOME Keyring、KDE Wallet等
 * 2. Fallback到加密文件存储（使用AES-256-GCM）
 * 
 * 安全性设计：
 * - 使用系统密钥环服务（libsecret）作为首选方案
 * - Fallback使用基于机器ID的密钥派生 + AES-256-GCM加密
 * - 文件权限设置为600（仅当前用户可读写）
 * - 使用随机IV和认证标签防止篡改
 */
export class LinuxStorage implements SecureStorageInterface {
  private serviceName: string;
  private keytar: any | null = null;
  private keytarAvailable: boolean = false;
  private storageDir: string;
  private secretsFile: string;
  private encryptionKey: Buffer | null = null;

  constructor(serviceName: string = 'unillm') {
    this.serviceName = serviceName;
    
    // 初始化存储目录
    const homeDir = os.homedir();
    this.storageDir = path.join(homeDir, '.unillm', 'secrets');
    this.secretsFile = path.join(this.storageDir, 'encrypted.json');
    
    this.init();
  }

  private init(): void {
    // 尝试加载keytar（使用libsecret）
    this.loadKeytar();
    
    // 如果keytar不可用，初始化加密文件存储
    if (!this.keytarAvailable) {
      this.initEncryptedStorage();
    }
  }

  /**
   * 加载keytar库（Linux上使用libsecret）
   */
  private loadKeytar(): void {
    try {
      this.keytar = require('keytar');
      this.keytarAvailable = true;
      console.log('[LinuxStorage] Using libsecret (keytar) for secure storage');
    } catch (error: any) {
      console.warn('[LinuxStorage] Keytar/libsecret not available:', error.message);
      console.warn('[LinuxStorage] Falling back to encrypted file storage');
      this.keytarAvailable = false;
    }
  }

  /**
   * 初始化加密文件存储
   */
  private initEncryptedStorage(): void {
    try {
      // 确保存储目录存在
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true, mode: 0o700 });
      }
      
      // 设置目录权限为700（仅当前用户访问）
      fs.chmodSync(this.storageDir, 0o700);
      
      // 生成或加载加密密钥
      this.encryptionKey = this.deriveEncryptionKey();
      
      console.log('[LinuxStorage] Encrypted file storage initialized');
    } catch (error: any) {
      console.error('[LinuxStorage] Failed to initialize encrypted storage:', error.message);
      throw new Error('Failed to initialize Linux secure storage');
    }
  }

  /**
   * 派生加密密钥
   * 基于机器ID、用户名和固定salt生成确定性密钥
   */
  private deriveEncryptionKey(): Buffer {
    try {
      // 获取机器唯一标识
      const machineId = this.getMachineId();
      const username = os.userInfo().username;
      const salt = 'unillm-linux-storage-v1';
      
      // 使用PBKDF2派生密钥
      const keyMaterial = `${machineId}:${username}:${salt}`;
      return crypto.pbkdf2Sync(keyMaterial, salt, 100000, 32, 'sha256');
    } catch (error) {
      console.error('[LinuxStorage] Failed to derive encryption key:', error);
      // 如果无法获取机器ID，使用用户名和随机salt
      const fallbackSalt = crypto.randomBytes(32);
      const username = os.userInfo().username;
      return crypto.pbkdf2Sync(username, fallbackSalt, 100000, 32, 'sha256');
    }
  }

  /**
   * 获取机器唯一标识
   * 优先级：/etc/machine-id > /var/lib/dbus/machine-id > hostname
   */
  private getMachineId(): string {
    const machineIdPaths = [
      '/etc/machine-id',
      '/var/lib/dbus/machine-id'
    ];

    for (const idPath of machineIdPaths) {
      try {
        if (fs.existsSync(idPath)) {
          const machineId = fs.readFileSync(idPath, 'utf8').trim();
          if (machineId) {
            return machineId;
          }
        }
      } catch (error) {
        // 继续尝试下一个路径
      }
    }

    // Fallback: 使用主机名
    return os.hostname();
  }

  /**
   * 加密数据
   */
  private encrypt(plaintext: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    // 生成随机IV
    const iv = crypto.randomBytes(16);
    
    // 创建加密器（AES-256-GCM）
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    
    // 加密数据
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 获取认证标签
    const authTag = cipher.getAuthTag();
    
    // 组合IV、加密数据和认证标签
    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      tag: authTag.toString('hex')
    });
  }

  /**
   * 解密数据
   */
  private decrypt(ciphertext: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const parsed = JSON.parse(ciphertext);
      const iv = Buffer.from(parsed.iv, 'hex');
      const authTag = Buffer.from(parsed.tag, 'hex');
      
      // 创建解密器
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
      decipher.setAuthTag(authTag);
      
      // 解密数据
      let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error: any) {
      console.error('[LinuxStorage] Decryption failed:', error.message);
      throw new Error('Failed to decrypt data - data may be corrupted');
    }
  }

  /**
   * 读取加密文件中的所有secrets
   */
  private readEncryptedFile(): Map<string, string> {
    const secrets = new Map<string, string>();
    
    if (!fs.existsSync(this.secretsFile)) {
      return secrets;
    }

    try {
      const encryptedContent = fs.readFileSync(this.secretsFile, 'utf8');
      if (!encryptedContent) {
        return secrets;
      }
      
      const decryptedContent = this.decrypt(encryptedContent);
      const parsed = JSON.parse(decryptedContent);
      
      for (const [key, value] of Object.entries(parsed)) {
        secrets.set(key, value as string);
      }
    } catch (error: any) {
      console.error('[LinuxStorage] Failed to read encrypted file:', error.message);
    }

    return secrets;
  }

  /**
   * 写入加密文件
   */
  private writeEncryptedFile(secrets: Map<string, string>): void {
    try {
      const obj: Record<string, string> = {};
      for (const [key, value] of secrets.entries()) {
        obj[key] = value;
      }
      
      const plaintext = JSON.stringify(obj);
      const encrypted = this.encrypt(plaintext);
      
      // 写入文件，权限600
      fs.writeFileSync(this.secretsFile, encrypted, { mode: 0o600 });
    } catch (error: any) {
      console.error('[LinuxStorage] Failed to write encrypted file:', error.message);
      throw new Error('Failed to save encrypted secrets');
    }
  }

  // ==================== SecureStorageInterface 实现 ====================

  async setSecret(key: string, value: string): Promise<void> {
    if (this.keytarAvailable && this.keytar) {
      // 使用libsecret（通过keytar）
      try {
        await this.keytar.setPassword(this.serviceName, key, value);
        return;
      } catch (error: any) {
        console.warn('[LinuxStorage] libsecret failed, falling back to encrypted file:', error.message);
        // Fallback到加密文件存储
        this.keytarAvailable = false;
      }
    }

    // 使用加密文件存储
    const secrets = this.readEncryptedFile();
    secrets.set(key, value);
    this.writeEncryptedFile(secrets);
  }

  async getSecret(key: string): Promise<string | null> {
    if (this.keytarAvailable && this.keytar) {
      // 使用libsecret（通过keytar）
      try {
        return await this.keytar.getPassword(this.serviceName, key);
      } catch (error: any) {
        console.warn('[LinuxStorage] libsecret failed, falling back to encrypted file:', error.message);
        // Fallback到加密文件存储
        this.keytarAvailable = false;
      }
    }

    // 使用加密文件存储
    const secrets = this.readEncryptedFile();
    return secrets.has(key) ? secrets.get(key)! : null;
  }

  async deleteSecret(key: string): Promise<boolean> {
    if (this.keytarAvailable && this.keytar) {
      // 使用libsecret（通过keytar）
      try {
        return await this.keytar.deletePassword(this.serviceName, key);
      } catch (error: any) {
        console.warn('[LinuxStorage] libsecret failed, falling back to encrypted file:', error.message);
        // Fallback到加密文件存储
        this.keytarAvailable = false;
      }
    }

    // 使用加密文件存储
    const secrets = this.readEncryptedFile();
    const existed = secrets.has(key);
    secrets.delete(key);
    this.writeEncryptedFile(secrets);
    return existed;
  }

  async getAllKeys(): Promise<string[]> {
    if (this.keytarAvailable && this.keytar) {
      // 使用libsecret（通过keytar）
      try {
        const credentials = await this.keytar.findCredentials(this.serviceName);
        return credentials.map((cred: any) => cred.account);
      } catch (error: any) {
        console.warn('[LinuxStorage] libsecret failed, falling back to encrypted file:', error.message);
        // Fallback到加密文件存储
        this.keytarAvailable = false;
      }
    }

    // 使用加密文件存储
    const secrets = this.readEncryptedFile();
    return Array.from(secrets.keys());
  }

  async clearAll(): Promise<void> {
    if (this.keytarAvailable && this.keytar) {
      // 使用libsecret（通过keytar）
      try {
        const credentials = await this.keytar.findCredentials(this.serviceName);
        for (const cred of credentials) {
          await this.keytar.deletePassword(this.serviceName, cred.account);
        }
        return;
      } catch (error: any) {
        console.warn('[LinuxStorage] libsecret failed, falling back to encrypted file:', error.message);
        // Fallback到加密文件存储
        this.keytarAvailable = false;
      }
    }

    // 使用加密文件存储
    if (fs.existsSync(this.secretsFile)) {
      fs.unlinkSync(this.secretsFile);
    }
  }

  /**
   * 检查当前使用的存储后端
   */
  public getStorageBackend(): 'libsecret' | 'encrypted-file' {
    return this.keytarAvailable ? 'libsecret' : 'encrypted-file';
  }

  /**
   * 测试libsecret是否可用
   */
  public async testLibsecret(): Promise<boolean> {
    if (!this.keytar) {
      return false;
    }

    try {
      const testKey = '__unillm_test_key__';
      const testValue = 'test-value';
      
      await this.keytar.setPassword(this.serviceName, testKey, testValue);
      const retrieved = await this.keytar.getPassword(this.serviceName, testKey);
      await this.keytar.deletePassword(this.serviceName, testKey);
      
      return retrieved === testValue;
    } catch (error) {
      return false;
    }
  }
}
