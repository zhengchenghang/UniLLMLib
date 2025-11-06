// src/storage/other-platforms.storage.ts
import { SecureStorageInterface } from './interface';

// macOS 实现（占位）
export class MacOSStorage implements SecureStorageInterface {
  async setSecret(key: string, value: string): Promise<void> {
    throw new Error('MacOSStorage not implemented yet');
  }

  async getSecret(key: string): Promise<string | null> {
    throw new Error('MacOSStorage not implemented yet');
  }

  async deleteSecret(key: string): Promise<boolean> {
    throw new Error('MacOSStorage not implemented yet');
  }

  async getAllKeys(): Promise<string[]> {
    throw new Error('MacOSStorage not implemented yet');
  }

  async clearAll(): Promise<void> {
    throw new Error('MacOSStorage not implemented yet');
  }
}

// Linux 实现（占位）
export class LinuxStorage implements SecureStorageInterface {
  async setSecret(key: string, value: string): Promise<void> {
    throw new Error('LinuxStorage not implemented yet');
  }

  async getSecret(key: string): Promise<string | null> {
    throw new Error('LinuxStorage not implemented yet');
  }

  async deleteSecret(key: string): Promise<boolean> {
    throw new Error('LinuxStorage not implemented yet');
  }

  async getAllKeys(): Promise<string[]> {
    throw new Error('LinuxStorage not implemented yet');
  }

  async clearAll(): Promise<void> {
    throw new Error('LinuxStorage not implemented yet');
  }
}

// Android 实现（基于 react-native-keychain）
export class AndroidStorage implements SecureStorageInterface {
  private static readonly INDEX_ACCOUNT = '__index__';
  private serviceName: string;
  private keychain: any | null;

  constructor(serviceName: string = 'unillm') {
    this.serviceName = serviceName;
    this.keychain = this.loadKeychain();
  }

  private loadKeychain() {
    try {
      return require('react-native-keychain');
    } catch (error) {
      console.warn(
        'react-native-keychain module is not available. Install react-native-keychain to enable secure storage on Android.'
      );
      return null;
    }
  }

  private ensureKeychain() {
    if (!this.keychain) {
      this.keychain = this.loadKeychain();
    }

    if (!this.keychain) {
      throw new Error(
        'react-native-keychain is required for Android secure storage. Please install and configure react-native-keychain in your React Native project.'
      );
    }

    return this.keychain;
  }

  private getServiceKey(key: string): string {
    return `${this.serviceName}:${key}`;
  }

  private getIndexServiceKey(): string {
    return `${this.serviceName}:__index__`;
  }

  private async readIndex(): Promise<Set<string>> {
    const keychain = this.ensureKeychain();

    try {
      const result = await keychain.getGenericPassword({ service: this.getIndexServiceKey() });
      if (!result) {
        return new Set();
      }

      const parsed = JSON.parse(result.password);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }

      return new Set();
    } catch (error) {
      console.warn('[AndroidStorage] Failed to read secure storage index', error);
      return new Set();
    }
  }

  private async writeIndex(keys: Set<string>): Promise<void> {
    const keychain = this.ensureKeychain();

    if (keys.size === 0) {
      await keychain.resetGenericPassword({ service: this.getIndexServiceKey() });
      return;
    }

    const success = await keychain.setGenericPassword(
      AndroidStorage.INDEX_ACCOUNT,
      JSON.stringify(Array.from(keys)),
      { service: this.getIndexServiceKey() }
    );

    if (!success) {
      throw new Error('Failed to persist Android secure storage index to keychain.');
    }
  }

  private async addToIndex(key: string): Promise<void> {
    const keys = await this.readIndex();
    if (!keys.has(key)) {
      keys.add(key);
      await this.writeIndex(keys);
    }
  }

  private async removeFromIndex(key: string): Promise<void> {
    const keys = await this.readIndex();
    if (keys.delete(key)) {
      await this.writeIndex(keys);
    }
  }

  async setSecret(key: string, value: string): Promise<void> {
    const keychain = this.ensureKeychain();
    const success = await keychain.setGenericPassword(key, value, {
      service: this.getServiceKey(key)
    });

    if (!success) {
      throw new Error(`Failed to securely store secret for key "${key}".`);
    }

    await this.addToIndex(key);
  }

  async getSecret(key: string): Promise<string | null> {
    const keychain = this.ensureKeychain();
    const result = await keychain.getGenericPassword({ service: this.getServiceKey(key) });
    return result ? result.password : null;
  }

  async deleteSecret(key: string): Promise<boolean> {
    const keychain = this.ensureKeychain();
    const removed = await keychain.resetGenericPassword({ service: this.getServiceKey(key) });

    await this.removeFromIndex(key);

    return removed;
  }

  async getAllKeys(): Promise<string[]> {
    const keys = await this.readIndex();
    return Array.from(keys).sort();
  }

  async clearAll(): Promise<void> {
    const keychain = this.ensureKeychain();
    const keys = await this.readIndex();

    for (const key of keys) {
      await keychain.resetGenericPassword({ service: this.getServiceKey(key) });
    }

    await this.writeIndex(new Set());
  }
}

// iOS 实现（基于 react-native-keychain）
export class IOSStorage implements SecureStorageInterface {
  private static readonly INDEX_ACCOUNT = '__index__';
  private serviceName: string;
  private keychain: any | null;
  private accessControl: any | null;

  constructor(serviceName: string = 'unillm') {
    this.serviceName = serviceName;
    this.keychain = this.loadKeychain();
    this.accessControl = this.loadAccessControl();
  }

