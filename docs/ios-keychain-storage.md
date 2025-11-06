# iOS Keychain Storage Integration

This document describes the iOS secure storage implementation using `react-native-keychain` for secure credential persistence on iOS devices.

## Overview

The iOS storage implementation provides secure, encrypted storage of sensitive data like API keys and tokens using the iOS Keychain. This ensures that credentials are stored safely and are protected by iOS's built-in security features.

## Features

- **Secure Storage**: Uses iOS Keychain for encrypted credential storage
- **Biometric Authentication**: Optional Face ID/Touch ID support for accessing sensitive data
- **Index Management**: Efficient tracking of stored keys for quick enumeration
- **Error Handling**: Comprehensive error handling with informative messages
- **Fallback Support**: Graceful handling when react-native-keychain is not available

## Installation

### 1. Install Dependencies

```bash
npm install react-native-keychain
# or
yarn add react-native-keychain
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 3. iOS Configuration (Optional)

Add the following to your `Info.plist` if you want to use Face ID:

```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to securely access your stored credentials.</string>
```

## Usage

### Basic Usage

```typescript
import { StorageFactory } from 'unillm-ts';

// Get iOS storage instance
const storage = StorageFactory.getStorage('my-app');

// Store a secret
await storage.setSecret('api-key', 'your-secret-api-key');

// Retrieve a secret
const apiKey = await storage.getSecret('api-key');

// Delete a secret
await storage.deleteSecret('api-key');

// List all stored keys
const keys = await storage.getAllKeys();

// Clear all stored secrets
await storage.clearAll();
```

### Using with LLM Manager

```typescript
import { LLMManager } from 'unillm-ts';
import { StorageFactory } from 'unillm-ts';

// Get iOS storage
const storage = StorageFactory.getStorage('unillm');

// Create manager with iOS storage
const manager = new LLMManager({
  storage: storage
});

// Use the manager - credentials will be stored securely in iOS Keychain
```

### iOS-Specific Features

The iOS storage implementation includes additional methods for iOS-specific functionality:

```typescript
import { IOSStorage } from 'unillm-ts/storage/other-platforms';

const storage = StorageFactory.getStorage('my-app') as IOSStorage;

// Check if biometric authentication is available
const canAuth = await storage.canImplyAuthentication();

// Get supported biometry type (Face ID, Touch ID, etc.)
const biometryType = await storage.getSupportedBiometryType();
```

## Security Features

### Access Control

The iOS implementation uses `USER_PRESENCE` access control by default, which means:

- User authentication (Face ID/Touch ID/passcode) is required to access stored data
- Credentials are protected even if the device is compromised
- Data remains secure across app restarts and device reboots

### Service Namespacing

All stored data is namespaced using a service name to avoid conflicts with other apps:

```
{serviceName}:{key}
```

For example: `unillm:openai-api-key`

### Index Management

The implementation maintains an internal index of all stored keys for efficient enumeration, stored securely in the Keychain itself.

## Error Handling

The implementation provides comprehensive error handling:

### Common Errors

1. **Missing react-native-keychain**
   ```
   Error: react-native-keychain is required for iOS secure storage
   ```
   **Solution**: Install and configure react-native-keychain

2. **Biometric Authentication Failed**
   ```
   Error: User cancelled biometric authentication
   ```
   **Solution**: User cancelled the authentication prompt

3. **Keychain Access Denied**
   ```
   Error: Failed to securely store secret
   ```
   **Solution**: Check iOS permissions and Keychain configuration

## Platform Detection

The storage factory automatically detects the platform and uses the appropriate storage implementation:

```typescript
import { getCurrentPlatform, Platform } from 'unillm-ts/storage/platform';

const platform = getCurrentPlatform();
if (platform === Platform.IOS) {
  // Using iOS Keychain storage
}
```

## Best Practices

### 1. Use Descriptive Service Names

```typescript
// Good
const storage = StorageFactory.getStorage('mycompany-myapp');

// Avoid
const storage = StorageFactory.getStorage('test');
```

### 2. Handle Errors Gracefully

```typescript
try {
  await storage.setSecret('api-key', apiKey);
} catch (error) {
  console.error('Failed to store API key:', error);
  // Implement fallback or user notification
}
```

### 3. Check Biometric Availability

```typescript
if (await storage.canImplyAuthentication()) {
  // Store sensitive data that requires biometric protection
  await storage.setSecret('master-key', masterKey);
}
```

### 4. Use Structured Data

```typescript
// Store complex data as JSON
const preferences = {
  theme: 'dark',
  model: 'gpt-4',
  temperature: 0.7
};
await storage.setSecret('preferences', JSON.stringify(preferences));

// Retrieve and parse
const stored = await storage.getSecret('preferences');
if (stored) {
  const prefs = JSON.parse(stored);
}
```

## Migration from Other Platforms

If you're migrating from another platform (Android, Web, etc.), the API is consistent:

```typescript
// This works the same across all platforms
const storage = StorageFactory.getStorage('my-app');
await storage.setSecret('key', 'value');
const value = await storage.getSecret('key');
```

## Testing

The implementation includes error handling for environments where react-native-keychain is not available (like during testing):

```typescript
// In non-iOS environments, it will gracefully handle missing dependencies
// and provide informative error messages
```

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure `pod install` has been run
   - Check that Xcode project is properly configured

2. **Runtime Errors**
   - Verify react-native-keychain is properly linked
   - Check iOS version compatibility

3. **Authentication Issues**
   - Ensure Face ID/Touch ID is set up on the device
   - Check Info.plist permissions

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// The implementation includes console.warn for debugging
// Check console output for detailed error information
```

## Security Considerations

1. **Keychain Access**: Ensure your app's Keychain access groups are properly configured
2. **Backup Strategy**: Consider how credential backup/migration will be handled
3. **App Uninstallation**: Be aware that uninstalling the app will remove Keychain data
4. **Jailbreak Detection**: Consider additional security measures for sensitive applications

## Compatibility

- **iOS Version**: iOS 9.0+
- **React Native**: 0.60+
- **react-native-keychain**: 8.1.3+

## License

This implementation follows the same MIT license as the main unillm-ts project.