import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';
export declare class MoonshotProvider extends LLMProvider {
    chatCompletion(options: ChatCompletionOptions): Promise<ChatCompletionResponse | AsyncGenerator<string>>;
    private handleStream;
}
//# sourceMappingURL=moonshot.d.ts.map