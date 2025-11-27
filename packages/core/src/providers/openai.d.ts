import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';
export declare class OpenAIProvider extends LLMProvider {
    chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse | AsyncGenerator<string>>;
    private handleStream;
}
//# sourceMappingURL=openai.d.ts.map