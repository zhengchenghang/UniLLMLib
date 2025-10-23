// examples/basic.ts - 基础使用示例

import llmManager from '../src/index';
import { setSecret } from '../src/index';

async function main() {
  console.log('=== UniLLM-TS 基础使用示例 ===\n');

  // 1. 设置 API Keys（首次使用时需要）
  console.log('1. 设置 API Keys...');
  // await setSecret('openai-api-key', 'your-openai-key-here');
  // await setSecret('qwen-api-key', 'your-qwen-key-here');
  console.log('   提示：请取消注释并填入您的 API Key\n');

  // 2. 初始化管理器
  console.log('2. 初始化 LLM Manager...');
  await llmManager.init();
  console.log('   ✓ 初始化完成\n');

  // 3. 查询支持的模型
  console.log('3. 查询支持的模型：');
  const models = llmManager.listModels();
  console.log('   可用模型:', models);

  const modelsInfo = llmManager.getModelsInfo();
  console.log('   模型详情:');
  modelsInfo.forEach(info => {
    console.log(`   - ${info.name}: ${info.provider}/${info.model}`);
  });
  console.log();

  // 4. 选择模型
  console.log('4. 选择模型...');
  const targetModel = 'qwen-plus';
  llmManager.selectModel(targetModel);
  console.log(`   ✓ 已选择模型: ${llmManager.getCurrentModel()}\n`);

  // 5. 查询模型配置
  console.log('5. 查询模型配置（脱敏）：');
  const config = llmManager.getModelConfig(targetModel);
  console.log('   ', JSON.stringify(config, null, 2), '\n');

  // 6. 简单对话（非流式）
  console.log('6. 简单对话测试（非流式）：');
  try {
    const response = await llmManager.chatSimple('你好！请用一句话介绍你自己。');
    console.log('   回复:', response, '\n');
  } catch (error) {
    console.log('   ❌ 错误:', (error as Error).message);
    console.log('   提示：请确保已正确配置 API Key\n');
  }

  // 7. 流式对话
  console.log('7. 流式对话测试：');
  console.log('   问题: 请写一首关于春天的五言绝句');
  console.log('   回复: ');
  try {
    const stream = await llmManager.chatStream('请写一首关于春天的五言绝句');
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    console.log('\n');
  } catch (error) {
    console.log('   ❌ 错误:', (error as Error).message, '\n');
  }

  // 8. 高级对话接口
  console.log('8. 高级对话接口（带系统提示）：');
  try {
    const response = await llmManager.chat({
      messages: [
        { role: 'system', content: '你是一个专业的代码审查助手' },
        { role: 'user', content: '请简要说明代码审查的三个要点' }
      ],
      temperature: 0.7,
      max_tokens: 200,
      stream: false,
    });

    if (!isAsyncGenerator(response)) {
      console.log('   回复:', response.content);
      if (response.usage) {
        console.log('   Token 使用:', response.usage);
      }
    }
  } catch (error) {
    console.log('   ❌ 错误:', (error as Error).message);
  }

  console.log('\n=== 示例完成 ===');
}

function isAsyncGenerator(obj: any): obj is AsyncGenerator<string> {
  return obj && typeof obj.next === 'function';
}

// 运行示例
main().catch(console.error);

