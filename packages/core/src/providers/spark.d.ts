import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';
export declare class SparkProvider extends LLMProvider {
    chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse | AsyncGenerator<string>>;
    private generateAuthUrl;
}
//# sourceMappingURL=spark.d.ts.map