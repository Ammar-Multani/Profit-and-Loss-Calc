import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme, MD3DarkTheme, adaptNavigationTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import HistoryScreen from './screens/HistoryScreen';
import { ThemeProvider } from './context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  
  const theme = useMemo(() => {
    return colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  }, [colorScheme]);
  
  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: theme,
    reactNavigationDark: theme,
  });
  
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ 
                  title: 'Settings',
                  headerBackTitle: 'Back'
                }}
              />
              <Stack.Screen 
                name="History" 
                component={HistoryScreen}
                options={{ 
                  title: 'Calculation History',
                  headerBackTitle: 'Back'
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}