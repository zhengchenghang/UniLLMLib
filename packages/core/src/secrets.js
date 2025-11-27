"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSecret = setSecret;
exports.getSecret = getSecret;
exports.deleteSecret = deleteSecret;
exports.getAllSecrets = getAllSecrets;
exports.clearAllSecrets = clearAllSecrets;
exports.resolveValue = resolveValue;
// src/secrets.ts
const factory_1 = require("./storage/factory");
const userContext_1 = require("./userContext");
const SERVICE = 'unillm';
// 获取平台特定的存储实例
const storage = factory_1.StorageFactory.getStorage(SERVICE);
/**
 * 存储Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @param value Secret的值
 */
async function setSecret(key, value) {
    const encodedKey = (0, userContext_1.encodeUserKey)(key);
    await storage.setSecret(encodedKey, value);
}
/**
 * 获取Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @returns Secret的值，如果不存在则返回null
 */
async function getSecret(key) {
    const encodedKey = (0, userContext_1.encodeUserKey)(key);
    return await storage.getSecret(encodedKey);
}
/**
 * 删除Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @returns 是否成功删除
 */
async function deleteSecret(key) {
    const encodedKey = (0, userContext_1.encodeUserKey)(key);
    return await storage.deleteSecret(encodedKey);
}
/**
 * 获取所有Secret的key列表
 * 如果设置了用户ID，只返回当前用户的secrets
 * 如果未设置用户ID，返回所有未编码的secrets
 * @returns Secret key列表（解码后的原始key）
 */
async function getAllSecrets() {
    const allKeys = await storage.getAllKeys();
    const userPrefix = (0, userContext_1.getCurrentUserKeyPrefix)();
    if (userPrefix) {
        // 如果设置了用户ID，只返回属于当前用户的keys
        return allKeys
            .filter(key => key.startsWith(userPrefix))
            .map(key => key.substring(userPrefix.length));
    }
    else {
        // 如果未设置用户ID，返回所有未编码的keys（向后兼容）
        return allKeys.filter(key => !(0, userContext_1.decodeUserKey)(key));
    }
}
/**
 * 清除所有Secret
 * 如果设置了用户ID，只清除当前用户的secrets
 * 如果未设置用户ID，清除所有未编码的secrets
 */
async function clearAllSecrets() {
    const allKeys = await storage.getAllKeys();
    const keysToDelete = allKeys.filter(key => (0, userContext_1.isCurrentUserKey)(key));
    for (const key of keysToDelete) {
        await storage.deleteSecret(key);
    }
}
// 保持原有的 resolveValue 函数
async function resolveValue(value) {
    if (typeof value === 'string' && value.startsWith('@secret:')) {
        const key = value.slice(8);
        return getSecret(key);
    }
    return Promise.resolve(value);
}
//# sourceMappingURL=secrets.js.map