import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#6366F1', // Modern Indigo
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondary: '#10B981', // Modern Emerald
    secondaryLight: '#34D399',
    secondaryDark: '#059669',
    background: '#F8FAFC', // Modern Slate 50
    surface: '#FFFFFF',
    error: '#EF4444', // Modern Red
    success: '#10B981', // Modern Green
    warning: '#F59E0B', // Modern Amber
    text: '#1E293B', // Modern Slate 800
    textSecondary: '#64748B', // Modern Slate 500
    textMuted: '#94A3B8', // Modern Slate 400
    divider: '#E2E8F0', // Modern Slate 200
    border: '#E2E8F0', // Modern Slate 200
    sidebar: '#F1F5F9', // Modern Slate 100
    sidebarActive: '#E0E7FF', // Modern Indigo 100
    sidebarText: '#475569', // Modern Slate 600
    sidebarActiveText: '#6366F1', // Modern Indigo
    card: '#FFFFFF',
    cardHover: '#F8FAFC',
  },
  font: {
    size: 16,
    sizeHeading: 18,
    sizeTitle: 24,
    sizeLarge: 20,
    family: Platform.OS === 'android' ? 'Roboto' : 'System',
    weightRegular: '400',
    weightMedium: '500',
    weightSemibold: '600',
    weightBold: '700',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
  },
  elevation: {
    sm: 1,
    md: 3,
    lg: 6,
    xl: 12,
  },
}; 