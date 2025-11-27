export { LLMManager } from './manager';
export * from './types';
export { setSecret, getSecret, deleteSecret, getAllSecrets, clearAllSecrets } from './secrets';
export { setCurrentUserId, getCurrentUserId, clearCurrentUserId, hasCurrentUserId, } from './userContext';
export { SecureStorageInterface } from './storage/interface';
export { LinuxStorage } from './storage/linux';
export { WindowsStorage } from './storage/windows';
export { StorageFactory } from './storage/factory';
export { Platform, getCurrentPlatform } from './storage/platform';
import { LLMManager } from './manager';
export declare const defaultManager: LLMManager;
export default defaultManager;
//# sourceMappingURL=index.d.ts.map