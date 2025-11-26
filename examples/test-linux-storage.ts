// examples/test-linux-storage.ts
/**
 * Linux存储测试脚本
 * 
 * 验证Linux密钥存储的各项功能
 */

import { LinuxStorage } from '../src/storage/linux';
import * as assert from 'assert';

async function testBasicOperations() {
  console.log('\n=== 测试基本操作 ===');
  const storage = new LinuxStorage('unillm-test');

  // 清空测试环境
  await storage.clearAll();

  // 测试存储
  await storage.setSecret('test-key-1', 'value-1');
  const value1 = await storage.getSecret('test-key-1');
  assert.strictEqual(value1, 'value-1', '存储和读取失败');
  console.log('✓ 存储和读取密钥');

  // 测试更新
  await storage.setSecret('test-key-1', 'value-1-updated');
  const updated = await storage.getSecret('test-key-1');
  assert.strictEqual(updated, 'value-1-updated', '更新密钥失败');
  console.log('✓ 更新密钥');

  // 测试列出所有密钥
  await storage.setSecret('test-key-2', 'value-2');
  await storage.setSecret('test-key-3', 'value-3');
  const keys = await storage.getAllKeys();
  assert.ok(keys.includes('test-key-1'), '列出密钥失败');
  assert.ok(keys.includes('test-key-2'), '列出密钥失败');
  assert.ok(keys.includes('test-key-3'), '列出密钥失败');
  console.log(`✓ 列出所有密钥 (${keys.length}个)`);

  // 测试删除
  const deleted = await storage.deleteSecret('test-key-2');
  assert.strictEqual(deleted, true, '删除密钥失败');
  const deletedValue = await storage.getSecret('test-key-2');
  assert.strictEqual(deletedValue, null, '删除后仍能读取');
  console.log('✓ 删除密钥');

  // 测试清空
  await storage.clearAll();
  const afterClear = await storage.getAllKeys();
  assert.strictEqual(afterClear.length, 0, '清空失败');
  console.log('✓ 清空所有密钥');
}

async function testEdgeCases() {
  console.log('\n=== 测试边界情况 ===');
  const storage = new LinuxStorage('unillm-test');

  await storage.clearAll();

  // 测试空值
  await storage.setSecret('empty-key', '');
  const emptyValue = await storage.getSecret('empty-key');
  assert.strictEqual(emptyValue, '', '空值存储失败');
  console.log('✓ 空值存储');

  // 测试不存在的密钥
  const nonExistent = await storage.getSecret('non-existent-key');
  assert.strictEqual(nonExistent, null, '不存在的密钥应返回null');
  console.log('✓ 不存在的密钥返回null');

  // 测试删除不存在的密钥
  const deletedNonExistent = await storage.deleteSecret('non-existent-key');
  assert.strictEqual(deletedNonExistent, false, '删除不存在的密钥应返回false');
  console.log('✓ 删除不存在的密钥');

  // 测试特殊字符
  await storage.setSecret('special-chars', 'Hello 世界!@#$%^&*()');
  const specialValue = await storage.getSecret('special-chars');
  assert.strictEqual(specialValue, 'Hello 世界!@#$%^&*()', '特殊字符存储失败');
  console.log('✓ 特殊字符存储');

  // 测试长文本
  const longText = 'x'.repeat(10000);
  await storage.setSecret('long-text', longText);
  const longValue = await storage.getSecret('long-text');
  assert.strictEqual(longValue, longText, '长文本存储失败');
  console.log('✓ 长文本存储 (10,000字符)');

  // 测试JSON存储
  const jsonData = JSON.stringify({ 
    apiKey: 'sk-xxxxx', 
    endpoint: 'https://api.openai.com',
    models: ['gpt-4', 'gpt-3.5-turbo']
  });
  await storage.setSecret('json-data', jsonData);
  const jsonValue = await storage.getSecret('json-data');
  assert.strictEqual(jsonValue, jsonData, 'JSON存储失败');
  const parsed = JSON.parse(jsonValue!);
  assert.strictEqual(parsed.apiKey, 'sk-xxxxx', 'JSON解析失败');
  console.log('✓ JSON数据存储');

  await storage.clearAll();
}

