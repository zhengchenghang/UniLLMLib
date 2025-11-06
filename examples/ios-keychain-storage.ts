/**
 * iOS Keychain Storage Example
 * 
 * This example demonstrates how to use the iOS secure storage implementation
 * with react-native-keychain for secure credential storage on iOS devices.
 */

import { LLMManager } from '../src/manager';
import { StorageFactory } from '../src/storage/factory';
import { IOSStorage } from '../src/storage/other-platforms';
import { Platform } from '../src/storage/platform';

async function demonstrateIOSKeychainStorage() {
  console.log('=== iOS Keychain Storage Demo ===\n');

  try {
    // Check current platform
    const { getCurrentPlatform, Platform } = await import('../src/storage/platform');
    const currentPlatform = getCurrentPlatform();
    
    console.log(`Current platform: ${currentPlatform}`);
    
    if (currentPlatform !== Platform.IOS) {
      console.log('\n⚠️  Note: This demo is designed for iOS but running on:', currentPlatform);
      console.log('On iOS, this would use react-native-keychain with iOS Keychain.');
      console.log('For this demo, we\'ll use the available storage for this platform.\n');
    }

    // Get platform-specific storage instance
    const storage = StorageFactory.getStorage('unillm-ios-demo');
    
    // On iOS, this would be an IOSStorage instance
    const isIOS = currentPlatform === Platform.IOS;
    const iosStorage = isIOS ? storage as IOSStorage : null;
    
    console.log('1. Checking storage capabilities...');
    
    // Check if biometric authentication is available (iOS only)
    if (isIOS && iosStorage && 'canImplyAuthentication' in iosStorage) {
      const canAuth = await (iosStorage as any).canImplyAuthentication();
      console.log(`   Biometric authentication available: ${canAuth}`);
      
      if (canAuth) {
        const biometryType = await (iosStorage as any).getSupportedBiometryType();
        console.log(`   Supported biometry type: ${biometryType}`);
      }
    } else if (!isIOS) {
      console.log('   Biometric authentication: Not available on this platform');
      console.log('   On iOS, this would check Face ID/Touch ID availability');
    }

    console.log('\n2. Storing API credentials securely...');
    
    // Try to store API keys securely using the appropriate storage for this platform
    try {
      await storage.setSecret('openai-api-key', 'sk-1234567890abcdef');
      await storage.setSecret('anthropic-api-key', 'sk-ant-1234567890abcdef');
      await storage.setSecret('user-preferences', JSON.stringify({
        theme: 'dark',
        model: 'gpt-4',
        temperature: 0.7
      }));

      const storageType = isIOS ? 'iOS Keychain' : `${currentPlatform} secure storage`;
      console.log(`   ✓ Credentials stored securely in ${storageType}`);
    } catch (error) {
      console.log(`   ⚠️  Storage not implemented for ${currentPlatform}`);
      console.log('   On iOS, this would use react-native-keychain with iOS Keychain');
      console.log('   For demo purposes, simulating successful storage...');
      
      // Simulate storage for demo purposes
      console.log('   ✓ Simulated: Credentials would be stored securely');
    }

    console.log('\n3. Retrieving stored credentials...');
    
    // Try to retrieve credentials
    let openaiKey = null;
    let anthropicKey = null;
    let preferences = null;
    let allKeys: string[] = [];
    
    try {
      openaiKey = await storage.getSecret('openai-api-key');
      anthropicKey = await storage.getSecret('anthropic-api-key');
      preferences = await storage.getSecret('user-preferences');
      
      console.log(`   OpenAI API Key: ${openaiKey ? '✓ Found' : '✗ Not found'}`);
      console.log(`   Anthropic API Key: ${anthropicKey ? '✓ Found' : '✗ Not found'}`);
      console.log(`   User Preferences: ${preferences ? '✓ Found' : '✗ Not found'}`);
      
      if (preferences) {
        try {
          const parsedPrefs = JSON.parse(preferences);
          console.log(`   - Theme: ${parsedPrefs.theme}`);
          console.log(`   - Model: ${parsedPrefs.model}`);
          console.log(`   - Temperature: ${parsedPrefs.temperature}`);
        } catch (e) {
          console.log('   Could not parse preferences');
        }
      }
    } catch (error) {
      console.log('   ⚠️  Retrieval not implemented for this platform');
      console.log('   Simulating retrieval for demo purposes...');
      
      // Simulate retrieval for demo purposes
      console.log('   OpenAI API Key: ✓ Found (simulated)');
      console.log('   Anthropic API Key: ✓ Found (simulated)');
      console.log('   User Preferences: ✓ Found (simulated)');
      console.log('   - Theme: dark');
      console.log('   - Model: gpt-4');
      console.log('   - Temperature: 0.7');
    }

    console.log('\n4. Listing all stored keys...');
    
    // Try to list all stored keys
    try {
      allKeys = await storage.getAllKeys();
      console.log(`   Total keys stored: ${allKeys.length}`);
      allKeys.forEach(key => {
        console.log(`   - ${key}`);
      });
    } catch (error) {
      console.log('   ⚠️  Key listing not implemented for this platform');
      console.log('   Simulating key listing for demo purposes...');
      console.log('   Total keys stored: 3 (simulated)');
      console.log('   - openai-api-key');
      console.log('   - anthropic-api-key');
      console.log('   - user-preferences');
    }

    console.log('\n5. Using with LLM Manager...');
    
    // Use with LLM Manager
    const manager = new LLMManager();
    await manager.init();

    // Note: The manager uses its own storage system through secrets.ts
    // For custom storage, you would need to modify the secrets.ts file
    // or use the storage directly as shown above
    console.log('   ✓ LLM Manager initialized (uses default storage system)');

    console.log('\n6. Demonstrating secure deletion...');
    
    // Try to delete a specific credential
    try {
      const deleted = await storage.deleteSecret('anthropic-api-key');
      console.log(`   Deleted Anthropic API key: ${deleted ? '✓ Success' : '✗ Failed'}`);

      // Verify deletion
      const deletedKey = await storage.getSecret('anthropic-api-key');
      console.log(`   Verification - Anthropic key exists: ${deletedKey ? '✗ Still exists' : '✓ Successfully deleted'}`);

      console.log('\n7. Final key count...');
      
      const finalKeys = await storage.getAllKeys();
      console.log(`   Remaining keys: ${finalKeys.length}`);
    } catch (error) {
      console.log('   ⚠️  Deletion not implemented for this platform');
      console.log('   Simulating deletion for demo purposes...');
      console.log('   Deleted Anthropic API key: ✓ Success (simulated)');
      console.log('   Verification - Anthropic key exists: ✓ Successfully deleted (simulated)');
      
      console.log('\n7. Final key count...');
      console.log('   Remaining keys: 2 (simulated)');
      console.log('   - openai-api-key');
      console.log('   - user-preferences');
    }

    console.log('\n=== Demo completed successfully! ===');
    
    if (isIOS) {
      console.log('\nThis demo used iOS Keychain for secure storage.');
      console.log('In a real React Native app on iOS, ensure:');
      console.log('- react-native-keychain is properly installed');
      console.log('- iOS permissions are configured in Info.plist');
      console.log('- Keychain sharing is enabled if needed');
    } else {
      console.log(`\nThis demo used ${currentPlatform} storage for demonstration.`);
      console.log('On iOS, this would use react-native-keychain with iOS Keychain.');
      console.log('To test iOS functionality, run this on an iOS device/simulator.');
    }

  } catch (error) {
    console.error('Demo failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('react-native-keychain')) {
        console.log('\n💡 To fix this error:');
        console.log('1. Install react-native-keychain: npm install react-native-keychain');
        console.log('2. Link the package: npx pod-install ios');
        console.log('3. Configure iOS permissions in Info.plist');
      }
    }
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateIOSKeychainStorage().catch(console.error);
}

export { demonstrateIOSKeychainStorage };