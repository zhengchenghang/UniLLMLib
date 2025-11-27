"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparkProvider = void 0;
// src/providers/spark.ts
const base_1 = require("./base");
const crypto = __importStar(require("crypto"));
class SparkProvider extends base_1.LLMProvider {
    async chatCompletion(options) {
        const { app_id, api_key, api_secret, model } = this.config;
        // 讯飞星火需要 WebSocket 连接，这里简化为 HTTP 调用示例
        // 实际使用时需要根据讯飞官方文档实现 WebSocket 连接
        const url = this.generateAuthUrl(api_key, api_secret);
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
    generateAuthUrl(apiKey, apiSecret) {
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
exports.SparkProvider = SparkProvider;
//# sourceMappingURL=spark.js.map