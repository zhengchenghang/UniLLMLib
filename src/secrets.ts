// src/secrets.ts
// @ts-ignore - keytar需要在运行时安装
import * as keytar from 'keytar';

const SERVICE = 'unillm';

export async function setSecret(key: string, value: string): Promise<void> {
  if (!keytar) {
    throw new Error('keytar is not available. Please install keytar to use secure storage.');
  }
  await keytar.setPassword(SERVICE, key, value);
}

export async function getSecret(key: string): Promise<string | null> {
  if (!keytar) {
    throw new Error('keytar is not available. Please install keytar to use secure storage.');
  }
  const password = await keytar.getPassword(SERVICE, key);
  return password;
}

// 解析配置中的 @secret:xxx
export async function resolveValue(value: any): Promise<any> {
  if (typeof value === 'string' && value.startsWith('@secret:')) {
    const key = value.slice(8); // 移除 @secret:
    return getSecret(key);
  }
  return Promise.resolve(value);
}