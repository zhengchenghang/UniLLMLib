"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageFactory = void 0;
const windows_1 = require("./windows");
const other_platforms_1 = require("./other-platforms");
const linux_1 = require("./linux");
const other_platforms_2 = require("./other-platforms");
const other_platforms_3 = require("./other-platforms");
const other_platforms_4 = require("./other-platforms");
const platform_1 = require("./platform");
class StorageFactory {
    static getStorage(serviceName = 'unillm') {
        const key = `${serviceName}_${(0, platform_1.getCurrentPlatform)()}`;
        if (!this.instances.has(key)) {
            const platform = (0, platform_1.getCurrentPlatform)();
            let storage;
            switch (platform) {
                case platform_1.Platform.WINDOWS:
                    storage = new windows_1.WindowsStorage(serviceName);
                    break;
                case platform_1.Platform.MACOS:
                    storage = new other_platforms_1.MacOSStorage();
                    break;
                case platform_1.Platform.LINUX:
                    storage = new linux_1.LinuxStorage(serviceName);
                    break;
                case platform_1.Platform.ANDROID:
                    storage = new other_platforms_2.AndroidStorage(serviceName);
                    break;
                case platform_1.Platform.IOS:
                    storage = new other_platforms_3.IOSStorage();
                    break;
                case platform_1.Platform.WEB:
                    storage = new other_platforms_4.WebStorage();
                    break;
                default:
                    // 默认使用 Windows 存储
                    storage = new windows_1.WindowsStorage(serviceName);
            }
            this.instances.set(key, storage);
        }
        return this.instances.get(key);
    }
}
exports.StorageFactory = StorageFactory;
StorageFactory.instances = new Map();
//# sourceMappingURL=factory.js.map