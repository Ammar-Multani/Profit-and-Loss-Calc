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
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define custom light theme
const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
    primaryContainer: '#E3F2FD',
    secondary: '#4CAF50',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    error: '#F44336',
    onSurface: '#212121',
    onBackground: '#212121',
    onPrimary: '#FFFFFF',
  },
};

// Define custom dark theme
const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    primaryContainer: '#0D47A1',
    secondary: '#81C784',
    background: '#121212',
    surface: '#1E1E1E',
    error: '#EF9A9A',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
    onPrimary: '#000000',
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

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDarkMode,
        setThemeMode: updateThemeMode,
        theme,
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
