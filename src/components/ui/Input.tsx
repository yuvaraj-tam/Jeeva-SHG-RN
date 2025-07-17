import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const Input = ({ label, error, containerStyle, ...props }: any) => (
  <View style={[styles.container, containerStyle]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, error && styles.inputError]}
      placeholderTextColor={theme.colors.textSecondary}
      {...props}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.font.family,
  },
  input: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontFamily: theme.font.family,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    fontSize: theme.font.size,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    fontFamily: theme.font.family,
  },
}); 