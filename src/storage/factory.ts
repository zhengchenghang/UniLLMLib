// src/storage/storage.factory.ts
import { SecureStorageInterface } from './interface';
import { WindowsStorage } from './windows';
import { MacOSStorage } from './other-platforms';
import { LinuxStorage } from './other-platforms';
import { AndroidStorage } from './other-platforms';
import { IOSStorage } from './other-platforms';
import { WebStorage } from './other-platforms';
import { getCurrentPlatform, Platform } from './platform';

export class StorageFactory {
  private static instances: Map<string, SecureStorageInterface> = new Map();

  static getStorage(serviceName: string = 'unillm'): SecureStorageInterface {
    const key = `${serviceName}_${getCurrentPlatform()}`;
    
    if (!this.instances.has(key)) {
      const platform = getCurrentPlatform();
      let storage: SecureStorageInterface;

      switch (platform) {
        case Platform.WINDOWS:
          storage = new WindowsStorage(serviceName);
          break;
        case Platform.MACOS:
          storage = new MacOSStorage();
          break;
        case Platform.LINUX:
          storage = new LinuxStorage();
          break;
        case Platform.ANDROID:
          storage = new AndroidStorage();
          break;
        case Platform.IOS:
          storage = new IOSStorage();
          break;
        case Platform.WEB:
          storage = new WebStorage();
          break;
        default:
          // 默认使用 Windows 存储
          storage = new WindowsStorage(serviceName);
      }

      this.instances.set(key, storage);
    }

    return this.instances.get(key)!;
  }
}