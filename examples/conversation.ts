// examples/conversation.ts - 多轮对话示例

import llmManager, { Message } from '../src/index';

async function main() {
  console.log('=== 多轮对话示例 ===\n');

  await llmManager.init();

  const instances = llmManager.listInstances();
  const qwenInstance = instances.find(inst => inst.templateId === 'qwen') ?? instances[0];
  if (!qwenInstance) {
    throw new Error('未找到可用的配置实例');
  }

  await llmManager.setCurrentInstance(qwenInstance.id);
  await llmManager.setCurrentModel('qwen-plus');

  // 维护对话历史
  const conversationHistory: Message[] = [
    { role: 'system', content: '你是一个友好的助手，擅长教学' }
  ];

  // 第一轮对话
  console.log('用户: 什么是递归？');
  conversationHistory.push({
    role: 'user',
    content: '什么是递归？'
  });

  try {
    let response = await llmManager.chat({
      messages: conversationHistory,
      stream: false,
    });

    if (!isAsyncGenerator(response)) {
      console.log(`助手: ${response.content}\n`);
      conversationHistory.push({
        role: 'assistant',
        content: response.content
      });
    }

    // 第二轮对话（基于上下文）
    console.log('用户: 能举个例子吗？');
    conversationHistory.push({
      role: 'user',
      content: '能举个例子吗？'
    });

    response = await llmManager.chat({
      messages: conversationHistory,
      stream: false,
    });

    if (!isAsyncGenerator(response)) {
      console.log(`助手: ${response.content}\n`);
      conversationHistory.push({
        role: 'assistant',
        content: response.content
      });
    }

    // 第三轮对话
    console.log('用户: 递归的优缺点是什么？');
    conversationHistory.push({
      role: 'user',
      content: '递归的优缺点是什么？'
    });

    response = await llmManager.chat({
      messages: conversationHistory,
      stream: false,
    });

    if (!isAsyncGenerator(response)) {
      console.log(`助手: ${response.content}\n`);
    }

  } catch (error) {
    console.log('❌ 错误:', (error as Error).message);
  }

  console.log('=== 对话结束 ===');
}

function isAsyncGenerator(obj: any): obj is AsyncGenerator<string> {
  return obj && typeof obj.next === 'function' && typeof obj[Symbol.asyncIterator] === 'function';
}

main().catch(console.error);

