// examples/multi-user.ts
/**
 * 多用户Secret隔离示例
 * 
 * 本示例展示如何使用用户ID来隔离不同用户的Secret，
 * 避免在同一个应用中不同用户的配置相互覆盖。
 */

import {
  setSecret,
  getSecret,
  deleteSecret,
  getAllSecrets,
  clearAllSecrets,
  setCurrentUserId,
  getCurrentUserId,
  clearCurrentUserId,
  hasCurrentUserId,
} from '../src/index';

async function demonstrateMultiUser() {
  console.log('=== 多用户Secret隔离示例 ===\n');

  // 1. 检查初始状态
  console.log('1. 初始状态检查:');
  console.log(`当前用户ID: ${getCurrentUserId()}`);
  console.log(`是否设置了用户ID: ${hasCurrentUserId()}\n`);

  // 2. 为用户A设置Secret
  console.log('2. 为用户A设置Secret:');
  setCurrentUserId('user-alice');
  console.log(`切换到用户: ${getCurrentUserId()}`);
  
  await setSecret('openai_api_key', 'alice-openai-key-123');
  await setSecret('qwen_api_key', 'alice-qwen-key-456');
  
  let secrets = await getAllSecrets();
  console.log(`用户A的所有secrets: ${secrets.join(', ')}`);
  console.log(`用户A的openai_api_key: ${await getSecret('openai_api_key')}\n`);

  // 3. 为用户B设置Secret
  console.log('3. 为用户B设置Secret:');
  setCurrentUserId('user-bob');
  console.log(`切换到用户: ${getCurrentUserId()}`);
  
  await setSecret('openai_api_key', 'bob-openai-key-789');
  await setSecret('zhipu_api_key', 'bob-zhipu-key-012');
  
  secrets = await getAllSecrets();
  console.log(`用户B的所有secrets: ${secrets.join(', ')}`);
  console.log(`用户B的openai_api_key: ${await getSecret('openai_api_key')}\n`);

  // 4. 验证用户隔离
  console.log('4. 验证用户隔离 - 切换回用户A:');
  setCurrentUserId('user-alice');
  console.log(`当前用户: ${getCurrentUserId()}`);
  
  secrets = await getAllSecrets();
  console.log(`用户A的所有secrets: ${secrets.join(', ')}`);
  console.log(`用户A的openai_api_key: ${await getSecret('openai_api_key')}`);
  console.log(`用户A的zhipu_api_key: ${await getSecret('zhipu_api_key')} (应该为null)\n`);

  // 5. 删除特定用户的Secret
  console.log('5. 删除用户A的某个Secret:');
  const deleted = await deleteSecret('qwen_api_key');
  console.log(`删除qwen_api_key: ${deleted ? '成功' : '失败'}`);
  
  secrets = await getAllSecrets();
  console.log(`用户A剩余的secrets: ${secrets.join(', ')}\n`);

  // 6. 清除用户B的所有Secrets
  console.log('6. 清除用户B的所有Secrets:');
  setCurrentUserId('user-bob');
  console.log(`当前用户: ${getCurrentUserId()}`);
  
  await clearAllSecrets();
  secrets = await getAllSecrets();
  console.log(`清除后用户B的secrets数量: ${secrets.length}\n`);

  // 7. 验证用户A的数据未受影响
  console.log('7. 验证用户A的数据未受影响:');
  setCurrentUserId('user-alice');
  secrets = await getAllSecrets();
  console.log(`用户A的secrets: ${secrets.join(', ')}`);
  console.log(`用户A的openai_api_key: ${await getSecret('openai_api_key')}\n`);

  // 8. 清理用户A的数据
  console.log('8. 清理测试数据:');
  await clearAllSecrets();
  console.log('已清除用户A的所有secrets\n');

  // 9. 清除用户ID（恢复默认状态）
  console.log('9. 清除用户ID:');
  clearCurrentUserId();
  console.log(`当前用户ID: ${getCurrentUserId()}`);
  console.log(`是否设置了用户ID: ${hasCurrentUserId()}\n`);

  console.log('=== 示例完成 ===');
}

// 实际使用场景示例
async function practicalUsageExample() {
  console.log('\n\n=== 实际使用场景示例 ===\n');
  
  // 模拟：用户登录时设置用户ID
  const userId = 'user-12345';
  console.log(`用户登录: ${userId}`);
  setCurrentUserId(userId);
  
  // 用户设置API密钥（这些密钥会自动与用户ID关联）
  await setSecret('openai_api_key', 'sk-...');
  console.log('已保存用户的OpenAI API密钥\n');
  
  // 在应用运行期间使用密钥（自动读取当前用户的密钥）
  const apiKey = await getSecret('openai_api_key');
  console.log(`获取到的API密钥: ${apiKey}\n`);
  
  // 用户登出时清除用户ID
  console.log('用户登出');
  clearCurrentUserId();
  
  // 清理测试数据
  setCurrentUserId(userId);
  await clearAllSecrets();
  clearCurrentUserId();
  
  console.log('=== 实际场景示例完成 ===');
}

// 运行示例
async function main() {
  try {
    await demonstrateMultiUser();
    await practicalUsageExample();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

main();
