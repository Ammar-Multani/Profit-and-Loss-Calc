import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import HomeScreen from './app/screens/HomeScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { theme, isDarkMode } = useTheme();
  
  // Create a combined theme for NavigationContainer
  const navigationTheme = {
    ...(isDarkMode ? NavigationDarkTheme : NavigationDefaultTheme),
    colors: {
      ...(isDarkMode ? NavigationDarkTheme.colors : NavigationDefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: isDarkMode ? '#FFFFFF' : '#212121',
      border: isDarkMode ? '#444444' : '#E0E0E0',
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
            }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
