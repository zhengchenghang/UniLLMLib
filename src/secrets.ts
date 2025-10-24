// src/secrets.ts
import { StorageFactory } from './storage/factory';

const SERVICE = 'unillm';

// 获取平台特定的存储实例
const storage = StorageFactory.getStorage(SERVICE);

export async function setSecret(key: string, value: string): Promise<void> {
  await storage.setSecret(key, value);
}

export async function getSecret(key: string): Promise<string | null> {
  return await storage.getSecret(key);
}

export async function deleteSecret(key: string): Promise<boolean> {
  return await storage.deleteSecret(key);
}

export async function getAllSecrets(): Promise<string[]> {
  return await storage.getAllKeys();
}

export async function clearAllSecrets(): Promise<void> {
  await storage.clearAll();
}

// 保持原有的 resolveValue 函数
export async function resolveValue(value: any): Promise<any> {
  if (typeof value === 'string' && value.startsWith('@secret:')) {
    const key = value.slice(8);
    return getSecret(key);
  }
  return Promise.resolve(value);
}