// src/providers/spark.ts
import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';
import * as crypto from 'crypto';

export class SparkProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    const { app_id, api_key, api_secret, model } = this.config;

    // 讯飞星火需要 WebSocket 连接，这里简化为 HTTP 调用示例
    // 实际使用时需要根据讯飞官方文档实现 WebSocket 连接
    const url = this.generateAuthUrl(api_key!, api_secret!);

    const body = {
      header: {
        app_id,
      },
      parameter: {
        chat: {
          domain: model,
          temperature: options.temperature,
          max_tokens: options.max_tokens,
        },
      },
      payload: {
        message: {
          text: options.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        },
      },
    };

    // 这里需要实现 WebSocket 连接
    // 简化版本仅作为示例
    throw new Error('Spark provider requires WebSocket implementation. Please use official SDK or implement WebSocket connection.');
  }

  private generateAuthUrl(apiKey: string, apiSecret: string): string {
    const host = 'spark-api.xf-yun.com';
    const path = '/v3.1/chat';
    const date = new Date().toUTCString();

    const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(signatureOrigin)
      .digest('base64');

    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    return `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
  }
}

