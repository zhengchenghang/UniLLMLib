"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenProvider = void 0;
// src/providers/qwen.ts
const base_1 = require("./base");
class QwenProvider extends base_1.LLMProvider {
    async chatCompletion(options) {
        const { api_key, model, base_url } = this.config;
        // 参数校验
        if (!api_key)
            throw new Error('Missing Qwen API key');
        if (!model)
            throw new Error('Missing model name');
        if (!options.messages?.length)
            throw new Error('Messages are required');
        const temperature = options.temperature ?? 0.7;
        const max_tokens = options.max_tokens ?? 1024;
        const stream = options.stream ?? false;
        const url = base_url || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`,
        };
        const body = {
            model,
            input: {
                messages: options.messages,
            },
            parameters: {
                temperature: temperature,
                max_tokens: max_tokens,
                stream: stream || false,
            },
        };
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            let errorMsg = '';
            try {
                const errData = await response.json();
                errorMsg = errData.message || errData.error?.message || JSON.stringify(errData);
            }
            catch {
                errorMsg = await response.text();
            }
            throw new Error(`Qwen API error: ${response.status} ${response.statusText} - ${errorMsg}`);
        }
        if (options.stream) {
            return this.handleStream(response);
        }
        else {
            const data = await response.json();
            return {
                content: data.output.text,
                role: 'assistant',
                finish_reason: data.output.finish_reason,
                usage: {
                    prompt_tokens: data.usage?.input_tokens ?? 0,
                    completion_tokens: data.usage?.output_tokens ?? 0,
                    total_tokens: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
                },
            };
        }
    }
    async *handleStream(response) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = ''; // 缓存未处理完的数据
        if (!reader)
            throw new Error('No response body');
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // 保留最后一行未完整部分
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const dataStr = line.slice(5).trim();
                        if (dataStr === '[DONE]')
                            return; // 流结束
                        if (!dataStr)
                            continue;
                        try {
                            const parsed = JSON.parse(dataStr);
                            const content = parsed.output?.choices?.[0]?.delta?.content ||
                                parsed.output?.text ||
                                '';
                            if (content)
                                yield content;
                        }
                        catch (e) {
                            console.warn('Failed to parse stream data:', dataStr);
                        }
                    }
                }
            }
            // 处理最后缓存
            if (buffer.trim() && buffer.startsWith('data:')) {
                const dataStr = buffer.slice(5).trim();
                if (dataStr && dataStr !== '[DONE]') {
                    const parsed = JSON.parse(dataStr);
                    const content = parsed.output?.text || '';
                    if (content)
                        yield content;
                }
            }
        }
        finally {
            reader.releaseLock();
        }
    }
}
exports.QwenProvider = QwenProvider;
//# sourceMappingURL=qwen.js.map