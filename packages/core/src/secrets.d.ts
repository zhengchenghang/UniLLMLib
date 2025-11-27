/**
 * 存储Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @param value Secret的值
 */
export declare function setSecret(key: string, value: string): Promise<void>;
/**
 * 获取Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @returns Secret的值，如果不存在则返回null
 */
export declare function getSecret(key: string): Promise<string | null>;
/**
 * 删除Secret，会自动使用当前用户ID进行隔离
 * @param key Secret的key
 * @returns 是否成功删除
 */
export declare function deleteSecret(key: string): Promise<boolean>;
/**
 * 获取所有Secret的key列表
 * 如果设置了用户ID，只返回当前用户的secrets
 * 如果未设置用户ID，返回所有未编码的secrets
 * @returns Secret key列表（解码后的原始key）
 */
export declare function getAllSecrets(): Promise<string[]>;
/**
 * 清除所有Secret
 * 如果设置了用户ID，只清除当前用户的secrets
 * 如果未设置用户ID，清除所有未编码的secrets
 */
export declare function clearAllSecrets(): Promise<void>;
export declare function resolveValue(value: any): Promise<any>;
//# sourceMappingURL=secrets.d.ts.map