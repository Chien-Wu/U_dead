/**
 * AddContactScreen
 * Form for adding/editing emergency contacts
 * Validates name, email, and death message
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import api, { Contact } from '../services/api';
import { Checkbox } from '../components/Checkbox';
import { PrivacyConfig } from '../config/privacy';

export const AddContactScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const params = route.params as { contact?: Contact; onSave?: () => void } | undefined;
  const existingContact = params?.contact;
  const onSave = params?.onSave;

  const [name, setName] = useState(existingContact?.name || '');
  const [email, setEmail] = useState(existingContact?.email || '');
  const [deathMessage, setDeathMessage] = useState(existingContact?.death_message || '');
  const [hasConsent, setHasConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!existingContact;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!deathMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (deathMessage.length > 1000) {
      Alert.alert('Error', 'Message must be less than 1000 characters');
      return;
    }

    // Privacy consent validation (only for new contacts)
    if (!isEditing && !hasConsent) {
      Alert.alert(
        'Consent Required',
        'Please confirm that you have obtained consent from this person to use their email for emergency notifications.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const contactData = {
        name: name.trim(),
        email: email.trim(),
        death_message: deathMessage.trim(),
      };

      if (isEditing && existingContact) {
        await api.updateContact(existingContact.id, contactData);
      } else {
        await api.addContact(contactData);
      }

      if (onSave) {
        onSave();
      } else {
        navigation.goBack();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Failed to save contact';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelButton, { color: Colors.primary }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>
          {isEditing ? 'Edit Contact' : 'Add Contact'}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          <Text
            style={[
              styles.saveButton,
              { color: isSaving ? theme.secondaryText : Colors.primary },
            ]}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Name Field */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="Mom, Dad, Best Friend..."
            placeholderTextColor={theme.secondaryText}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Email Field */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="email@example.com"
            placeholderTextColor={theme.secondaryText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Death Message Field */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>
            Message (sent if you're dead)
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: theme.card, color: theme.text },
            ]}
            placeholder="Hey, if you're reading this..."
            placeholderTextColor={theme.secondaryText}
            value={deathMessage}
            onChangeText={setDeathMessage}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: theme.secondaryText }]}>
            {deathMessage.length}/1000
          </Text>
        </View>

        {/* Privacy & Consent Section */}
        {!isEditing && (
          <View style={styles.privacySection}>
            <Text style={[styles.privacyTitle, { color: theme.text }]}>
              {PrivacyConfig.contactDisclosure.title}
            </Text>

            {PrivacyConfig.contactDisclosure.points.map((point, index) => (
              <View key={index} style={styles.privacyPoint}>
                <Text style={[styles.bullet, { color: theme.secondaryText }]}>•</Text>
                <Text style={[styles.privacyText, { color: theme.secondaryText }]}>
                  {point}
                </Text>
              </View>
            ))}

            <View style={styles.consentCheckbox}>
              <Checkbox
                checked={hasConsent}
                onToggle={() => setHasConsent(!hasConsent)}
                label={PrivacyConfig.contactDisclosure.consentCheckbox}
              />
            </View>
          </View>
        )}

        {/* Info */}
        <View style={styles.info}>
          <Text style={[styles.infoText, { color: theme.secondaryText }]}>
            This person will receive an email with your custom message if you miss your check-in
            deadline.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  cancelButton: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  privacySection: {
    padding: 16,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 12,
    marginBottom: 24,
  },
  privacyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  privacyPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 14,
    marginRight: 8,
    lineHeight: 20,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  consentCheckbox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  info: {
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
