// src/storage/platform.ts
export enum Platform {
    WINDOWS = 'windows',
    MACOS = 'macos',
    LINUX = 'linux',
    ANDROID = 'android',
    IOS = 'ios',
    WEB = 'web'
  }
  
  export function getCurrentPlatform(): Platform {
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
      if (userAgent.includes('android')) return Platform.ANDROID;
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) return Platform.IOS;
    }
    
    return Platform.WEB;
  }