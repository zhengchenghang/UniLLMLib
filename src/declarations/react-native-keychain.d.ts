declare module 'react-native-keychain' {
  export interface KeychainOptions {
    service?: string;
    accessible?: string;
    accessGroup?: string;
    authenticationPrompt?: {
      title?: string;
      subtitle?: string;
      description?: string;
      cancel?: string;
    };
    authenticationType?: number;
  }

  export interface GenericPassword {
    service?: string;
    username: string;
    password: string;
    storage?: string;
  }

  export function setGenericPassword(
    username: string,
    password: string,
    options?: KeychainOptions
  ): Promise<boolean>;

  export function getGenericPassword(
    options?: KeychainOptions
  ): Promise<false | GenericPassword>;

  export function resetGenericPassword(
    options?: KeychainOptions
  ): Promise<boolean>;
}
