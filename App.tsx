import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";

import HomeScreen from "./app/screens/HomeScreen";
import SettingsScreen from "./app/screens/SettingsScreen";
import HistoryScreen from "./app/screens/HistoryScreen";
import { ThemeProvider, useTheme } from "./app/context/ThemeContext";

const Stack = createNativeStackNavigator();

function AppContent() {
  const { theme, isDarkMode } = useTheme();

  // Create a combined theme for NavigationContainer
  const navigationTheme = {
    ...(isDarkMode ? NavigationDarkTheme : NavigationDefaultTheme),
    colors: {
      ...(isDarkMode
        ? NavigationDarkTheme.colors
        : NavigationDefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: isDarkMode ? "#FFFFFF" : "#212121",
      border: isDarkMode ? "#444444" : "#E0E0E0",
      notification: isDarkMode ? "#90CAF9" : "#2196F3",
    },
  };

  // Apply expo-navigation-bar settings when theme changes
  useEffect(() => {
    const updateNavigationBar = async () => {
      if (Platform.OS === "android") {
        // Set navigation bar color
        await NavigationBar.setBackgroundColorAsync(
          isDarkMode ? "#121212" : "#FFFFFF"
        );

        // Set navigation bar button colors
        await NavigationBar.setButtonStyleAsync(isDarkMode ? "light" : "dark");
      }
    };

    updateNavigationBar();
  }, [isDarkMode]);

  return (
    <SafeAreaProvider>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        translucent={true}
        backgroundColor="transparent"
      />
      <PaperProvider theme={theme}>
        <NavigationContainer theme={navigationTheme}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

registerRootComponent(App);
