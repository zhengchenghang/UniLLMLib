// examples/multi-model.ts - 多模型对比示例

import { LLMManager } from '../src/index';
import {
  prepareExampleSecrets,
  syncSecretsFromEnv,
  getMissingSecretFields,
  printMissingSecretHelp,
} from './helpers';

async function main() {
  console.log('=== 多模型对比示例 ===\n');

  const fallbackPath = await prepareExampleSecrets();
  const manager = new LLMManager();
  await manager.init();

  if (fallbackPath) {
    console.log(`⚠️  当前平台使用文件方式保存示例凭证：${fallbackPath}`);
    console.log('⚠️  该方式仅供示例使用，请勿在生产环境中依赖。\n');
  }

  const templates = manager.getConfigTemplates();
  const instances = manager.listInstances();
  await syncSecretsFromEnv(instances);

  const question = '用一句话解释什么是人工智能？';
  console.log(`问题: ${question}\n`);

  for (const template of templates) {
    const instance = instances.find(inst => inst.templateId === template.id);
    if (!instance) {
      console.log(`跳过 ${template.name}，未找到可用的配置实例\n`);
      continue;
    }

    const missingSecrets = await getMissingSecretFields(instance);
    if (missingSecrets.length > 0) {
      console.log(`[${template.name}] 使用实例: ${instance.name}`);
      printMissingSecretHelp(instance, missingSecrets);
      continue;
    }

    await manager.setCurrentInstance(instance.id);
    console.log(`[${template.name}] 使用实例: ${instance.name}`);

    for (const modelId of template.modelIds) {
      try {
        await manager.setCurrentModel(modelId);
        const response = await manager.chatSimple(question);
        console.log(` - 模型 ${modelId}: ${response}`);
      } catch (error) {
        console.log(` - 模型 ${modelId} 调用失败: ${(error as Error).message}`);
      }
    }

    console.log();
  }

  console.log('=== 对比完成 ===');
}

main().catch(console.error);
