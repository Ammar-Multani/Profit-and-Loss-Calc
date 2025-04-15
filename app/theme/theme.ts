import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const fontConfig = {
  displayLarge: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    letterSpacing: -0.25,
  },
  headlineLarge: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    letterSpacing: -0.25,
  },
  headlineMedium: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  headlineSmall: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  bodyLarge: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    letterSpacing: 0.4,
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    primaryContainer: '#DBEAFE',
    secondary: '#4F46E5',
    secondaryContainer: '#E0E7FF',
    tertiary: '#7C3AED',
    tertiaryContainer: '#EDE9FE',
    success: '#059669',
    successContainer: '#DCFCE7',
    warning: '#D97706',
    warningContainer: '#FEF3C7',
    error: '#DC2626',
    errorContainer: '#FEE2E2',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceVariant: '#F1F5F9',
    elevation: {
      level0: 'transparent',
      level1: 'rgba(255, 255, 255, 0.05)',
      level2: 'rgba(255, 255, 255, 0.08)',
      level3: 'rgba(255, 255, 255, 0.11)',
    },
  },
  fonts: fontConfig,
  roundness: 16,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#60A5FA',
    primaryContainer: '#1E3A8A',
    secondary: '#818CF8',
    secondaryContainer: '#312E81',
    tertiary: '#A78BFA',
    tertiaryContainer: '#4C1D95',
    success: '#34D399',
    successContainer: '#065F46',
    warning: '#FBBF24',
    warningContainer: '#92400E',
    error: '#F87171',
    errorContainer: '#991B1B',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    elevation: {
      level0: 'transparent',
      level1: 'rgba(0, 0, 0, 0.05)',
      level2: 'rgba(0, 0, 0, 0.08)',
      level3: 'rgba(0, 0, 0, 0.11)',
    },
  },
  fonts: fontConfig,
  roundness: 16,
};