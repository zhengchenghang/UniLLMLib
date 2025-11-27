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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultManager = exports.getCurrentPlatform = exports.Platform = exports.StorageFactory = exports.WindowsStorage = exports.LinuxStorage = exports.hasCurrentUserId = exports.clearCurrentUserId = exports.getCurrentUserId = exports.setCurrentUserId = exports.clearAllSecrets = exports.getAllSecrets = exports.deleteSecret = exports.getSecret = exports.setSecret = exports.LLMManager = void 0;
// src/index.ts
var manager_1 = require("./manager");
Object.defineProperty(exports, "LLMManager", { enumerable: true, get: function () { return manager_1.LLMManager; } });
__exportStar(require("./types"), exports);
var secrets_1 = require("./secrets");
Object.defineProperty(exports, "setSecret", { enumerable: true, get: function () { return secrets_1.setSecret; } });
Object.defineProperty(exports, "getSecret", { enumerable: true, get: function () { return secrets_1.getSecret; } });
Object.defineProperty(exports, "deleteSecret", { enumerable: true, get: function () { return secrets_1.deleteSecret; } });
Object.defineProperty(exports, "getAllSecrets", { enumerable: true, get: function () { return secrets_1.getAllSecrets; } });
Object.defineProperty(exports, "clearAllSecrets", { enumerable: true, get: function () { return secrets_1.clearAllSecrets; } });
var userContext_1 = require("./userContext");
Object.defineProperty(exports, "setCurrentUserId", { enumerable: true, get: function () { return userContext_1.setCurrentUserId; } });
Object.defineProperty(exports, "getCurrentUserId", { enumerable: true, get: function () { return userContext_1.getCurrentUserId; } });
Object.defineProperty(exports, "clearCurrentUserId", { enumerable: true, get: function () { return userContext_1.clearCurrentUserId; } });
Object.defineProperty(exports, "hasCurrentUserId", { enumerable: true, get: function () { return userContext_1.hasCurrentUserId; } });
var linux_1 = require("./storage/linux");
Object.defineProperty(exports, "LinuxStorage", { enumerable: true, get: function () { return linux_1.LinuxStorage; } });
var windows_1 = require("./storage/windows");
Object.defineProperty(exports, "WindowsStorage", { enumerable: true, get: function () { return windows_1.WindowsStorage; } });
var factory_1 = require("./storage/factory");
Object.defineProperty(exports, "StorageFactory", { enumerable: true, get: function () { return factory_1.StorageFactory; } });
var platform_1 = require("./storage/platform");
Object.defineProperty(exports, "Platform", { enumerable: true, get: function () { return platform_1.Platform; } });
Object.defineProperty(exports, "getCurrentPlatform", { enumerable: true, get: function () { return platform_1.getCurrentPlatform; } });
// 导出单例实例（可选）
const manager_2 = require("./manager");
exports.defaultManager = new manager_2.LLMManager();
// 默认导出
exports.default = exports.defaultManager;
//# sourceMappingURL=index.js.map