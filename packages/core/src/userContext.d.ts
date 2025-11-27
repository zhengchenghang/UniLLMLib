/**
 * 设置当前用户ID
 * @param userId 用户ID，用于隔离不同用户的Secret
 */
export declare function setCurrentUserId(userId: string): void;
/**
 * 获取当前用户ID
 * @returns 当前用户ID，如果未设置则返回null
 */
export declare function getCurrentUserId(): string | null;
/**
 * 清除当前用户ID，恢复到默认状态（不使用用户隔离）
 */
export declare function clearCurrentUserId(): void;
/**
 * 检查是否已设置用户ID
 * @returns 如果已设置用户ID则返回true，否则返回false
 */
export declare function hasCurrentUserId(): boolean;
/**
 * 将用户ID编码到Secret Key中
 * 格式: user:{userId}:{originalKey}
 * @param key 原始key
 * @returns 编码后的key，如果没有设置用户ID则返回原始key
 */
export declare function encodeUserKey(key: string): string;
/**
 * 从编码的key中解码出原始key和用户ID
 * @param encodedKey 编码后的key
 * @returns 包含用户ID和原始key的对象，如果不是编码格式则返回null
 */
export declare function decodeUserKey(encodedKey: string): {
    userId: string;
    key: string;
} | null;
/**
 * 检查一个key是否属于当前用户
 * @param encodedKey 编码后的key
 * @returns 如果属于当前用户则返回true，如果没有设置用户ID且key未编码也返回true
 */
export declare function isCurrentUserKey(encodedKey: string): boolean;
/**
 * 获取当前用户的key前缀
 * @returns 用户key前缀，如果没有设置用户ID则返回null
 */
export declare function getCurrentUserKeyPrefix(): string | null;
//# sourceMappingURL=userContext.d.ts.map