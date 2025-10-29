import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';

import { StorageFactory } from '../src/storage/factory';
import type { SecureStorageInterface } from '../src/storage/interface';
import { getSecret, setSecret } from '../src/index';
import type { ConfigInstanceSummary } from '../src/types';

type SecretMethod = keyof SecureStorageInterface;

class FileSecretStorage implements SecureStorageInterface {
  private cache: Map<string, string> | null = null;

  constructor(private readonly filePath: string) {}

  private async ensureLoaded(): Promise<Map<string, string>> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(content) as Record<string, string>;
      this.cache = new Map(Object.entries(parsed));
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        console.warn(`[examples] 无法读取示例密钥文件 ${this.filePath}:`, error?.message ?? error);
      }
      this.cache = new Map();
    }

    return this.cache;
  }

  private async persist(): Promise<void> {
    if (!this.cache) {
      return;
    }

    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const data = Object.fromEntries(this.cache.entries());
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async setSecret(key: string, value: string): Promise<void> {
    const store = await this.ensureLoaded();
    store.set(key, value);
    await this.persist();
  }

  async getSecret(key: string): Promise<string | null> {
    const store = await this.ensureLoaded();
    return store.get(key) ?? null;
  }

  async deleteSecret(key: string): Promise<boolean> {
    const store = await this.ensureLoaded();
    const existed = store.delete(key);
    await this.persist();
    return existed;
  }

  async getAllKeys(): Promise<string[]> {
    const store = await this.ensureLoaded();
    return Array.from(store.keys());
  }

  async clearAll(): Promise<void> {
    this.cache = new Map();
    await this.persist();
  }
}

function isNotImplementedError(error: unknown): error is Error {
  return error instanceof Error && /not implemented yet/i.test(error.message);
}

const SECRET_ENV_MAP: Record<string, Record<string, string>> = {
  openai: {
    api_key: 'OPENAI_API_KEY',
  },
  qwen: {
    api_key: 'QWEN_API_KEY',
    access_key_id: 'QWEN_ACCESS_KEY_ID',
    access_key_secret: 'QWEN_ACCESS_KEY_SECRET',
  },
  zhipu: {
    api_key: 'ZHIPU_API_KEY',
  },
  moonshot: {
    api_key: 'MOONSHOT_API_KEY',
  },
  spark: {
    app_id: 'SPARK_APP_ID',
    api_key: 'SPARK_API_KEY',
    api_secret: 'SPARK_API_SECRET',
  },
};

const SECRET_METHODS: SecretMethod[] = ['setSecret', 'getSecret', 'deleteSecret', 'getAllKeys', 'clearAll'];

export async function prepareExampleSecrets(serviceName = 'unillm'): Promise<string | null> {
  const storage = StorageFactory.getStorage(serviceName);

  try {
    await storage.getAllKeys();
    return null;
  } catch (error) {
    if (!isNotImplementedError(error)) {
      throw error;
    }

    const directory = path.join(os.homedir(), '.unillm');
    const filePath = path.join(directory, 'examples-secrets.json');
    const fallback = new FileSecretStorage(filePath);

    for (const method of SECRET_METHODS) {
      (storage as any)[method] = (fallback as any)[method].bind(fallback);
    }

    return filePath;
  }
}

export async function syncSecretsFromEnv(instances: ConfigInstanceSummary[]): Promise<string[]> {
  const updatedEnvVars: string[] = [];

  for (const instance of instances) {
    const envMap = SECRET_ENV_MAP[instance.templateId];
    if (!envMap) {
      continue;
    }

    for (const [field, envVar] of Object.entries(envMap)) {
      const envValue = process.env[envVar];
      const secretKey = instance.secretKeys[field];

      if (!envValue || !secretKey) {
        continue;
      }

      const current = await getSecret(secretKey);
      if (current) {
        continue;
      }

      await setSecret(secretKey, envValue);
      if (!updatedEnvVars.includes(envVar)) {
        updatedEnvVars.push(envVar);
      }
    }
  }

  return updatedEnvVars;
}

export async function getMissingSecretFields(instance: ConfigInstanceSummary): Promise<string[]> {
  const missing: string[] = [];

  for (const [field, secretKey] of Object.entries(instance.secretKeys)) {
    if (!secretKey) {
      missing.push(field);
      continue;
    }

    const value = await getSecret(secretKey);
    if (!value) {
      missing.push(field);
    }
  }

  return missing;
}

export function describeSecretField(instance: ConfigInstanceSummary, field: string): string {
  const envMap = SECRET_ENV_MAP[instance.templateId];
  const envVar = envMap ? envMap[field] : undefined;
  return envVar ? `${field} (环境变量: ${envVar})` : field;
}

export function printMissingSecretHelp(instance: ConfigInstanceSummary, missingFields: string[]): void {
  if (missingFields.length === 0) {
    return;
  }

  console.log(`⚠️  检测到实例 "${instance.name}" 缺少以下凭证:`);
  missingFields.forEach(field => {
    console.log(`   - ${describeSecretField(instance, field)}`);
  });
  console.log('   你可以设置对应的环境变量，或者运行 examples/setup-keys.ts 写入凭证。\n');
}

export { SECRET_ENV_MAP };
