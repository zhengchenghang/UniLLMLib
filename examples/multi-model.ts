// examples/multi-model.ts - 多模型对比示例

import { LLMManager } from '../src/index';

async function main() {
  console.log('=== 多模型对比示例 ===\n');

  const manager = new LLMManager();
  await manager.init();

  const models = manager.listModels();
  const question = '用一句话解释什么是人工智能？';

  console.log(`问题: ${question}\n`);
  console.log('各模型回答:\n');

  // 遍历所有模型获取回答
  for (const modelName of models) {
    try {
      console.log(`[${modelName}]`);
      const response = await manager.chatSimple(question, modelName);
      console.log(`${response}\n`);
    } catch (error) {
      console.log(`❌ 错误: ${(error as Error).message}\n`);
    }
  }

  console.log('=== 对比完成 ===');
}

main().catch(console.error);

