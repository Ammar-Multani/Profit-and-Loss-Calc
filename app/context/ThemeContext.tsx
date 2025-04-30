import React, { createContext, useState, useContext, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  theme: typeof MD3LightTheme;
  colors: {
    background: string;
    surface: string;
    surfaceVariant: string;
    primary: string;
    secondary: string;
    error: string;
    success: string;
    warning: string;
    text: string;
    textSecondary: string;
    border: string;
    borderLight: string;
    card: string;
    icon: string;
    placeholder: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define custom light theme
const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2196F3",
    primaryContainer: "#E3F2FD",
    secondary: "#4CAF50",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    error: "#F44336",
    onSurface: "#212121",
    onBackground: "#212121",
    onPrimary: "#FFFFFF",
    success: "#4CAF50",
    warning: "#FFC107",
  },
};

// Define custom dark theme
const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#90CAF9",
    primaryContainer: "#0D47A1",
    secondary: "#81C784",
    background: "#121212",
    surface: "#1E1E1E",
    error: "#EF9A9A",
    onSurface: "#FFFFFF",
    onBackground: "#FFFFFF",
    onPrimary: "#000000",
    success: "#81C784",
    warning: "#FFD54F",
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isReady, setIsReady] = useState(false);

  // This ensures isDarkMode reflects system theme immediately, even before preferences load
  const calculatedIsDarkMode =
    themeMode === "dark" ||
    (themeMode === "system" && systemColorScheme === "dark");

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("themeMode");
        if (savedTheme) {
          setThemeMode(savedTheme as ThemeMode);
        }
        setIsReady(true);
      } catch (error) {
        console.error("Failed to load theme preference:", error);
        setIsReady(true);
      }
    };

    loadThemePreference();
  }, []);

  // Add effect to update theme if system theme changes
  useEffect(() => {
    if (themeMode === "system") {
      // Force update when system theme changes while app is running
      // This creates a new context value that will propagate to consumers
      updateThemeMode("system");
    }
  }, [systemColorScheme]);

  const updateThemeMode = async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem("themeMode", mode);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const isDarkMode = calculatedIsDarkMode;
  const theme = isDarkMode ? CustomDarkTheme : CustomLightTheme;

  // Extended colors for easier access in components
  const colors = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    surfaceVariant: isDarkMode ? "#2C2C2C" : "#F0F0F0",
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    error: theme.colors.error,
    success: theme.colors.success,
    warning: theme.colors.warning,
    text: isDarkMode ? "#FFFFFF" : "#212121",
    textSecondary: isDarkMode ? "#BBBBBB" : "#757575",
    border: isDarkMode ? "#444444" : "#E0E0E0",
    borderLight: isDarkMode ? "#333333" : "#F0F0F0",
    card: theme.colors.surface,
    icon: isDarkMode ? "#BBBBBB" : "#757575",
    placeholder: isDarkMode ? "#777777" : "#9E9E9E",
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDarkMode,
        setThemeMode: updateThemeMode,
        theme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
