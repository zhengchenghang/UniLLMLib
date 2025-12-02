import { LLMManager } from '@unillm-ts/core';

// Shared singleton manager instance
const manager = new LLMManager();

let initialized = false;

export async function ensureInitialized() {
  if (!initialized) {
    await manager.init();
    initialized = true;
  }
}

export function getManager(): LLMManager {
  return manager;
}
