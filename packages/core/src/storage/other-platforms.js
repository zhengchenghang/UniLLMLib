"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebStorage = exports.IOSStorage = exports.AndroidStorage = exports.MacOSStorage = void 0;
// macOS 实现（占位）
class MacOSStorage {
    async setSecret(key, value) {
        throw new Error('MacOSStorage not implemented yet');
    }
    async getSecret(key) {
        throw new Error('MacOSStorage not implemented yet');
    }
    async deleteSecret(key) {
        throw new Error('MacOSStorage not implemented yet');
    }
    async getAllKeys() {
        throw new Error('MacOSStorage not implemented yet');
    }
    async clearAll() {
        throw new Error('MacOSStorage not implemented yet');
    }
}
exports.MacOSStorage = MacOSStorage;
// Linux 实现已移至 ./linux.ts
// Android 实现（基于 react-native-keychain）
class AndroidStorage {
    constructor(serviceName = 'unillm') {
        this.serviceName = serviceName;
        this.keychain = this.loadKeychain();
    }
    loadKeychain() {
        try {
            return require('react-native-keychain');
        }
        catch (error) {
            console.warn('react-native-keychain module is not available. Install react-native-keychain to enable secure storage on Android.');
            return null;
        }
    }
    ensureKeychain() {
        if (!this.keychain) {
            this.keychain = this.loadKeychain();
        }
        if (!this.keychain) {
            throw new Error('react-native-keychain is required for Android secure storage. Please install and configure react-native-keychain in your React Native project.');
        }
        return this.keychain;
    }
    getServiceKey(key) {
        return `${this.serviceName}:${key}`;
    }
    getIndexServiceKey() {
        return `${this.serviceName}:__index__`;
    }
    async readIndex() {
        const keychain = this.ensureKeychain();
        try {
            const result = await keychain.getGenericPassword({ service: this.getIndexServiceKey() });
            if (!result) {
                return new Set();
            }
            const parsed = JSON.parse(result.password);
            if (Array.isArray(parsed)) {
                return new Set(parsed);
            }
            return new Set();
        }
        catch (error) {
            console.warn('[AndroidStorage] Failed to read secure storage index', error);
            return new Set();
        }
    }
    async writeIndex(keys) {
        const keychain = this.ensureKeychain();
        if (keys.size === 0) {
            await keychain.resetGenericPassword({ service: this.getIndexServiceKey() });
            return;
        }
        const success = await keychain.setGenericPassword(AndroidStorage.INDEX_ACCOUNT, JSON.stringify(Array.from(keys)), { service: this.getIndexServiceKey() });
        if (!success) {
            throw new Error('Failed to persist Android secure storage index to keychain.');
        }
    }
    async addToIndex(key) {
        const keys = await this.readIndex();
        if (!keys.has(key)) {
            keys.add(key);
            await this.writeIndex(keys);
        }
    }
    async removeFromIndex(key) {
        const keys = await this.readIndex();
        if (keys.delete(key)) {
            await this.writeIndex(keys);
        }
    }
    async setSecret(key, value) {
        const keychain = this.ensureKeychain();
        const success = await keychain.setGenericPassword(key, value, {
            service: this.getServiceKey(key)
        });
        if (!success) {
            throw new Error(`Failed to securely store secret for key "${key}".`);
        }
        await this.addToIndex(key);
    }
    async getSecret(key) {
        const keychain = this.ensureKeychain();
        const result = await keychain.getGenericPassword({ service: this.getServiceKey(key) });
        return result ? result.password : null;
    }
    async deleteSecret(key) {
        const keychain = this.ensureKeychain();
        const removed = await keychain.resetGenericPassword({ service: this.getServiceKey(key) });
        await this.removeFromIndex(key);
        return removed;
    }
    async getAllKeys() {
        const keys = await this.readIndex();
        return Array.from(keys).sort();
    }
    async clearAll() {
        const keychain = this.ensureKeychain();
        const keys = await this.readIndex();
        for (const key of keys) {
            await keychain.resetGenericPassword({ service: this.getServiceKey(key) });
        }
        await this.writeIndex(new Set());
    }
}
exports.AndroidStorage = AndroidStorage;
AndroidStorage.INDEX_ACCOUNT = '__index__';
// iOS 实现（基于 react-native-keychain）
class IOSStorage {
    constructor(serviceName = 'unillm') {
        this.serviceName = serviceName;
        this.keychain = this.loadKeychain();
        this.accessControl = this.loadAccessControl();
    }
    loadKeychain() {
        try {
            return require('react-native-keychain');
        }
        catch (error) {
            console.warn('react-native-keychain module is not available. Install react-native-keychain to enable secure storage on iOS.');
            return null;
        }
    }
    loadAccessControl() {
        try {
            const keychain = this.loadKeychain();
            if (keychain && keychain.ACCESS_CONTROL) {
                return keychain.ACCESS_CONTROL;
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    ensureKeychain() {
        if (!this.keychain) {
            this.keychain = this.loadKeychain();
        }
        if (!this.keychain) {
            throw new Error('react-native-keychain is required for iOS secure storage. Please install and configure react-native-keychain in your React Native project.');
        }
        return this.keychain;
    }
    getServiceKey(key) {
        return `${this.serviceName}:${key}`;
    }
    getIndexServiceKey() {
        return `${this.serviceName}:__index__`;
    }
    async readIndex() {
        const keychain = this.ensureKeychain();
        try {
            const result = await keychain.getGenericPassword({ service: this.getIndexServiceKey() });
            if (!result) {
                return new Set();
            }
            const parsed = JSON.parse(result.password);
            if (Array.isArray(parsed)) {
                return new Set(parsed);
            }
            return new Set();
        }
        catch (error) {
            console.warn('[IOSStorage] Failed to read secure storage index', error);
            return new Set();
        }
    }
    async writeIndex(keys) {
        const keychain = this.ensureKeychain();
        if (keys.size === 0) {
            await keychain.resetGenericPassword({ service: this.getIndexServiceKey() });
            return;
        }
        const success = await keychain.setGenericPassword(IOSStorage.INDEX_ACCOUNT, JSON.stringify(Array.from(keys)), { service: this.getIndexServiceKey() });
        if (!success) {
            throw new Error('Failed to persist iOS secure storage index to keychain.');
        }
    }
    async addToIndex(key) {
        const keys = await this.readIndex();
        if (!keys.has(key)) {
            keys.add(key);
            await this.writeIndex(keys);
        }
    }
    async removeFromIndex(key) {
        const keys = await this.readIndex();
        if (keys.delete(key)) {
            await this.writeIndex(keys);
        }
    }
    async setSecret(key, value) {
        const keychain = this.ensureKeychain();
        // iOS特定的安全选项
        const options = {
            service: this.getServiceKey(key),
            accessControl: this.accessControl ? this.accessControl.USER_PRESENCE : undefined,
            authenticatePrompt: `Authenticate to access ${key}`,
        };
        const success = await keychain.setGenericPassword(key, value, options);
        if (!success) {
            throw new Error(`Failed to securely store secret for key "${key}" on iOS.`);
        }
        await this.addToIndex(key);
    }
    async getSecret(key) {
        const keychain = this.ensureKeychain();
        try {
            const result = await keychain.getGenericPassword({
                service: this.getServiceKey(key),
                authenticatePrompt: `Authenticate to access ${key}`
            });
            return result ? result.password : null;
        }
        catch (error) {
            console.warn(`[IOSStorage] Failed to get secret for key "${key}"`, error);
            return null;
        }
    }
    async deleteSecret(key) {
        const keychain = this.ensureKeychain();
        try {
            const removed = await keychain.resetGenericPassword({ service: this.getServiceKey(key) });
            await this.removeFromIndex(key);
            return removed;
        }
        catch (error) {
            console.warn(`[IOSStorage] Failed to delete secret for key "${key}"`, error);
            return false;
        }
    }
    async getAllKeys() {
        const keys = await this.readIndex();
        return Array.from(keys).sort();
    }
    async clearAll() {
        const keychain = this.ensureKeychain();
        const keys = await this.readIndex();
        try {
            for (const key of keys) {
                await keychain.resetGenericPassword({ service: this.getServiceKey(key) });
            }
            await this.writeIndex(new Set());
        }
        catch (error) {
            console.warn('[IOSStorage] Error during clearAll operation', error);
            throw new Error('Failed to clear all secrets from iOS keychain');
        }
    }
    /**
     * iOS特定的方法：检查生物识别是否可用
     */
    async canImplyAuthentication() {
        const keychain = this.ensureKeychain();
        try {
            if (keychain.getSupportedBiometryType) {
                const biometryType = await keychain.getSupportedBiometryType();
                return biometryType !== null;
            }
            return false;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * iOS特定的方法：获取可用的生物识别类型
     */
    async getSupportedBiometryType() {
        const keychain = this.ensureKeychain();
        try {
            if (keychain.getSupportedBiometryType) {
                return await keychain.getSupportedBiometryType();
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
}
exports.IOSStorage = IOSStorage;
IOSStorage.INDEX_ACCOUNT = '__index__';
// Web 实现（占位）
class WebStorage {
    async setSecret(key, value) {
        throw new Error('WebStorage not implemented yet');
    }
    async getSecret(key) {
        throw new Error('WebStorage not implemented yet');
    }
    async deleteSecret(key) {
        throw new Error('WebStorage not implemented yet');
    }
    async getAllKeys() {
        throw new Error('WebStorage not implemented yet');
    }
    async clearAll() {
        throw new Error('WebStorage not implemented yet');
    }
}
exports.WebStorage = WebStorage;
//# sourceMappingURL=other-platforms.js.map