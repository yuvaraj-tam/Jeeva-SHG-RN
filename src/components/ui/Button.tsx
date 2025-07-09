import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { theme } from '../../theme';

export const Button = ({ children, onPress, variant = 'default', size = 'md', style, disabled, ...props }: any) => {
  const buttonStyle = [styles.button, styles[variant], styles[size], style];
  const textStyleArray = [styles.text, styles[`${variant}Text`], styles[`${size}Text`]];
  if (disabled) {
    buttonStyle.push(styles.disabled);
    textStyleArray.push(styles.disabledText);
  }

  const handlePress = () => {
    console.log('Button pressed:', children);
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={handlePress} 
      disabled={disabled} 
      activeOpacity={0.85} 
      {...props}
    >
      <Text style={textStyleArray}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    ...(Platform.OS === 'web' ? {
      boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
    } : {
      elevation: theme.elevation.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }),
  },
  default: {
    backgroundColor: theme.colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
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
  destructiveText: {
    color: theme.colors.surface,
  },
  md: {
    minWidth: 120,
  },
  sm: {
    minWidth: 80,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  mdText: {},
  smText: {
    fontSize: theme.font.size,
  },
  disabled: {
    backgroundColor: '#d1d5db',
  },
  disabledText: {
    color: '#a1a1aa',
  },
}); 