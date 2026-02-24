/**
 * OAuth Authentication Service
 * Handles Google and Apple Sign-In flows
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import {
  GOOGLE_CLIENT_ID_IOS,
  GOOGLE_CLIENT_ID_ANDROID,
  GOOGLE_CLIENT_ID_WEB,
} from '@env';

WebBrowser.maybeCompleteAuthSession();

export const getGoogleClientId = () => {
  if (Platform.OS === 'ios') return GOOGLE_CLIENT_ID_IOS;
  if (Platform.OS === 'android') return GOOGLE_CLIENT_ID_ANDROID;
  return GOOGLE_CLIENT_ID_WEB;
};

/**
 * Initiate Google Sign-In flow
 * Returns ID token to exchange with backend
 */
export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'com.udead.app',
      preferLocalhost: true,
    });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId: getGoogleClientId(),
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
      },
      discovery
    );

    if (!request) return null;

    const result = await promptAsync();

    if (result.type === 'success') {
      const { id_token } = result.params;
      return id_token;
    }

    return null;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return null;
  }
};

/**
 * Initiate Apple Sign-In flow
 * Returns identity token and email to exchange with backend
 */
export const signInWithApple = async (): Promise<{
  identityToken: string;
  email: string;
} | null> => {
  try {
    // Note: Apple Sign-In requires native module
    // For now, this is a placeholder - actual implementation would use
    // expo-apple-authentication which requires EAS build

    // import * as AppleAuthentication from 'expo-apple-authentication';
    // const credential = await AppleAuthentication.signInAsync({
    //   requestedScopes: [
    //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
    //   ],
    // });
    // return {
    //   identityToken: credential.identityToken!,
    //   email: credential.email!,
    // };

    // MOCK for development (will be replaced with real implementation)
    console.warn('Apple Sign-In not implemented yet - requires EAS build');
    return null;
  } catch (error) {
    console.error('Apple Sign-In Error:', error);
    return null;
  }
};
