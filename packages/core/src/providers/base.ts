// src/providers/base.ts
import { ModelConfig, ChatCompletionOptions } from '../types';

export abstract class LLMProvider {
  protected config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;
  }

  abstract chatCompletion(
    options: ChatCompletionOptions
  ): Promise<AsyncGenerator<any> | any>;
}