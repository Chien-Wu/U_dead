/**
 * Checkbox Component
 * Custom checkbox that works consistently across iOS and Android
 * Used for consent forms and agreement checkboxes
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../utils/colors';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onToggle}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? Colors.primary : theme.secondaryText,
            backgroundColor: checked ? Colors.primary : 'transparent',
          },
          disabled && styles.disabled,
        ]}
      >
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {label && (
        <Text
          style={[
            styles.label,
            { color: theme.text },
            disabled && { color: theme.secondaryText },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.5,
  },
});
