// examples/setup-keys.ts - 首次使用：设置 API Keys

import { setSecret } from '../src/index';

/**
 * 首次使用时运行此脚本来设置你的 API Keys
 * 
 * 运行方式:
 * npx ts-node examples/setup-keys.ts
 */

async function setupKeys() {
  console.log('=== UniLLM-TS API Key 设置工具 ===\n');

  try {
    // OpenAI
    // await setSecret('openai-api-key', 'sk-your-openai-key-here');
    // console.log('✓ OpenAI API Key 已设置');

    // 通义千问
    // await setSecret('qwen-api-key', 'your-qwen-api-key-here');
    // console.log('✓ Qwen API Key 已设置');

    // 智谱 AI
    // await setSecret('zhipu-api-key', 'your-zhipu-api-key-here');
    // console.log('✓ ZhiPu API Key 已设置');

    // Moonshot Kimi
    // await setSecret('kimi-api-key', 'your-kimi-api-key-here');
    // console.log('✓ Kimi API Key 已设置');

    // 讯飞星火
    // await setSecret('spark-app-id', 'your-app-id');
    // await setSecret('spark-api-key', 'your-api-key');
    // await setSecret('spark-api-secret', 'your-api-secret');
    // console.log('✓ Spark API Keys 已设置');

    console.log('\n提示: 请取消注释并填入你的实际 API Key');
    console.log('\n如何获取 API Key:');
    console.log('- OpenAI: https://platform.openai.com/api-keys');
    console.log('- 通义千问: https://dashscope.console.aliyun.com/');
    console.log('- 智谱 AI: https://open.bigmodel.cn/');
    console.log('- Moonshot: https://platform.moonshot.cn/');
    console.log('- 讯飞星火: https://console.xfyun.cn/');

    console.log('\n设置完成后，你可以运行:');
    console.log('npx ts-node examples/basic.ts');

  } catch (error) {
    console.error('错误:', (error as Error).message);
    
    if ((error as Error).message.includes('keytar')) {
      console.log('\n提示: keytar 未安装或不可用');
      console.log('你可以选择:');
      console.log('1. 安装 keytar 的系统依赖 (参考 INSTALL.md)');
      console.log('2. 直接在配置文件中使用明文 API Key (仅开发环境)');
      console.log('3. 使用环境变量');
    }
  }
}

setupKeys();

