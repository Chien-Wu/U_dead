/**
 * FirstContactWelcomeScreen
 * Full-screen modal shown when user has 0 contacts
 * Guides user to add their first emergency contact
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../utils/colors';

export const FirstContactWelcomeScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const handleAddContact = () => {
    (navigation.navigate as any)('AddContact');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {/* App Icon */}
        <Text style={styles.icon}>💀</Text>

        {/* App Name */}
        <Text style={[styles.title, { color: theme.text }]}>U Dead??</Text>

        {/* Explanation */}
        <Text style={[styles.description, { color: theme.secondaryText }]}>
          Stay alive by checking in regularly.{'\n'}
          If you miss your deadline, we'll notify{'\n'}
          your emergency contacts.
        </Text>

        {/* Spacing */}
        <View style={styles.spacer} />

        {/* Call to Action */}
        <Text style={[styles.cta, { color: theme.text }]}>
          Let's add your first{'\n'}emergency contact.
        </Text>

        {/* Primary Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors.primary }]}
          onPress={handleAddContact}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Add First Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 30,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  spacer: {
    height: 40,
  },
  cta: {
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 26,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 250,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
