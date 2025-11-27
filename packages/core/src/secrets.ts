// src/secrets.ts
import { StorageFactory } from './storage/factory';
import {
  encodeUserKey,
  decodeUserKey,
  isCurrentUserKey,
  getCurrentUserKeyPrefix,
} from './userContext';

const SERVICE = 'unillm';

// 获取平台特定的存储实例
const storage = StorageFactory.getStorage(SERVICE);

/**
 * 存储Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @param value Secret的值
 */
export async function setSecret(key: string, value: string): Promise<void> {
  const encodedKey = encodeUserKey(key);
  await storage.setSecret(encodedKey, value);
}

/**
 * 获取Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @returns Secret的值，如果不存在则返回null
 */
export async function getSecret(key: string): Promise<string | null> {
  const encodedKey = encodeUserKey(key);
  return await storage.getSecret(encodedKey);
}

/**
 * 删除Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @returns 是否成功删除
 */
export async function deleteSecret(key: string): Promise<boolean> {
  const encodedKey = encodeUserKey(key);
  return await storage.deleteSecret(encodedKey);
}

/**
 * 获取所有Secret的key列表
 * 如果设置了用户ID，只返回当前用户的secrets
 * 如果未设置用户ID，返回所有未编码的secrets
 * @returns Secret key列表（解码后的原始key）
 */
export async function getAllSecrets(): Promise<string[]> {
  const allKeys = await storage.getAllKeys();
  const userPrefix = getCurrentUserKeyPrefix();
  
  if (userPrefix) {
    // 如果设置了用户ID，只返回属于当前用户的keys
    return allKeys
      .filter(key => key.startsWith(userPrefix))
      .map(key => key.substring(userPrefix.length));
  } else {
    // 如果未设置用户ID，返回所有未编码的keys（向后兼容）
    return allKeys.filter(key => !decodeUserKey(key));
  }
}

/**
 * 清除所有Secret
 * 如果设置了用户ID，只清除当前用户的secrets
 * 如果未设置用户ID，清除所有未编码的secrets
 */
export async function clearAllSecrets(): Promise<void> {
  const allKeys = await storage.getAllKeys();
  const keysToDelete = allKeys.filter(key => isCurrentUserKey(key));
  
  for (const key of keysToDelete) {
    await storage.deleteSecret(key);
  }
}

// 保持原有的 resolveValue 函数
export async function resolveValue(value: any): Promise<any> {
  if (typeof value === 'string' && value.startsWith('@secret:')) {
    const key = value.slice(8);
    return getSecret(key);
  }
  return Promise.resolve(value);
}