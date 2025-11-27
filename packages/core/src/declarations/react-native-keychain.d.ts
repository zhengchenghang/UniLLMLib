declare module 'react-native-keychain' {
  export interface ACCESS_CONTROL {
    USER_PRESENCE: string;
    BIOMETRY_ANY: string;
    BIOMETRY_CURRENT_SET: string;
    DEVICE_PASSCODE: string;
    APPLICATION_PASSWORD: string;
    BIOMETRY_ANY_OR_DEVICE_PASSCODE: string;
    BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: string;
  }

  export interface ACCESSIBLE {
    WHEN_UNLOCKED: string;
    AFTER_FIRST_UNLOCK: string;
    ALWAYS: string;
    WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: string;
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: string;
    AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: string;
    ALWAYS_THIS_DEVICE_ONLY: string;
  }

  export interface AUTHENTICATION_TYPE {
    DEVICE_PASSCODE_OR_BIOMETRICS: string;
    BIOMETRICS: string;
    DEVICE_PASSCODE: string;
  }

  export interface BIOMETRY_TYPE {
    TOUCH_ID: string;
    FACE_ID: string;
    OPTIC_ID: string;
  }

  export interface KeychainOptions {
    service?: string;
    accessible?: string | ACCESSIBLE;
    accessGroup?: string;
    accessControl?: string | ACCESS_CONTROL;
    authenticatePrompt?: string;
    authenticationPrompt?: {
      title?: string;
      subtitle?: string;
      description?: string;
      cancel?: string;
    };
    authenticationType?: number | AUTHENTICATION_TYPE;
    rules?: {
      [key: string]: any;
    };
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

  export function getAllGenericPasswordServices(): Promise<string[]>;

  export function canImplyAuthentication(): Promise<boolean>;

  export function getSupportedBiometryType(): Promise<null | BIOMETRY_TYPE>;

  export function getAccessControl(): Promise<string | null>;

  export function setInternetCredentials(
    server: string,
    username: string,
    password: string,
    options?: KeychainOptions
  ): Promise<void>;

  export function getInternetCredentials(
    server: string,
    options?: KeychainOptions
  ): Promise<false | { username: string; password: string; server: string }>;

  export function resetInternetCredentials(
    server: string,
    options?: KeychainOptions
  ): Promise<void>;

  export function requestSharedWebCredentials(): Promise<false | { server: string; username: string; password: string }>;

  export function setSharedWebCredentials(
    server: string,
    username: string,
    password: string
  ): Promise<void>;

  // Constants
  export const ACCESS_CONTROL: ACCESS_CONTROL;
  export const ACCESSIBLE: ACCESSIBLE;
  export const AUTHENTICATION_TYPE: AUTHENTICATION_TYPE;
  export const BIOMETRY_TYPE: BIOMETRY_TYPE;
}
