// examples/setup-keys.ts - 首次使用：设置 API Keys

import { LLMManager } from '../src/index';
import {
  prepareExampleSecrets,
  syncSecretsFromEnv,
  getMissingSecretFields,
  describeSecretField,
  SECRET_ENV_MAP,
} from './helpers';

/**
 * 首次使用时运行此脚本来设置你的 API Keys。
 *
 * 推荐优先使用环境变量，示例会自动读取以下变量：
 * OPENAI_API_KEY、QWEN_API_KEY、QWEN_ACCESS_KEY_ID、QWEN_ACCESS_KEY_SECRET、
 * ZHIPU_API_KEY、MOONSHOT_API_KEY、SPARK_APP_ID、SPARK_API_KEY、SPARK_API_SECRET
 */

async function setupKeys() {
  console.log('=== UniLLM-TS API Key 设置工具 ===\n');

  const fallbackPath = await prepareExampleSecrets();
  const manager = new LLMManager();
  await manager.init();

  if (fallbackPath) {
    console.log(`⚠️  当前平台未提供安全存储，示例将采用文件方式保存凭证: ${fallbackPath}`);
    console.log('⚠️  请勿在生产环境中使用该方式保存敏感信息。\n');
  }

  const instances = manager.listInstances();
  const applied = await syncSecretsFromEnv(instances);

  if (applied.length > 0) {
    console.log(`✓ 已根据以下环境变量写入凭证: ${applied.join(', ')}`);
  } else {
    console.log('ℹ️  未检测到环境变量中的凭证，请根据下方提示进行配置。');
  }

  console.log('\n支持的环境变量映射:');
  Object.entries(SECRET_ENV_MAP).forEach(([templateId, fieldMap]) => {
    const fields = Object.entries(fieldMap)
      .map(([field, envVar]) => `${field} -> ${envVar}`)
      .join(', ');
    console.log(` - ${templateId}: ${fields}`);
  });

  console.log('\n当前实例凭证状态:');
  for (const instance of instances) {
    const missing = await getMissingSecretFields(instance);
    if (missing.length === 0) {
      console.log(`✓ ${instance.name}: 所有凭证已配置`);
      continue;
    }

    console.log(`⚠️  ${instance.name} 缺少以下字段:`);
    missing.forEach(field => {
      console.log(`   - ${describeSecretField(instance, field)}`);
    });
  }

  console.log('\n如果需要通过脚本写入，可以调用 setSecret。例如：');
  instances.forEach(instance => {
    Object.entries(instance.secretKeys).forEach(([field, secretKey]) => {
      console.log(`await setSecret('${secretKey}', '<your-${field}-value>');`);
    });
  });

  console.log('\n设置完成后，你可以运行以下命令验证示例:');
  console.log('npm run examples:basic');
}

setupKeys().catch(error => {
  console.error('错误:', (error as Error).message);
});
