"use strict";
// src/userContext.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCurrentUserId = setCurrentUserId;
exports.getCurrentUserId = getCurrentUserId;
exports.clearCurrentUserId = clearCurrentUserId;
exports.hasCurrentUserId = hasCurrentUserId;
exports.encodeUserKey = encodeUserKey;
exports.decodeUserKey = decodeUserKey;
exports.isCurrentUserKey = isCurrentUserKey;
exports.getCurrentUserKeyPrefix = getCurrentUserKeyPrefix;
/**
 * 用户上下文管理模块
 * 用于管理当前用户ID，确保不同用户的Secret不会相互覆盖
 */
let currentUserId = null;
/**
 * 设置当前用户ID
 * @param userId 用户ID，用于隔离不同用户的Secret
 */
function setCurrentUserId(userId) {
    if (!userId || typeof userId !== 'string') {
        throw new Error('User ID must be a non-empty string');
    }
    currentUserId = userId;
}
/**
 * 获取当前用户ID
 * @returns 当前用户ID，如果未设置则返回null
 */
function getCurrentUserId() {
    return currentUserId;
}
/**
 * 清除当前用户ID，恢复到默认状态（不使用用户隔离）
 */
function clearCurrentUserId() {
    currentUserId = null;
}
/**
 * 检查是否已设置用户ID
 * @returns 如果已设置用户ID则返回true，否则返回false
 */
function hasCurrentUserId() {
    return currentUserId !== null;
}
/**
 * 将用户ID编码到Secret Key中
 * 格式: user:{userId}:{originalKey}
 * @param key 原始key
 * @returns 编码后的key，如果没有设置用户ID则返回原始key
 */
function encodeUserKey(key) {
    if (!currentUserId) {
        return key;
    }
    return `user:${currentUserId}:${key}`;
}
/**
 * 从编码的key中解码出原始key和用户ID
 * @param encodedKey 编码后的key
 * @returns 包含用户ID和原始key的对象，如果不是编码格式则返回null
 */
function decodeUserKey(encodedKey) {
    const match = encodedKey.match(/^user:([^:]+):(.+)$/);
    if (!match) {
        return null;
    }
    return {
        userId: match[1],
        key: match[2],
    };
}
/**
 * 检查一个key是否属于当前用户
 * @param encodedKey 编码后的key
 * @returns 如果属于当前用户则返回true，如果没有设置用户ID且key未编码也返回true
 */
function isCurrentUserKey(encodedKey) {
    const decoded = decodeUserKey(encodedKey);
    // 如果key未编码
    if (!decoded) {
        // 如果当前没有设置用户ID，则认为未编码的key属于当前上下文
        return !currentUserId;
    }
    // 如果key已编码，检查是否与当前用户ID匹配
    return decoded.userId === currentUserId;
}
/**
 * 获取当前用户的key前缀
 * @returns 用户key前缀，如果没有设置用户ID则返回null
 */
function getCurrentUserKeyPrefix() {
    if (!currentUserId) {
        return null;
    }
    return `user:${currentUserId}:`;
}
//# sourceMappingURL=userContext.js.map