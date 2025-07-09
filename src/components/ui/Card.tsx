import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardTitleProps {
  children: React.ReactNode;
  style?: ViewStyle | TextStyle;
}

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, style }: any) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const CardHeader = ({ children, style }: any) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardTitle = ({ children, style }: any) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const CardDescription = ({ children, style }: any) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

export const CardContent = ({ children, style }: any) => (
  <View style={[styles.content, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...(Platform.OS === 'web' ? {
      boxShadow: `0 2px 4px rgba(0, 0, 0, 0.08)`,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    }),
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.font.family,
  },
  description: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  content: {
    paddingTop: theme.spacing.xs,
  },
}); 