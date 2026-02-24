/**
 * AppNavigator
 * Main navigation structure with auth guard
 * Stack: Welcome -> Home -> Settings -> AddContact
 */

import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../context/AuthContext";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { FirstContactWelcomeScreen } from "../screens/FirstContactWelcomeScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { AddContactScreen } from "../screens/AddContactScreen";
import api from "../services/api";

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationRef = useRef<any>(null);

  // Check for first contact after login
  useEffect(() => {
    if (isAuthenticated && navigationRef.current) {
      checkFirstContact();
    }
  }, [isAuthenticated]);

  const checkFirstContact = async () => {
    try {
      const contacts = await api.getContacts();

      if (contacts.length === 0) {
        // Navigate to FirstContactWelcome screen
        navigationRef.current?.navigate('FirstContactWelcome');
      }
    } catch (error) {
      console.error('Failed to check contacts:', error);
    }
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          presentation: "card",
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : (
          // Main Stack
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="FirstContactWelcome"
              component={FirstContactWelcomeScreen}
              options={{
                presentation: "modal",
                gestureEnabled: false, // Can't swipe away
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                presentation: "modal",
                gestureEnabled: true,
                cardStyleInterpolator: ({ current }) => ({
                  cardStyle: {
                    opacity: current.progress,
                  },
                }),
              }}
            />
            <Stack.Screen
              name="AddContact"
              component={AddContactScreen}
              options={{
                presentation: "modal",
                gestureEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
