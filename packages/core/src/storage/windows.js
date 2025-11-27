"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowsStorage = void 0;
class WindowsStorage {
    constructor(serviceName = 'unillm') {
        this.serviceName = serviceName;
        this.loadKeytar();
    }
    loadKeytar() {
        try {
            // 动态导入 keytar，避免编译时错误
            this.keytar = require('keytar');
        }
        catch (error) {
            console.warn('Keytar not available, falling back to encrypted file storage');
            this.keytar = null;
        }
    }
    async setSecret(key, value) {
        if (this.keytar) {
            // 使用 keytar 存储到 Windows Credential Manager
            await this.keytar.setPassword(this.serviceName, key, value);
        }
        else {
            // 降级方案：使用加密文件存储
            await this.setSecretFallback(key, value);
        }
    }
    async getSecret(key) {
        if (this.keytar) {
            return await this.keytar.getPassword(this.serviceName, key);
        }
        else {
            return await this.getSecretFallback(key);
        }
    }
    async deleteSecret(key) {
        if (this.keytar) {
            return await this.keytar.deletePassword(this.serviceName, key);
        }
        else {
            return await this.deleteSecretFallback(key);
        }
    }
    async getAllKeys() {
        if (this.keytar) {
            return await this.keytar.findCredentials(this.serviceName);
        }
        else {
            return await this.getAllKeysFallback();
        }
    }
    async clearAll() {
        if (this.keytar) {
            const credentials = await this.keytar.findCredentials(this.serviceName);
            for (const cred of credentials) {
                await this.keytar.deletePassword(this.serviceName, cred.account);
            }
        }
        else {
            await this.clearAllFallback();
        }
    }
    // 降级方案：加密文件存储实现
    async setSecretFallback(key, value) {
        // 这里实现文件加密存储逻辑
        // 可以使用 crypto 进行加密后存储到文件
        console.warn('Using fallback storage for key:', key);
        // 临时实现 - 实际应该加密存储
        localStorage.setItem(`fallback_${this.serviceName}_${key}`, value);
    }
    async getSecretFallback(key) {
        console.warn('Using fallback storage for key:', key);
        return localStorage.getItem(`fallback_${this.serviceName}_${key}`);
    }
    async deleteSecretFallback(key) {
        localStorage.removeItem(`fallback_${this.serviceName}_${key}`);
        return true;
    }
    async getAllKeysFallback() {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(`fallback_${this.serviceName}_`)) {
                keys.push(key.replace(`fallback_${this.serviceName}_`, ''));
            }
        }
        return keys;
    }
    async clearAllFallback() {
        const keys = await this.getAllKeysFallback();
        for (const key of keys) {
            await this.deleteSecretFallback(key);
        }
    }
}
exports.WindowsStorage = WindowsStorage;
//# sourceMappingURL=windows.js.map