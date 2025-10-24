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

// Android 实现（占位）
export class AndroidStorage implements SecureStorageInterface {
  async setSecret(key: string, value: string): Promise<void> {
    throw new Error('AndroidStorage not implemented yet');
  }

  async getSecret(key: string): Promise<string | null> {
    throw new Error('AndroidStorage not implemented yet');
  }

  async deleteSecret(key: string): Promise<boolean> {
    throw new Error('AndroidStorage not implemented yet');
  }

  async getAllKeys(): Promise<string[]> {
    throw new Error('AndroidStorage not implemented yet');
  }

  async clearAll(): Promise<void> {
    throw new Error('AndroidStorage not implemented yet');
  }
}

// iOS 实现（占位）
export class IOSStorage implements SecureStorageInterface {
  async setSecret(key: string, value: string): Promise<void> {
    throw new Error('IOSStorage not implemented yet');
  }

  async getSecret(key: string): Promise<string | null> {
    throw new Error('IOSStorage not implemented yet');
  }

  async deleteSecret(key: string): Promise<boolean> {
    throw new Error('IOSStorage not implemented yet');
  }

  async getAllKeys(): Promise<string[]> {
    throw new Error('IOSStorage not implemented yet');
  }

  async clearAll(): Promise<void> {
    throw new Error('IOSStorage not implemented yet');
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