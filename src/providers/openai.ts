// src/providers/openai.ts
import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';

export class OpenAIProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    const { api_key, base_url = 'https://api.openai.com/v1', model } = this.config;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`,
    };

    const body = {
      model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      stream: options.stream || false,
    };

    const response = await fetch(`${base_url}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    if (options.stream) {
      return this.handleStream(response);
    } else {
      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        role: 'assistant',
        finish_reason: data.choices[0].finish_reason,
        usage: data.usage,
      };
    }
  }

  private async *handleStream(response: Response): AsyncGenerator<string> {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

