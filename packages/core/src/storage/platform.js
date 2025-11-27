"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = void 0;
exports.getCurrentPlatform = getCurrentPlatform;
// src/storage/platform.ts
var Platform;
(function (Platform) {
    Platform["WINDOWS"] = "windows";
    Platform["MACOS"] = "macos";
    Platform["LINUX"] = "linux";
    Platform["ANDROID"] = "android";
    Platform["IOS"] = "ios";
    Platform["WEB"] = "web";
})(Platform || (exports.Platform = Platform = {}));
function getCurrentPlatform() {
    if (typeof process !== 'undefined' && process.platform) {
        switch (process.platform) {
            case 'win32':
                return Platform.WINDOWS;
            case 'darwin':
                return Platform.MACOS;
            case 'linux':
                return Platform.LINUX;
            default:
                return Platform.WEB;
        }
    }
    // 移动端检测
    if (typeof navigator !== 'undefined') {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('android'))
            return Platform.ANDROID;
        if (userAgent.includes('iphone') || userAgent.includes('ipad'))
            return Platform.IOS;
    }
    return Platform.WEB;
}
//# sourceMappingURL=platform.js.map