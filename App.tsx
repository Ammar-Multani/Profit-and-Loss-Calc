import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import { LogBox } from 'react-native';
import { MotiProvider } from 'moti';

import HomeScreen from './app/screens/HomeScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import HistoryScreen from './app/screens/HistoryScreen';
import { ThemeProvider, useTheme } from './app/context/ThemeContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

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
            },
            animation: 'slide_from_right',
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MotiProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <PortalProvider>
              <AppContent />
            </PortalProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </MotiProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);