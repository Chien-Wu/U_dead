/**
 * WelcomeScreen
 * Initial screen with Google/Apple sign-in buttons
 * Minimalist design with centered authentication options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { Colors } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ENABLE_MOCK_AUTH } from '@env';

export const WelcomeScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const isMockEnabled = ENABLE_MOCK_AUTH === 'true';

      if (isMockEnabled) {
        // Development: Use mock token for fake backend
        const { accessToken, user } = await api.loginWithGoogle('test-token');
        await login(accessToken, user);
      } else {
        // Production: Real OAuth flow
        Alert.alert('Not Implemented', 'Real Google OAuth requires native build');
        // TODO: Implement real Google OAuth using expo-auth-session
        // const { signInWithGoogle } = require('../services/auth');
        // const idToken = await signInWithGoogle();
        // if (idToken) {
        //   const { accessToken, user } = await api.loginWithGoogle(idToken);
        //   await login(accessToken, user);
        // }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Google');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const isMockEnabled = ENABLE_MOCK_AUTH === 'true';

      if (isMockEnabled) {
        // Development: Use mock data for fake backend
        const { accessToken, user } = await api.loginWithApple('test-token', 'test@apple.com');
        await login(accessToken, user);
      } else {
        // Production: Real OAuth flow
        Alert.alert('Not Implemented', 'Real Apple Sign-In requires native build');
        // TODO: Implement real Apple Sign-In using expo-apple-authentication
        // const { signInWithApple } = require('../services/auth');
        // const result = await signInWithApple();
        // if (result) {
        //   const { accessToken, user } = await api.loginWithApple(result.identityToken, result.email);
        //   await login(accessToken, user);
        // }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Apple');
      console.error(error);
    } finally {
      setIsLoading(false);
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
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.buttonIcon}>G</Text>
                <Text style={styles.buttonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.appleButton, { backgroundColor: theme.text }]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.background} />
            ) : (
              <>
                <Text style={[styles.buttonIcon, { color: theme.background }]}></Text>
                <Text style={[styles.buttonText, { color: theme.background }]}>
                  Sign in with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000000',
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
