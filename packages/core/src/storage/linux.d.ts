import { SecureStorageInterface } from './interface';
/**
 * Linux平台安全存储实现
 *
 * 实现策略：
 * 1. 优先使用libsecret（通过keytar）- 支持GNOME Keyring、KDE Wallet等
 * 2. Fallback到加密文件存储（使用AES-256-GCM）
 *
 * 安全性设计：
 * - 使用系统密钥环服务（libsecret）作为首选方案
 * - Fallback使用基于机器ID的密钥派生 + AES-256-GCM加密
 * - 文件权限设置为600（仅当前用户可读写）
 * - 使用随机IV和认证标签防止篡改
 */
export declare class LinuxStorage implements SecureStorageInterface {
    private serviceName;
    private keytar;
    private keytarAvailable;
    private storageDir;
    private secretsFile;
    private encryptionKey;
    constructor(serviceName?: string);
    private init;
    /**
     * 加载keytar库（Linux上使用libsecret）
     */
    private loadKeytar;
    /**
     * 初始化加密文件存储
     */
    private initEncryptedStorage;
    /**
     * 派生加密密钥
     * 基于机器ID、用户名和固定salt生成确定性密钥
     */
    private deriveEncryptionKey;
    /**
     * 获取机器唯一标识
     * 优先级：/etc/machine-id > /var/lib/dbus/machine-id > hostname
     */
    private getMachineId;
    /**
     * 加密数据
     */
    private encrypt;
    /**
     * 解密数据
     */
    private decrypt;
    /**
     * 读取加密文件中的所有secrets
     */
    private readEncryptedFile;
    /**
     * 写入加密文件
     */
    private writeEncryptedFile;
    setSecret(key: string, value: string): Promise<void>;
    getSecret(key: string): Promise<string | null>;
    deleteSecret(key: string): Promise<boolean>;
    getAllKeys(): Promise<string[]>;
    clearAll(): Promise<void>;
    /**
     * 检查当前使用的存储后端
     */
    getStorageBackend(): 'libsecret' | 'encrypted-file';
    /**
     * 测试libsecret是否可用
     */
    testLibsecret(): Promise<boolean>;
}
//# sourceMappingURL=linux.d.ts.map