async function testConcurrency() {
  console.log('\n=== 测试并发操作 ===');
  const storage = new LinuxStorage('unillm-test');

  await storage.clearAll();

  // 并发写入
  const writePromises = [];
  for (let i = 0; i < 10; i++) {
    writePromises.push(storage.setSecret(`concurrent-${i}`, `value-${i}`));
  }
  await Promise.all(writePromises);
  console.log('✓ 并发写入10个密钥');

  // 并发读取
  const readPromises = [];
  for (let i = 0; i < 10; i++) {
    readPromises.push(storage.getSecret(`concurrent-${i}`));
  }
  const values = await Promise.all(readPromises);
  for (let i = 0; i < 10; i++) {
    assert.strictEqual(values[i], `value-${i}`, `并发读取失败: concurrent-${i}`);
  }
  console.log('✓ 并发读取10个密钥');

  await storage.clearAll();
}

async function testStorageBackend() {
  console.log('\n=== 测试存储后端 ===');
  const storage = new LinuxStorage('unillm-test');

  const backend = storage.getStorageBackend();
  console.log(`当前后端: ${backend}`);

  if (backend === 'libsecret') {
    console.log('✓ 使用libsecret (系统密钥环)');
    
    // 测试libsecret可用性
    const available = await storage.testLibsecret();
    assert.strictEqual(available, true, 'libsecret测试失败');
    console.log('✓ libsecret测试通过');
  } else {
    console.log('✓ 使用加密文件存储 (fallback)');
    console.log('  提示: 安装libsecret以使用系统密钥环');
  }
}

async function testRealWorldScenario() {
  console.log('\n=== 测试真实场景 ===');
  const storage = new LinuxStorage('unillm-test');

  await storage.clearAll();

  // 模拟存储多个API密钥
  const apiKeys = {
    'openai-default-api_key': 'sk-openai-test-key-123456',
    'qwen-default-api_key': 'qwen-test-key-789',
    'zhipu-default-api_key': 'zhipu.test.key.xyz',
    'moonshot-default-api_key': 'moonshot-test-key-abc',
    'spark-default-api_id': 'spark-app-id',
    'spark-default-api_key': 'spark-api-key',
    'spark-default-api_secret': 'spark-api-secret'
  };

  console.log('存储多个LLM提供商的API密钥...');
  for (const [key, value] of Object.entries(apiKeys)) {
    await storage.setSecret(key, value);
  }
  console.log(`✓ 已存储 ${Object.keys(apiKeys).length} 个密钥`);

  // 验证所有密钥
  console.log('验证所有密钥...');
  for (const [key, expectedValue] of Object.entries(apiKeys)) {
    const value = await storage.getSecret(key);
    assert.strictEqual(value, expectedValue, `密钥验证失败: ${key}`);
  }
  console.log('✓ 所有密钥验证通过');

  // 列出所有密钥
  const allKeys = await storage.getAllKeys();
  console.log(`✓ 共存储 ${allKeys.length} 个密钥`);

  // 模拟删除某个提供商的密钥
  console.log('删除Spark相关密钥...');
  await storage.deleteSecret('spark-default-api_id');
  await storage.deleteSecret('spark-default-api_key');
  await storage.deleteSecret('spark-default-api_secret');
  
  const remainingKeys = await storage.getAllKeys();
  assert.strictEqual(remainingKeys.length, 4, '删除后密钥数量不正确');
  console.log(`✓ 删除后剩余 ${remainingKeys.length} 个密钥`);

  await storage.clearAll();
}

async function runAllTests() {
  console.log('========================================');
  console.log('     Linux存储功能测试');
  console.log('========================================');

  try {
    await testStorageBackend();
    await testBasicOperations();
    await testEdgeCases();
    await testConcurrency();
    await testRealWorldScenario();

    console.log('\n========================================');
    console.log('     ✓ 所有测试通过！');
    console.log('========================================\n');
  } catch (error: any) {
    console.error('\n========================================');
    console.error('     ✗ 测试失败');
    console.error('========================================');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
