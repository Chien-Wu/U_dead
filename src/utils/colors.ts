/**
 * U dead?? - Design System Color Tokens
 * Matches the spec from project documentation
 */

export const Colors = {
  // Status Colors
  safe: '#34C759',       // Green - >3 hours remaining
  warning: '#FF9500',    // Amber - 1-3 hours remaining
  critical: '#FF3B30',   // Red - <1 hour remaining
  dead: '#8E8E93',       // Gray - Deadline passed

  // Theme Colors - Light Mode
  light: {
    background: '#F5F5F7',
    card: '#FFFFFF',
    text: '#000000',
    secondaryText: '#8E8E93',
  },

  // Theme Colors - Dark Mode
  dark: {
    background: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    secondaryText: '#8E8E93',
  },

  // Accent
  primary: '#007AFF',    // iOS blue for buttons/actions
};

export type StatusType = 'safe' | 'warning' | 'critical' | 'dead';

export const getStatusColor = (status: StatusType): string => {
  switch (status) {
    case 'safe':
      return Colors.safe;
    case 'warning':
      return Colors.warning;
    case 'critical':
      return Colors.critical;
    case 'dead':
      return Colors.dead;
    default:
      return Colors.safe;
  }
};
