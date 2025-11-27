import { SecureStorageInterface } from './interface';
export declare class MacOSStorage implements SecureStorageInterface {
    setSecret(key: string, value: string): Promise<void>;
    getSecret(key: string): Promise<string | null>;
    deleteSecret(key: string): Promise<boolean>;
    getAllKeys(): Promise<string[]>;
    clearAll(): Promise<void>;
}
export declare class AndroidStorage implements SecureStorageInterface {
    private static readonly INDEX_ACCOUNT;
    private serviceName;
    private keychain;
    constructor(serviceName?: string);
    private loadKeychain;
    private ensureKeychain;
    private getServiceKey;
    private getIndexServiceKey;
    private readIndex;
    private writeIndex;
    private addToIndex;
    private removeFromIndex;
    setSecret(key: string, value: string): Promise<void>;
    getSecret(key: string): Promise<string | null>;
    deleteSecret(key: string): Promise<boolean>;
    getAllKeys(): Promise<string[]>;
    clearAll(): Promise<void>;
}
export declare class IOSStorage implements SecureStorageInterface {
    private static readonly INDEX_ACCOUNT;
    private serviceName;
    private keychain;
    private accessControl;
    constructor(serviceName?: string);
    private loadKeychain;
    private loadAccessControl;
    private ensureKeychain;
    private getServiceKey;
    private getIndexServiceKey;
    private readIndex;
    private writeIndex;
    private addToIndex;
    private removeFromIndex;
    setSecret(key: string, value: string): Promise<void>;
    getSecret(key: string): Promise<string | null>;
    deleteSecret(key: string): Promise<boolean>;
    getAllKeys(): Promise<string[]>;
    clearAll(): Promise<void>;
    /**
     * iOS特定的方法：检查生物识别是否可用
     */
    canImplyAuthentication(): Promise<boolean>;
    /**
     * iOS特定的方法：获取可用的生物识别类型
     */
    getSupportedBiometryType(): Promise<string | null>;
}
export declare class WebStorage implements SecureStorageInterface {
    setSecret(key: string, value: string): Promise<void>;
    getSecret(key: string): Promise<string | null>;
    deleteSecret(key: string): Promise<boolean>;
    getAllKeys(): Promise<string[]>;
    clearAll(): Promise<void>;
}
//# sourceMappingURL=other-platforms.d.ts.map