// examples/linux-storage.ts
/**
 * Linux平台密钥存储示例
 * 
 * 该示例展示如何在Linux系统上使用安全存储功能
 * 支持Ubuntu、Debian、CentOS、Fedora等主流发行版
 */

import { LinuxStorage } from '../src/storage/linux';

async function main() {
  console.log('=== Linux安全存储示例 ===\n');

  const storage = new LinuxStorage('unillm-demo');

  // 1. 检查存储后端
  console.log('1. 存储后端检查');
  const backend = storage.getStorageBackend();
  console.log(`   当前使用的后端: ${backend}`);
  
  if (backend === 'libsecret') {
    console.log('   ✓ 使用libsecret (GNOME Keyring/KDE Wallet)');
    console.log('   这是最安全的选项，密钥由系统密钥环管理\n');
  } else {
    console.log('   ✓ 使用加密文件存储');
    console.log('   使用AES-256-GCM加密，密钥基于机器ID派生\n');
  }

  // 2. 测试libsecret可用性（可选）
  console.log('2. 测试libsecret可用性');
  const libsecretAvailable = await storage.testLibsecret();
  console.log(`   libsecret可用: ${libsecretAvailable ? '是' : '否'}\n`);

  // 3. 存储密钥
  console.log('3. 存储API密钥');
  await storage.setSecret('openai-api-key', 'sk-test-key-123456');
  await storage.setSecret('qwen-api-key', 'qwen-test-key-789');
  console.log('   ✓ 已存储OpenAI API Key');
  console.log('   ✓ 已存储Qwen API Key\n');

  // 4. 获取密钥
  console.log('4. 读取API密钥');
  const openaiKey = await storage.getSecret('openai-api-key');
  const qwenKey = await storage.getSecret('qwen-api-key');
  console.log(`   OpenAI Key: ${openaiKey}`);
  console.log(`   Qwen Key: ${qwenKey}\n`);

  // 5. 列出所有密钥
  console.log('5. 列出所有密钥');
  const allKeys = await storage.getAllKeys();
  console.log(`   存储的密钥列表: ${allKeys.join(', ')}\n`);

  // 6. 删除单个密钥
  console.log('6. 删除密钥');
  const deleted = await storage.deleteSecret('qwen-api-key');
  console.log(`   删除qwen-api-key: ${deleted ? '成功' : '失败'}`);
  
  const remainingKeys = await storage.getAllKeys();
  console.log(`   剩余密钥: ${remainingKeys.join(', ')}\n`);

  // 7. 验证密钥已删除
  console.log('7. 验证密钥已删除');
  const deletedKey = await storage.getSecret('qwen-api-key');
  console.log(`   qwen-api-key: ${deletedKey === null ? '已删除' : '仍存在'}\n`);

  // 8. 清空所有密钥
  console.log('8. 清空所有密钥');
  await storage.clearAll();
  const finalKeys = await storage.getAllKeys();
  console.log(`   清空后的密钥数量: ${finalKeys.length}`);
  console.log(`   ${finalKeys.length === 0 ? '✓ 清空成功' : '✗ 清空失败'}\n`);

  console.log('=== 示例完成 ===');
  
  // 安全性说明
  console.log('\n安全性说明：');
  console.log('- 优先使用libsecret（系统密钥环服务）');
  console.log('- Fallback使用AES-256-GCM加密文件存储');
  console.log('- 加密密钥基于机器ID + 用户名派生');
  console.log('- 文件权限设置为600（仅当前用户可访问）');
  console.log('- 使用随机IV和认证标签防止篡改');
  
  console.log('\n支持的Linux发行版：');
  console.log('- Ubuntu (GNOME Keyring)');
  console.log('- Debian (GNOME Keyring)');
  console.log('- CentOS/RHEL (libsecret)');
  console.log('- Fedora (GNOME Keyring)');
  console.log('- Arch Linux (GNOME Keyring/KDE Wallet)');
  console.log('- 其他支持libsecret的发行版');
}

main().catch(console.error);
