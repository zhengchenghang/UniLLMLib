import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';
export declare class QwenProvider extends LLMProvider {
    chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse | AsyncGenerator<string>>;
    private handleStream;
}
//# sourceMappingURL=qwen.d.ts.map