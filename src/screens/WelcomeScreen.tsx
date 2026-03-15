/**
 * WelcomeScreen
 * Initial screen with Google/Apple sign-in buttons
 * Minimalist design with centered authentication options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
  Platform,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ENABLE_MOCK_AUTH } from '@env';
import { configureGoogleSignIn, signInWithGoogle, signInWithApple } from '../services/auth';

export const WelcomeScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { login } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Configure Google Sign-In when component mounts
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const isMockEnabled = ENABLE_MOCK_AUTH === 'true';

      if (isMockEnabled) {
        // Development: Use mock token for fake backend
        const { accessToken, user } = await api.loginWithGoogle('test-token');
        await login(accessToken, user);
      } else {
        // Production: Real Google OAuth with native SDK
        const result = await signInWithGoogle();

        if (result) {
          // Successfully got ID token from Google
          const { idToken } = result;

          // Send ID token to backend for verification
          const { accessToken, user } = await api.loginWithGoogle(idToken);
          await login(accessToken, user);
        } else {
          // User cancelled or error occurred (already logged in signInWithGoogle)
          // Don't show error alert for user cancellation
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
      console.error(error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    try {
      const isMockEnabled = ENABLE_MOCK_AUTH === 'true';

      if (isMockEnabled) {
        // Development: Use mock data for fake backend
        const { accessToken, user } = await api.loginWithApple('test-token', 'test@apple.com');
        await login(accessToken, user);
      } else {
        // Production: Real Apple Sign-In with native SDK
        const result = await signInWithApple();

        if (result) {
          // Successfully got identity token from Apple
          const { identityToken, user } = result;

          // Send identity token to backend for verification
          const { accessToken, user: backendUser } = await api.loginWithApple(
            identityToken,
            user.email
          );
          await login(accessToken, backendUser);
        } else {
          // User cancelled or error occurred (already logged in signInWithApple)
          // Don't show error alert for user cancellation
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Apple');
      console.error(error);
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>U dead??</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Don't ghost your loved ones
        </Text>

        {/* Sign-In Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading || isAppleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>G</Text>
                <Text style={styles.buttonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Apple Sign-In Button - Only on iOS */}
          {Platform.OS === 'ios' && (
            <>
              {isAppleLoading ? (
                <View style={[styles.appleLoadingContainer, isDark && styles.appleLoadingDark]}>
                  <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} />
                </View>
              ) : (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={
                    isDark
                      ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                      : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                  }
                  cornerRadius={5}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                  disabled={isGoogleLoading || isAppleLoading}
                />
              )}
            </>
          )}
        </View>

        {/* Footer */}
        <Text style={[styles.footer, { color: theme.secondaryText }]}>
          Check in periodically or we'll notify your emergency contacts
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 64,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 5,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    width: '100%',
    height: 44,
  },
  appleLoadingContainer: {
    width: '100%',
    height: 44,
    backgroundColor: '#000000',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleLoadingDark: {
    backgroundColor: '#FFFFFF',
  },
  buttonIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 48,
    lineHeight: 18,
  },
});
