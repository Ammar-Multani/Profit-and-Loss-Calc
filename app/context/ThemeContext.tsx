import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  theme: typeof MD3LightTheme;
  colors: {
    background: string;
    backgroundSecondary: string;
    surface: string;
    surfaceVariant: string;
    surfaceElevated: string;
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    accent: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderLight: string;
    card: string;
    cardElevated: string;
    icon: string;
    placeholder: string;
    shadow: string;
    overlay: string;
    gradient: {
      primary: string[];
      success: string[];
      error: string[];
      warning: string[];
      neutral: string[];
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  roundness: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  elevation: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define custom light theme
const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    primaryContainer: '#EFF6FF',
    secondary: '#10B981',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    error: '#EF4444',
    onSurface: '#1F2937',
    onBackground: '#1F2937',
    onPrimary: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
};

// Define custom dark theme
const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',
    primaryContainer: '#1E3A8A',
    secondary: '#34D399',
    background: '#111827',
    surface: '#1F2937',
    error: '#F87171',
    onSurface: '#F9FAFB',
    onBackground: '#F9FAFB',
    onPrimary: '#111827',
    success: '#34D399',
    warning: '#FBBF24',
    info: '#60A5FA',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) {
          setThemeMode(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const updateThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const isDarkMode = 
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;
  
  // Extended colors for easier access in components
  const colors = {
    background: theme.colors.background,
    backgroundSecondary: isDarkMode ? '#1A202C' : '#F3F4F6',
    surface: theme.colors.surface,
    surfaceVariant: isDarkMode ? '#374151' : '#F3F4F6',
    surfaceElevated: isDarkMode ? '#2D3748' : '#FFFFFF',
    primary: theme.colors.primary,
    primaryLight: isDarkMode ? '#60A5FA' : '#93C5FD',
    primaryDark: isDarkMode ? '#1E40AF' : '#1D4ED8',
    secondary: theme.colors.secondary,
    secondaryLight: isDarkMode ? '#6EE7B7' : '#A7F3D0',
    accent: isDarkMode ? '#F472B6' : '#EC4899',
    error: theme.colors.error,
    success: theme.colors.success,
    warning: theme.colors.warning,
    info: theme.colors.info,
    text: isDarkMode ? '#F9FAFB' : '#1F2937',
    textSecondary: isDarkMode ? '#D1D5DB' : '#4B5563',
    textTertiary: isDarkMode ? '#9CA3AF' : '#6B7280',
    border: isDarkMode ? '#374151' : '#E5E7EB',
    borderLight: isDarkMode ? '#2D3748' : '#F3F4F6',
    card: theme.colors.surface,
    cardElevated: isDarkMode ? '#2D3748' : '#FFFFFF',
    icon: isDarkMode ? '#D1D5DB' : '#6B7280',
    placeholder: isDarkMode ? '#6B7280' : '#9CA3AF',
    shadow: isDarkMode ? '#000000' : '#000000',
    overlay: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
    gradient: {
      primary: isDarkMode ? ['#1E40AF', '#3B82F6'] : ['#2563EB', '#60A5FA'],
      success: isDarkMode ? ['#065F46', '#34D399'] : ['#059669', '#10B981'],
      error: isDarkMode ? ['#991B1B', '#F87171'] : ['#DC2626', '#EF4444'],
      warning: isDarkMode ? ['#92400E', '#FBBF24'] : ['#D97706', '#F59E0B'],
      neutral: isDarkMode ? ['#1F2937', '#374151'] : ['#F9FAFB', '#F3F4F6'],
    },
  };

  // Spacing system
  const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };

  // Border radius system
  const roundness = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  };

  // Elevation system
  const elevation = {
    none: 0,
    xs: 1,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDarkMode,
        setThemeMode: updateThemeMode,
        theme,
        colors,
        spacing,
        roundness,
        elevation,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};