/**
 * OAuth Authentication Service
 * Handles Google and Apple Sign-In flows using native SDKs
 */

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  GOOGLE_CLIENT_ID_IOS,
  GOOGLE_CLIENT_ID_WEB,
} from '@env';

/**
 * Configure Google Sign-In
 * Must be called before any sign-in attempts
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Web Client ID is required for backend token verification
    webClientId: GOOGLE_CLIENT_ID_WEB,
    // iOS Client ID (optional, uses reversed client ID from Info.plist if not provided)
    iosClientId: GOOGLE_CLIENT_ID_IOS,
    // Request offline access to get refresh token
    offlineAccess: true,
    // Scopes for user profile and email
    scopes: ['profile', 'email'],
  });
};

/**
 * Sign in with Google using native SDK
 * Returns ID token to send to backend for verification
 * @returns Object with idToken and user info, or null if failed/cancelled
 */
export const signInWithGoogle = async (): Promise<{
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    photo?: string;
  };
} | null> => {
  try {
    // Check if Google Play Services are available (mainly for Android)
    await GoogleSignin.hasPlayServices();

    // Sign in and get user info
    const response = await GoogleSignin.signIn();

    // Extract ID token (this is what we send to backend)
    const idToken = response.data?.idToken;

    if (!idToken) {
      console.error('No ID token received from Google');
      return null;
    }

    const userData = response.data?.user;

    if (!userData) {
      console.error('No user data received from Google');
      return null;
    }

    return {
      idToken,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name || '',
        photo: userData.photo || undefined,
      },
    };
  } catch (error: any) {
    // Handle specific error codes
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('User cancelled Google Sign-In');
      return null;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google Sign-In already in progress');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('Google Play Services not available');
      return null;
    } else {
      console.error('Google Sign-In error:', error);
      return null;
    }
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Error signing out from Google:', error);
  }
};

/**
 * Check if user is currently signed in to Google
 */
export const checkIfSignedIn = async (): Promise<boolean> => {
  const isSignedIn = await GoogleSignin.hasPreviousSignIn();
  return isSignedIn;
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