  private loadKeychain() {
    try {
      return require('react-native-keychain');
    } catch (error) {
      console.warn(
        'react-native-keychain module is not available. Install react-native-keychain to enable secure storage on iOS.'
      );
      return null;
    }
  }

  private loadAccessControl() {
    try {
      const keychain = this.loadKeychain();
      if (keychain && keychain.ACCESS_CONTROL) {
        return keychain.ACCESS_CONTROL;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private ensureKeychain() {
    if (!this.keychain) {
      this.keychain = this.loadKeychain();
    }

    if (!this.keychain) {
      throw new Error(
        'react-native-keychain is required for iOS secure storage. Please install and configure react-native-keychain in your React Native project.'
      );
    }

    return this.keychain;
  }

  private getServiceKey(key: string): string {
    return `${this.serviceName}:${key}`;
  }

  private getIndexServiceKey(): string {
    return `${this.serviceName}:__index__`;
  }

  private async readIndex(): Promise<Set<string>> {
    const keychain = this.ensureKeychain();

    try {
      const result = await keychain.getGenericPassword({ service: this.getIndexServiceKey() });
      if (!result) {
        return new Set();
      }

      const parsed = JSON.parse(result.password);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }

      return new Set();
    } catch (error) {
      console.warn('[IOSStorage] Failed to read secure storage index', error);
      return new Set();
    }
  }

  private async writeIndex(keys: Set<string>): Promise<void> {
    const keychain = this.ensureKeychain();

    if (keys.size === 0) {
      await keychain.resetGenericPassword({ service: this.getIndexServiceKey() });
      return;
    }

    const success = await keychain.setGenericPassword(
      IOSStorage.INDEX_ACCOUNT,
      JSON.stringify(Array.from(keys)),
      { service: this.getIndexServiceKey() }
    );

    if (!success) {
      throw new Error('Failed to persist iOS secure storage index to keychain.');
    }
  }

  private async addToIndex(key: string): Promise<void> {
    const keys = await this.readIndex();
    if (!keys.has(key)) {
      keys.add(key);
      await this.writeIndex(keys);
    }
  }

  private async removeFromIndex(key: string): Promise<void> {
    const keys = await this.readIndex();
    if (keys.delete(key)) {
      await this.writeIndex(keys);
    }
  }

  async setSecret(key: string, value: string): Promise<void> {
    const keychain = this.ensureKeychain();
    
    // iOS特定的安全选项
    const options: any = {
      service: this.getServiceKey(key),
      accessControl: this.accessControl ? this.accessControl.USER_PRESENCE : undefined,
      authenticatePrompt: `Authenticate to access ${key}`,
    };

    const success = await keychain.setGenericPassword(key, value, options);

    if (!success) {
      throw new Error(`Failed to securely store secret for key "${key}" on iOS.`);
    }

    await this.addToIndex(key);
  }

  async getSecret(key: string): Promise<string | null> {
    const keychain = this.ensureKeychain();
    
    try {
      const result = await keychain.getGenericPassword({ 
        service: this.getServiceKey(key),
        authenticatePrompt: `Authenticate to access ${key}`
      });
      return result ? result.password : null;
    } catch (error) {
      console.warn(`[IOSStorage] Failed to get secret for key "${key}"`, error);
      return null;
    }
  }

  async deleteSecret(key: string): Promise<boolean> {
    const keychain = this.ensureKeychain();
    
    try {
      const removed = await keychain.resetGenericPassword({ service: this.getServiceKey(key) });
      await this.removeFromIndex(key);
      return removed;
    } catch (error) {
      console.warn(`[IOSStorage] Failed to delete secret for key "${key}"`, error);
      return false;
    }
  }

  async getAllKeys(): Promise<string[]> {
    const keys = await this.readIndex();
    return Array.from(keys).sort();
  }

  async clearAll(): Promise<void> {
    const keychain = this.ensureKeychain();
    const keys = await this.readIndex();

    try {
      for (const key of keys) {
        await keychain.resetGenericPassword({ service: this.getServiceKey(key) });
      }

      await this.writeIndex(new Set());
    } catch (error) {
      console.warn('[IOSStorage] Error during clearAll operation', error);
      throw new Error('Failed to clear all secrets from iOS keychain');
    }
  }

  /**
   * iOS特定的方法：检查生物识别是否可用
   */
  async canImplyAuthentication(): Promise<boolean> {
    const keychain = this.ensureKeychain();
    
    try {
      if (keychain.getSupportedBiometryType) {
        const biometryType = await keychain.getSupportedBiometryType();
        return biometryType !== null;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * iOS特定的方法：获取可用的生物识别类型
   */
  async getSupportedBiometryType(): Promise<string | null> {
    const keychain = this.ensureKeychain();
    
    try {
      if (keychain.getSupportedBiometryType) {
        return await keychain.getSupportedBiometryType();
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Web 实现（占位）
export class WebStorage implements SecureStorageInterface {
  async setSecret(key: string, value: string): Promise<void> {
    throw new Error('WebStorage not implemented yet');
  }

  async getSecret(key: string): Promise<string | null> {
    throw new Error('WebStorage not implemented yet');
  }

  async deleteSecret(key: string): Promise<boolean> {
    throw new Error('WebStorage not implemented yet');
  }

  async getAllKeys(): Promise<string[]> {
    throw new Error('WebStorage not implemented yet');
  }

  async clearAll(): Promise<void> {
    throw new Error('WebStorage not implemented yet');
  }
}