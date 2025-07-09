import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export const Badge = ({ children, variant = 'default', style }: { children: React.ReactNode; variant?: BadgeVariant; style?: any }) => (
  <View style={[styles.badge, styles[variant], style]}>
    <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    alignSelf: 'flex-start',
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  default: {
    backgroundColor: theme.colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  destructive: {
    backgroundColor: theme.colors.error,
  },
  text: {
    fontSize: theme.font.size,
    color: theme.colors.surface,
    fontWeight: '500',
    fontFamily: theme.font.family,
  },
  defaultText: {
    color: theme.colors.surface,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  secondaryText: {
    color: theme.colors.surface,
  },
  destructiveText: {
    color: theme.colors.surface,
  },
}); 