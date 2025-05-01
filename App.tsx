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
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./app/screens/HomeScreen";
import SettingsScreen from "./app/screens/SettingsScreen";
import HistoryScreen from "./app/screens/HistoryScreen";
import CurrencySelectorScreen from "./app/screens/CurrencySelectorScreen";
import OnboardingScreen, {
  ONBOARDING_COMPLETE_KEY,
} from "./app/screens/OnboardingScreen";
import TermsScreen from "./app/screens/TermsScreen";
import DisclaimerScreen from "./app/screens/DisclaimerScreen";
import PrivacyScreen from "./app/screens/PrivacyScreen";
import ManualScreen from "./app/screens/ManualScreen";
import { ThemeProvider, useTheme } from "./app/context/ThemeContext";

const Stack = createNativeStackNavigator();

function AppContent() {
  const { theme, isDarkMode } = useTheme();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<
    boolean | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if onboarding has been completed
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setIsOnboardingComplete(value === "true");
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

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

  // Don't render anything while checking onboarding status
  if (isLoading) {
    return null;
  }

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
            initialRouteName={isOnboardingComplete ? "Home" : "Onboarding"}
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen
              name="CurrencySelector"
              component={CurrencySelectorScreen}
            />
            <Stack.Screen name="Terms" component={TermsScreen} />
            <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Manual" component={ManualScreen} />
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
