// examples/basic.ts - 基础使用示例

import llmManager from '../src/index';
import {
  prepareExampleSecrets,
  syncSecretsFromEnv,
  getMissingSecretFields,
  printMissingSecretHelp,
} from './helpers';

async function main() {
  console.log('=== UniLLM-TS 基础使用示例 ===\n');

  // 1. 初始化环境与加载凭证
  console.log('1. 初始化环境与加载凭证...');
  const fallbackPath = await prepareExampleSecrets();
  await llmManager.init();
  console.log('   ✓ LLM Manager 初始化完成');

  if (fallbackPath) {
    console.log(`   ⚠️ 当前平台尚未提供安全存储，示例将使用文件方式保存在: ${fallbackPath}`);
    console.log('   ⚠️ 该方式仅用于示例演示，请勿在生产环境中使用。');
  }

  const instances = llmManager.listInstances();
  const syncedEnvVars = await syncSecretsFromEnv(instances);
  if (syncedEnvVars.length > 0) {
    console.log(`   ✓ 已从环境变量加载 ${syncedEnvVars.length} 个凭证`);
  } else {
    console.log('   ℹ️  未检测到环境变量提供的凭证');
    console.log('   提示：可以运行 examples/setup-keys.ts 或设置对应的环境变量来配置 API Key');
  }
  console.log();

  // 2. 查询支持的模型与模板
  console.log('2. 查询支持的模型与模板:');
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

  console.log('\n   当前配置实例:');
  instances.forEach(inst => {
    console.log(`   - ${inst.id} (${inst.name}) <- ${inst.templateId}, selected model: ${inst.selectedModelId ?? '未设置'}`);
  });
  console.log();

  // 3. 选择实例与模型
  console.log('3. 选择实例与模型...');
  const qwenInstance = instances.find(inst => inst.templateId === 'qwen') ?? instances[0];
  if (!qwenInstance) {
    throw new Error('未找到可用的配置实例，请确认模板数据是否正确');
  }

  await llmManager.setCurrentInstance(qwenInstance.id);
  console.log(`   ✓ 当前实例: ${qwenInstance.name}`);

  const targetModel = 'qwen-plus';
  await llmManager.setCurrentModel(targetModel);
  console.log(`   ✓ 已选择模型: ${llmManager.getCurrentModel()}`);

  const missingSecrets = await getMissingSecretFields(qwenInstance);
  if (missingSecrets.length === 0) {
    console.log('   ✓ 必要凭证已配置\n');
  } else {
    console.log();
    printMissingSecretHelp(qwenInstance, missingSecrets);
    console.log('   由于缺少凭证，后续对话示例将被跳过。\n');
  }

  // 4. 查询模型配置
  console.log('4. 查询模型配置（脱敏）：');
  const config = llmManager.getModelConfig(targetModel);
  console.log('   ', JSON.stringify(config, null, 2), '\n');

  if (missingSecrets.length > 0) {
    console.log('=== 示例完成（因凭证缺失未执行对话调用） ===');
    return;
  }

  // 5. 简单对话（非流式）
  console.log('5. 简单对话测试（非流式）：');
  try {
    const response = await llmManager.chatSimple('你好！请用一句话介绍你自己。');
    console.log('   回复:', response, '\n');
  } catch (error) {
    console.log('   ❌ 错误:', (error as Error).message);
    console.log('   提示：请确认已正确配置 API Key\n');
  }

  // 6. 流式对话
  console.log('6. 流式对话测试：');
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

  // 7. 高级对话接口
  console.log('7. 高级对话接口（带系统提示）：');
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
