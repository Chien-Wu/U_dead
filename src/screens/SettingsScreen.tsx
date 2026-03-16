/**
 * SettingsScreen
 * Modal for managing check-in period, contacts, and account
 * Features: Manual save functionality for settings, Platform-specific picker rendering
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "../utils/colors";
import { useAuth } from "../context/AuthContext";
import { ContactCard } from "../components/ContactCard";
import api, { Contact } from "../services/api";
import { PrivacyConfig } from "../config/privacy";

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { logout } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [checkinPeriod, setCheckinPeriod] = useState(48);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch contacts (required)
      const contactsData = await api.getContacts();
      setContacts(contactsData);

      // Fetch settings (optional - use default if endpoint doesn't exist)
      try {
        const settingsData = await api.getSettings();
        setCheckinPeriod(settingsData.checkin_period_hours);
      } catch (settingsError: any) {
        if (settingsError.response?.status === 404) {
          console.warn("⚠️ Settings endpoint not found (404), using default value");
          // Use default check-in period if endpoint doesn't exist
          setCheckinPeriod(48);
        } else {
          throw settingsError;
        }
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch settings:", error);
      if (error.response?.status === 404) {
        Alert.alert("Backend Error", "Some endpoints are not available. Please check your backend is running.");
      } else {
        Alert.alert("Error", "Failed to load settings");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Only update local state, do not trigger API call here
  const handlePeriodChange = (hours: number) => {
    setCheckinPeriod(hours);
  };

  // Trigger API call only when Save is pressed
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await api.updateSettings(checkinPeriod);
      Alert.alert("Success", "Settings saved successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update settings");
      setIsSaving(false);
    }
  };

  const handleAddContact = () => {
    (navigation.navigate as any)("AddContact", { onSave: fetchData });
  };

  const handleEditContact = (contact: Contact) => {
    (navigation.navigate as any)("AddContact", { contact, onSave: fetchData });
  };

  const handleDeleteContact = async (id: string) => {
    try {
      await api.deleteContact(id);
      setContacts(contacts.filter((c) => c.id !== id));
      Alert.alert("Success", "Contact removed");
    } catch (error) {
      Alert.alert("Error", "Failed to delete contact");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.deleteAccount();
              await logout();
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ],
    );
  };

  const handleOpenPrivacyPolicy = async () => {
    const url = PrivacyConfig.links.privacyPolicyUrl;
    if (!url) {
      Alert.alert("Not Available", "Privacy Policy URL has not been configured yet.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open Privacy Policy");
    }
  };

  const handleOpenTerms = async () => {
    const url = PrivacyConfig.links.termsUrl;
    if (!url) {
      Alert.alert("Not Available", "Terms of Service URL has not been configured yet.");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this URL");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open Terms of Service");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with Save and Close actions */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleSaveSettings}
            disabled={isSaving || isLoading}
            style={styles.saveButton}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.saveButtonText, { color: Colors.primary }]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            disabled={isSaving}
          >
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Check-in Period Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Check-in Period
          </Text>
          <View
            style={[styles.pickerContainer, { backgroundColor: theme.card }]}
          >
            <Picker
              selectedValue={checkinPeriod}
              onValueChange={handlePeriodChange}
              style={{ color: theme.text }}
              itemStyle={{ color: theme.text, height: 150 }}
            >
              <Picker.Item label="6 hours" value={6} />
              <Picker.Item label="12 hours" value={12} />
              <Picker.Item label="24 hours" value={24} />
              <Picker.Item label="48 hours" value={48} />
              <Picker.Item label="72 hours" value={72} />
              <Picker.Item label="1 week" value={168} />
            </Picker>
          </View>
        </View>

        {/* Emergency Contacts List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Emergency Contacts
            </Text>
            <TouchableOpacity onPress={handleAddContact}>
              <Text style={[styles.addButton, { color: Colors.primary }]}>
                + Add
              </Text>
            </TouchableOpacity>
          </View>

          {contacts.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                No emergency contacts yet
              </Text>
            </View>
          ) : (
            contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
              />
            ))
          )}
        </View>

        {/* Account Management */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Account
          </Text>

          <TouchableOpacity
            style={[styles.accountButton, { backgroundColor: theme.card }]}
            onPress={handleLogout}
          >
            <Text style={[styles.accountButtonText, { color: theme.text }]}>
              Logout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.accountButton, { backgroundColor: theme.card }]}
            onPress={handleDeleteAccount}
          >
            <Text
              style={[styles.accountButtonText, { color: Colors.critical }]}
            >
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Legal & Privacy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Legal & Privacy
          </Text>

          {PrivacyConfig.links.privacyPolicyUrl && (
            <TouchableOpacity
              style={[styles.legalButton, { backgroundColor: theme.card }]}
              onPress={handleOpenPrivacyPolicy}
            >
              <Text style={[styles.legalButtonText, { color: theme.text }]}>
                {PrivacyConfig.linkLabels.privacyPolicy}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}

          {PrivacyConfig.links.termsUrl && (
            <TouchableOpacity
              style={[styles.legalButton, { backgroundColor: theme.card }]}
              onPress={handleOpenTerms}
            >
              <Text style={[styles.legalButtonText, { color: theme.text }]}>
                {PrivacyConfig.linkLabels.terms}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 28,
    color: "#8E8E93",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  pickerContainer: {
    borderRadius: 12,
    overflow: "hidden",
    height: Platform.OS === "android" ? 50 : 150,
    justifyContent: "center",
  },
  addButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
  accountButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  accountButtonText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  legalButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  legalButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  chevron: {
    fontSize: 24,
    color: "#8E8E93",
    fontWeight: "300",
  },
});
