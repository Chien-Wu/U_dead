/**
 * HomeScreen
 * Main interface: Giant button + countdown timer + scrollable history
 * Implements "The Monolith" design from spec
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "../utils/colors";
import { CheckInButton } from "../components/CheckInButtonSimple";
import { useStatus, formatTimeRemaining } from "../hooks/useStatus";
import { useAuth } from "../context/AuthContext";
import api, { CheckInLog } from "../services/api";
import { scheduleCheckInReminders, testNotification } from "../services/pushNotifications";

export const HomeScreen = () => {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();

  const { status, isLoading, refresh } = useStatus(true);
  const [logs, setLogs] = useState<CheckInLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch check-in history
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.getLogs(20, 0);
      setLogs(data.logs);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await api.checkIn();

      // Schedule local notifications
      await scheduleCheckInReminders(response.next_deadline);

      // Refresh status and logs
      await refresh();
      await fetchLogs();

      Alert.alert("Check-in successful!", "Stay alive!");
    } catch (error) {
      Alert.alert("Error", "Failed to check in. Please try again.");
      console.error("Check-in error:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refresh(), fetchLogs()]);
    setIsRefreshing(false);
  };

  const handleSettings = () => {
    (navigation.navigate as any)("Settings");
  };

  // TEST NOTIFICATION - Remove before production
  // const handleTestNotification = async () => {
  //   await testNotification();
  //   Alert.alert("Test scheduled", "Notification in 2 seconds");
  // };

  // Format time ago for log timestamps
  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  // Render individual log item
  const renderLogItem = ({ item }: { item: CheckInLog }) => (
    <View style={[styles.logItem, { borderLeftColor: Colors.safe }]}>
      <Text style={[styles.logTime, { color: theme.text }]}>
        {formatTimeAgo(item.timestamp)}
      </Text>
      <Text style={[styles.logDate, { color: theme.secondaryText }]}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  const currentStatus = status?.status || "safe";
  const timeRemaining = status
    ? formatTimeRemaining(status.seconds_remaining)
    : "--";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleSettings}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.timer, { color: theme.text }]}>
          {timeRemaining}
        </Text>
        {/* TEST NOTIFICATION - Remove before production */}
        {/* <TouchableOpacity
          onPress={handleTestNotification}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="notifications-outline" size={28} color={theme.text} />
        </TouchableOpacity> */}
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.buttonSection}>
        <CheckInButton status={currentStatus} onCheckIn={handleCheckIn} />
      </View>
      <Text style={[styles.scrollHint, { color: theme.secondaryText }]}>
        ▲ Hold to check in ▲
      </Text>

      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          logs.length > 0 ? (
            <Text style={[styles.historyTitle, { color: theme.text }]}>
              Check-in History
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              No check-ins yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
              Your history will appear here
            </Text>
          </View>
        }
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 100,
    fontSize: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  settingsIcon: {
    fontSize: 24,
  },
  timer: {
    fontSize: 24,
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  buttonSection: {
    alignItems: "center",
    paddingVertical: 60,
  },
  scrollHint: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 24,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  logItem: {
    paddingLeft: 16,
    paddingVertical: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
    marginHorizontal: 24,
  },
  logTime: {
    fontSize: 16,
    fontWeight: "500",
  },
  logDate: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});
