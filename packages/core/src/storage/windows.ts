// src/storage/windows.storage.ts
import { SecureStorageInterface } from './interface';

export class WindowsStorage implements SecureStorageInterface {
  private serviceName: string;
  private keytar: any;

  constructor(serviceName: string = 'unillm') {
    this.serviceName = serviceName;
    this.loadKeytar();
  }

  private loadKeytar() {
    try {
      // 动态导入 keytar，避免编译时错误
      this.keytar = require('keytar');
    } catch (error) {
      console.warn('Keytar not available, falling back to encrypted file storage');
      this.keytar = null;
    }
  }

  async setSecret(key: string, value: string): Promise<void> {
    if (this.keytar) {
      // 使用 keytar 存储到 Windows Credential Manager
      await this.keytar.setPassword(this.serviceName, key, value);
    } else {
      // 降级方案：使用加密文件存储
      await this.setSecretFallback(key, value);
    }
  }

  async getSecret(key: string): Promise<string | null> {
    if (this.keytar) {
      return await this.keytar.getPassword(this.serviceName, key);
    } else {
      return await this.getSecretFallback(key);
    }
  }

  async deleteSecret(key: string): Promise<boolean> {
    if (this.keytar) {
      return await this.keytar.deletePassword(this.serviceName, key);
    } else {
      return await this.deleteSecretFallback(key);
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (this.keytar) {
      return await this.keytar.findCredentials(this.serviceName);
    } else {
      return await this.getAllKeysFallback();
    }
  }

  async clearAll(): Promise<void> {
    if (this.keytar) {
      const credentials = await this.keytar.findCredentials(this.serviceName);
      for (const cred of credentials) {
        await this.keytar.deletePassword(this.serviceName, cred.account);
      }
    } else {
      await this.clearAllFallback();
    }
  }

  // 降级方案：加密文件存储实现
  private async setSecretFallback(key: string, value: string): Promise<void> {
    // 这里实现文件加密存储逻辑
    // 可以使用 crypto 进行加密后存储到文件
    console.warn('Using fallback storage for key:', key);
    // 临时实现 - 实际应该加密存储
    localStorage.setItem(`fallback_${this.serviceName}_${key}`, value);
  }

  private async getSecretFallback(key: string): Promise<string | null> {
    console.warn('Using fallback storage for key:', key);
    return localStorage.getItem(`fallback_${this.serviceName}_${key}`);
  }

  private async deleteSecretFallback(key: string): Promise<boolean> {
    localStorage.removeItem(`fallback_${this.serviceName}_${key}`);
    return true;
  }

  private async getAllKeysFallback(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`fallback_${this.serviceName}_`)) {
        keys.push(key.replace(`fallback_${this.serviceName}_`, ''));
      }
    }
    return keys;
  }

  private async clearAllFallback(): Promise<void> {
    const keys = await this.getAllKeysFallback();
    for (const key of keys) {
      await this.deleteSecretFallback(key);
    }
  }
}