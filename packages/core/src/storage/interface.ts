// src/storage/storage.interface.ts
export interface SecureStorageInterface {
    /**
     * 存储密钥
     */
    setSecret(key: string, value: string): Promise<void>;
    
    /**
     * 获取密钥
     */
    getSecret(key: string): Promise<string | null>;
    
    /**
     * 删除密钥
     */
    deleteSecret(key: string): Promise<boolean>;
    
    /**
     * 获取所有密钥列表
     */
    getAllKeys(): Promise<string[]>;
    
    /**
     * 清空所有存储的密钥
     */
    clearAll(): Promise<void>;
  }