import { ModelConfig, ChatCompletionOptions } from '../types';
export declare abstract class LLMProvider {
    protected config: ModelConfig;
    constructor(config: ModelConfig);
    abstract chatCompletion(options: ChatCompletionOptions): Promise<AsyncGenerator<any> | any>;
}
//# sourceMappingURL=base.d.ts.map