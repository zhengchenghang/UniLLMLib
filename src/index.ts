// src/index.ts
export { LLMManager } from './manager';
export * from './types';
export { setSecret, getSecret, deleteSecret, getAllSecrets, clearAllSecrets } from './secrets';
export {
  setCurrentUserId,
  getCurrentUserId,
  clearCurrentUserId,
  hasCurrentUserId,
} from './userContext';

// 导出单例实例（可选）
import { LLMManager } from './manager';
export const defaultManager = new LLMManager();

// 默认导出
export default defaultManager;