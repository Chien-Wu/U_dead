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

    console.log('🔵 Google Sign-In Response:', JSON.stringify(response, null, 2));

    // Response structure: { type: "success", data: { idToken, user, ... } }
    if (response.type !== 'success' || !response.data) {
      console.error('❌ Google Sign-In failed or was cancelled');
      return null;
    }

    // Extract ID token from response.data
    const idToken = response.data.idToken;

    if (!idToken) {
      console.error('❌ No ID token received from Google');
      console.error('Full response:', response);
      return null;
    }

    console.log('✅ ID Token received:', idToken.substring(0, 50) + '...');

    // Extract user data from response.data
    const userData = response.data.user;

    if (!userData) {
      console.error('❌ No user data received from Google');
      return null;
    }

    console.log('✅ User data:', userData.email, userData.name);

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
    // Handle user cancellation silently
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('ℹ️  User cancelled Google Sign-In');
      return null;
    }

    // Log actual errors
    console.error('❌ Google Sign-In error:', error);

    if (error.code === statusCodes.IN_PROGRESS) {
      console.error('Google Sign-In already in progress');
      return null;
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('Google Play Services not available');
      return null;
    }

    return null;
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
 * Initiate Apple Sign-In flow using native SDK
 * Returns identity token and email to exchange with backend
 * @returns Object with identityToken and user info, or null if failed/cancelled
 */
export const signInWithApple = async (): Promise<{
  identityToken: string;
  user: {
    email: string;
    name: string;
  };
} | null> => {
  try {
    const AppleAuthentication = require('expo-apple-authentication');

    console.log('🍎 Starting Apple Sign-In...');

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    console.log('🍎 Apple Sign-In credential received:', {
      user: credential.user,
      email: credential.email,
      fullName: credential.fullName,
    });

    // Extract identity token (this is what we send to backend)
    const identityToken = credential.identityToken;

    if (!identityToken) {
      console.error('❌ No identity token received from Apple');
      return null;
    }

    console.log('✅ Apple Identity Token received:', identityToken.substring(0, 50) + '...');

    // Apple only provides email and name on FIRST sign-in
    // Subsequent sign-ins won't include this info
    const email = credential.email || '';
    const fullName = credential.fullName;
    const name = fullName
      ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim()
      : '';

    console.log('✅ Apple user data:', { email, name });

    return {
      identityToken,
      user: {
        email,
        name,
      },
    };
  } catch (error: any) {
    // Handle user cancellation silently
    if (error.code === 'ERR_REQUEST_CANCELED') {
      console.log('ℹ️  User cancelled Apple Sign-In');
      return null;
    }

    // Log FULL error details for actual errors
    console.error('❌ Apple Sign-In Error Details:');
    console.error('  Error Code:', error.code);
    console.error('  Error Message:', error.message);
    console.error('  Full Error Object:', JSON.stringify(error, null, 2));
    console.error('  Error Stack:', error.stack);

    return null;
  }
};
