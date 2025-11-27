import { SecureStorageInterface } from './interface';
export declare class WindowsStorage implements SecureStorageInterface {
    private serviceName;
    private keytar;
    constructor(serviceName?: string);
    private loadKeytar;
    setSecret(key: string, value: string): Promise<void>;
    getSecret(key: string): Promise<string | null>;
    deleteSecret(key: string): Promise<boolean>;
    getAllKeys(): Promise<string[]>;
    clearAll(): Promise<void>;
    private setSecretFallback;
    private getSecretFallback;
    private deleteSecretFallback;
    private getAllKeysFallback;
    private clearAllFallback;
}
//# sourceMappingURL=windows.d.ts.map