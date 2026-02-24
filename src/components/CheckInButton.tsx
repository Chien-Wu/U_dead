/**
 * CheckInButton Component
 * Giant 280px pulsing circle with 4 states
 * Supports long-press interaction with haptic feedback
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  useAnimatedProps,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Circle } from "react-native-svg";
import { Colors, getStatusColor, StatusType } from "../utils/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BUTTON_SIZE = 280;
const LONG_PRESS_DURATION = 1500; // 1.5 seconds

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
  const breathScale = useSharedValue(1);
  const longPressProgress = useSharedValue(0);

  // Button text based on status
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

  // Breathing animation speeds based on status
  const getAnimationSpeed = (): number => {
    switch (status) {
      case "safe":
        return 2000; // Slow
      case "warning":
        return 1500; // Medium
      case "critical":
        return 800; // Fast
      case "dead":
        return 0; // No animation
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

  // Start breathing animation
  useEffect(() => {
    const speed = getAnimationSpeed();
    const { min, max } = getScaleRange();

    if (speed === 0) {
      breathScale.value = 1;
      return;
    }

    breathScale.value = withRepeat(
      withSequence(
        withTiming(max, {
          duration: speed / 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(min, {
          duration: speed / 2,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1,
      false,
    );
  }, [status]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
  }));

  const animatedProgressProps = useAnimatedProps(() => {
    const circumference = 2 * Math.PI * (BUTTON_SIZE / 2 + 5);
    const strokeDashoffset = interpolate(
      longPressProgress.value,
      [0, 1],
      [circumference, 0],
    );

    return {
      strokeDashoffset,
      opacity: longPressProgress.value > 0 ? 1 : 0,
    };
  });

  const timer1 = useRef<NodeJS.Timeout | null>(null);
  const timer2 = useRef<NodeJS.Timeout | null>(null);
  const timer3 = useRef<NodeJS.Timeout | null>(null);
  const readyTimer = useRef<NodeJS.Timeout | null>(null);

  const isReadyToRelease = useRef(false);

  const handlePressIn = () => {
    if (disabled) return;

    isReadyToRelease.current = false;

    longPressProgress.value = withTiming(1, {
      duration: LONG_PRESS_DURATION,
      easing: Easing.linear,
    });
    timer1.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 400);

    timer2.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 800);

    timer3.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1200);

    readyTimer.current = setTimeout(() => {
      isReadyToRelease.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    }, LONG_PRESS_DURATION);
  };

  const handlePressOut = () => {
    if (disabled) return;
    if (timer1.current) clearTimeout(timer1.current);
    if (timer2.current) clearTimeout(timer2.current);
    if (timer3.current) clearTimeout(timer3.current);
    if (readyTimer.current) clearTimeout(readyTimer.current);

    if (isReadyToRelease.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onCheckIn();
    } else {
    }
    isReadyToRelease.current = false;
    longPressProgress.value = withTiming(0, { duration: 200 });
  };

  const buttonColor = getStatusColor(status);
  const textColor = status === "dead" ? Colors.light.secondaryText : "#FFFFFF";

  return (
    <View style={styles.container}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.button,
            { backgroundColor: buttonColor },
            animatedButtonStyle,
          ]}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>
            {getButtonText()}
          </Text>

          {status === "dead" && (
            <Text style={styles.subtitleText}>Tap to revive</Text>
          )}
        </Animated.View>

        {/* Progress Ring */}
        <View style={styles.progressRing}>
          <Svg width={BUTTON_SIZE + 20} height={BUTTON_SIZE + 20}>
            <AnimatedCircle
              cx={(BUTTON_SIZE + 20) / 2}
              cy={(BUTTON_SIZE + 20) / 2}
              r={BUTTON_SIZE / 2 + 5}
              stroke="#FFFFFF"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * (BUTTON_SIZE / 2 + 5)}`}
              animatedProps={animatedProgressProps}
            />
          </Svg>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
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
  progressRing: {
    position: "absolute",
    top: -10,
    left: -10,
  },
});
