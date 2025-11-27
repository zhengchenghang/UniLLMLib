import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';
export declare class ZhiPuProvider extends LLMProvider {
    chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse | AsyncGenerator<string>>;
    private handleStream;
}
//# sourceMappingURL=zhipu.d.ts.map