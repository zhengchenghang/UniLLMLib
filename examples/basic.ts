// examples/basic.ts - 基础使用示例

import llmManager, { setSecret } from '../src/index';

async function main() {
  console.log('=== UniLLM-TS 基础使用示例 ===\n');

  // 1. 设置 API Keys（首次使用时需要）
  console.log('1. 设置 API Keys...');
  // await setSecret('openai-default-api_key', 'your-openai-key-here');
  // await setSecret('qwen-default-api_key', 'your-qwen-key-here');
  console.log('   提示：请在首次运行时取消注释并填入您的 API Key\n');

  // 2. 初始化管理器
  console.log('2. 初始化 LLM Manager...');
  await llmManager.init();
  console.log('   ✓ 初始化完成\n');

  // 3. 查询支持的模型与模板
  console.log('3. 查询支持的模型与模板:');
  const models = llmManager.listModels();
  console.log('   模型 ID:', models);

  const modelsInfo = llmManager.getModelsInfo();
  console.log('   模型详情:');
  modelsInfo.forEach(info => {
    console.log(`   - ${info.id}: ${info.provider}/${info.model}`);
  });

  const templates = llmManager.getConfigTemplates();
  console.log('\n   模板列表:');
  templates.forEach(tpl => {
    console.log(`   - ${tpl.id} (${tpl.name}) -> models: ${tpl.modelIds.join(', ')}`);
  });

  const instances = llmManager.listInstances();
  console.log('\n   当前配置实例:');
  instances.forEach(inst => {
    console.log(`   - ${inst.id} (${inst.name}) <- ${inst.templateId}, selected model: ${inst.selectedModelId ?? '未设置'}`);
  });
  console.log();

  // 4. 选择实例与模型
  console.log('4. 选择实例与模型...');
  const qwenInstance = instances.find(inst => inst.templateId === 'qwen') ?? instances[0];
  if (!qwenInstance) {
    throw new Error('未找到可用的配置实例，请确认模板数据是否正确');
  }

  await llmManager.setCurrentInstance(qwenInstance.id);
  console.log(`   ✓ 当前实例: ${qwenInstance.name}`);

  const targetModel = 'qwen-plus';
  await llmManager.setCurrentModel(targetModel);
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
  return obj && typeof obj.next === 'function' && typeof obj[Symbol.asyncIterator] === 'function';
}

// 运行示例
main().catch(console.error);
