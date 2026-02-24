/**
 * CheckInButton - Simplified Version (Haptic & Glow Upgraded)
 * Uses React Native Animated API instead of Reanimated
 * NO WORKLETS DEPENDENCY - Works in Expo Go
 * Features: Infinite High-Frequency Rumble, Breathing Glow Aura
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  useColorScheme,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Colors, getStatusColor, StatusType } from "../utils/colors";
import { LONG_PRESS_DURATION } from "@env";

const BUTTON_SIZE = 280;
const PRESS_DURATION = parseInt(LONG_PRESS_DURATION, 10) || 1000;

interface CheckInButtonProps {
  status: StatusType;
  onCheckIn: () => void;
  disabled?: boolean;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  status,
  onCheckIn,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animation values
  const breathScale = useRef(new Animated.Value(1)).current;
  const longPressProgress = useRef(new Animated.Value(0)).current;
  const [isPressing, setIsPressing] = useState(false);

  // Interval timer for infinite haptic rumble
  const rumbleInterval = useRef<NodeJS.Timeout | null>(null);
  const isReadyToRelease = useRef(false);

  const getButtonText = (): string => {
    switch (status) {
      case "safe":
        return "I'M ALIVE";
      case "warning":
        return "U THERE?";
      case "critical":
        return "LAST CHANCE";
      case "dead":
        return "YOU'RE DEAD";
      default:
        return "I'M ALIVE";
    }
  };

  const getAnimationSpeed = (): number => {
    switch (status) {
      case "safe":
        return 2000;
      case "warning":
        return 1500;
      case "critical":
        return 800;
      case "dead":
        return 0;
      default:
        return 2000;
    }
  };

  const getScaleRange = (): { min: number; max: number } => {
    switch (status) {
      case "safe":
        return { min: 1.0, max: 1.05 };
      case "warning":
        return { min: 1.0, max: 1.08 };
      case "critical":
        return { min: 1.0, max: 1.12 };
      case "dead":
        return { min: 1.0, max: 1.0 };
      default:
        return { min: 1.0, max: 1.05 };
    }
  };

  useEffect(() => {
    longPressProgress.setValue(0);
  }, []);

  useEffect(() => {
    const speed = getAnimationSpeed();
    const { min, max } = getScaleRange();

    if (speed === 0) {
      breathScale.setValue(1);
      return;
    }

    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathScale, {
          toValue: max,
          duration: speed / 2,
          useNativeDriver: true,
        }),
        Animated.timing(breathScale, {
          toValue: min,
          duration: speed / 2,
          useNativeDriver: true,
        }),
      ]),
    );

    breathingAnimation.start();
    return () => breathingAnimation.stop();
  }, [status]);

  const handlePressIn = () => {
    if (disabled) return;

    setIsPressing(true);
    isReadyToRelease.current = false;

    const startTime = Date.now();

    // Start progress bar fill animation
    Animated.timing(longPressProgress, {
      toValue: 1,
      duration: PRESS_DURATION,
      useNativeDriver: false,
    }).start();

    // Infinite Rumble Engine
    if (rumbleInterval.current) clearInterval(rumbleInterval.current);

    rumbleInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed < PRESS_DURATION * 0.4) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (elapsed < PRESS_DURATION * 0.8) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else if (elapsed < PRESS_DURATION) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } else {
        // Target reached, lock-in feeling followed by continuous heavy rumble
        if (!isReadyToRelease.current) {
          isReadyToRelease.current = true;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      }
    }, 100);
  };

  const handlePressOut = () => {
    // Clear rumble engine to prevent phantom vibrations
    if (rumbleInterval.current) {
      clearInterval(rumbleInterval.current);
      rumbleInterval.current = null;
    }

    // Determine check-in success
    if (isReadyToRelease.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCheckIn();
    } else {
      longPressProgress.stopAnimation();
    }

    // Reset state instantly to prevent animation ghosting
    setIsPressing(false);
    isReadyToRelease.current = false;
    longPressProgress.setValue(0);
  };

  const buttonColor = getStatusColor(status);
  const textColor = status === "dead" ? Colors.light.secondaryText : "#FFFFFF";

  // Calculate dynamic aura scale (always slightly larger than the button itself)
  const auraScale = breathScale.interpolate({
    inputRange: [1.0, 1.12],
    outputRange: [1.1, 1.35],
  });

  return (
    <View style={styles.container}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        {/* Background Aura Layer for consistent glow effect */}
        {status !== "dead" && (
          <Animated.View
            style={[
              styles.glowAura,
              {
                backgroundColor: buttonColor,
                transform: [{ scale: auraScale }],
              },
            ]}
          />
        )}

        {/* Main Button with dynamic colored shadow */}
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor: buttonColor,
              shadowColor: buttonColor,
            },
            { transform: [{ scale: breathScale }] },
          ]}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>
            {getButtonText()}
          </Text>

          {status === "dead" && (
            <Text style={styles.subtitleText}>Tap to revive</Text>
          )}
        </Animated.View>

        {/* Action Progress Bar */}
        {isPressing && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: longPressProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            />
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glowAura: {
    position: "absolute",
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    opacity: 0.35, // Soft opacity for the background glow
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    // Centered colored shadow for the main button
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16, // Hardware shadow for Android
  },
  buttonText: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
  },
  subtitleText: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
  },
  progressContainer: {
    position: "absolute",
    bottom: -40,
    left: 40,
    right: 40,
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 3,
  },
});
