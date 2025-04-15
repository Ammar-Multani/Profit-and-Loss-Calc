import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Text, 
  Switch, 
  Divider, 
  Button, 
  useTheme as usePaperTheme,
  RadioButton,
  List
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import CalculatorInput from '../components/CalculatorInput';
import { getSettings, saveSettings, resetSettings, getCalculationHistory, DEFAULT_SETTINGS } from '../utils/storage';
import { CalculatorSettings } from '../utils/storage';
import { useTheme as useAppTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const paperTheme = usePaperTheme();
  const { themeMode, setThemeMode } = useAppTheme();
  
  const [settings, setSettings] = useState<CalculatorSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
      setLoading(false);
    };
    
    loadSettings();
  }, []);
  
  const handleSaveSettings = async () => {
    try {
      await saveSettings(settings);
      
      if (settings.enableHapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };
  
  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetSettings();
              
              if (settings.enableHapticFeedback) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              setSettings(DEFAULT_SETTINGS);
              Alert.alert('Success', 'Settings reset to defaults');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          },
        },
      ]
    );
  };
  
  const handleExportHistory = async () => {
    try {
      const history = await getCalculationHistory();
      
      if (history.length === 0) {
        Alert.alert('No Data', 'There is no calculation history to export');
        return;
      }
      
      const historyJson = JSON.stringify(history, null, 2);
      const fileName = `trade_calculator_history_${new Date().toISOString().split('T')[0]}.json`;
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      
      if (isSharingAvailable) {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, historyJson);
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error exporting history:', error);
      Alert.alert('Error', 'Failed to export history');
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: paperTheme.colors.background }]}>
        <Text>Loading settings...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: paperTheme.colors.background }]} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <Card style={styles.card}>
          <Card.Title title="Default Values" titleStyle={styles.cardTitle} />
          <Card.Content>
            <CalculatorInput
              label="Default Commission (%)"
              value={settings.defaultCommission.toString()}
              onChangeText={(text) => 
                setSettings({...settings, defaultCommission: parseFloat(text) || 0})
              }
              keyboardType="decimal-pad"
              suffix="%"
            />
            
            <CalculatorInput
              label="Default Slippage ($)"
              value={settings.defaultSlippage.toString()}
              onChangeText={(text) => 
                setSettings({...settings, defaultSlippage: parseFloat(text) || 0})
              }
              keyboardType="decimal-pad"
              prefix="$"
            />
            
            <CalculatorInput
              label="Default Position Fees ($)"
              value={settings.defaultPositionFees.toString()}
              onChangeText={(text) => 
                setSettings({...settings, defaultPositionFees: parseFloat(text) || 0})
              }
              keyboardType="decimal-pad"
              prefix="$"
            />
            
            <CalculatorInput
              label="Default Tax Rate (%)"
              value={settings.defaultTaxRate.toString()}
              onChangeText={(text) => 
                setSettings({...settings, defaultTaxRate: parseFloat(text) || 0})
              }
              keyboardType="decimal-pad"
              suffix="%"
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Title title="Default Inclusions" titleStyle={styles.cardTitle} />
          <Card.Content>
            <View style={styles.switchRow}>
              <Text>Include Commission by Default</Text>
              <Switch
                value={settings.includeCommissionByDefault}
                onValueChange={(value) => 
                  setSettings({...settings, includeCommissionByDefault: value})
                }
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text>Include Slippage by Default</Text>
              <Switch
                value={settings.includeSlippageByDefault}
                onValueChange={(value) => 
                  setSettings({...settings, includeSlippageByDefault: value})
                }
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text>Include Position Fees by Default</Text>
              <Switch
                value={settings.includePositionFeesByDefault}
                onValueChange={(value) => 
                  setSettings({...settings, includePositionFeesByDefault: value})
                }
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text>Include Tax by Default</Text>
              <Switch
                value={settings.includeTaxByDefault}
                onValueChange={(value) => 
                  setSettings({...settings, includeTaxByDefault: value})
                }
              />
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Title title="Risk Management" titleStyle={styles.cardTitle} />
          <Card.Content>
            <CalculatorInput
              label="Default Risk Percentage (%)"
              value={settings.defaultRiskPercentage.toString()}
              onChangeText={(text) => 
                setSettings({...settings, defaultRiskPercentage: parseFloat(text) || 1})
              }
              keyboardType="decimal-pad"
              suffix="%"
            />
            
            <CalculatorInput
              label="Default Risk/Reward Ratio"
              value={settings.defaultRiskRewardRatio.toString()}
              onChangeText={(text) => 
                setSettings({...settings, defaultRiskRewardRatio: parseFloat(text) || 2})
              }
              keyboardType="decimal-pad"
            />
          </Card.Content>
        </Card>
        
        <Card style={[styles.card, { backgroundColor: paperTheme.colors.surface }]}>
          <Card.Title 
            title="Appearance" 
            titleStyle={[styles.cardTitle, { color: paperTheme.colors.onSurface }]} 
          />
          <Card.Content>
            <List.Section>
              <List.Subheader style={{ color: paperTheme.colors.onSurface }}>Theme</List.Subheader>
              <RadioButton.Group
                onValueChange={(value) => setThemeMode(value as 'light' | 'dark' | 'system')}
                value={themeMode}
              >
                <RadioButton.Item 
                  label="Light" 
                  value="light"
                  labelStyle={{ color: paperTheme.colors.onSurface }}
                />
                <RadioButton.Item 
                  label="Dark" 
                  value="dark"
                  labelStyle={{ color: paperTheme.colors.onSurface }}
                />
                <RadioButton.Item 
                  label="System Default" 
                  value="system"
                  labelStyle={{ color: paperTheme.colors.onSurface }}
                />
              </RadioButton.Group>
            </List.Section>
            
            <Divider style={styles.divider} />
            
            <View style={styles.switchRow}>
              <Text>Enable Haptic Feedback</Text>
              <Switch
                value={settings.enableHapticFeedback}
                onValueChange={(value) => 
                  setSettings({...settings, enableHapticFeedback: value})
                }
              />
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Title title="Data Management" titleStyle={styles.cardTitle} />
          <Card.Content>
            <Button 
              mode="outlined" 
              onPress={handleExportHistory}
              style={styles.dataButton}
              icon="export"
            >
              Export Calculation History
            </Button>
          </Card.Content>
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleSaveSettings}
            style={styles.saveButton}
          >
            Save Settings
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleResetSettings}
            style={styles.resetButton}
          >
            Reset to Defaults
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  saveButton: {
    marginBottom: 16,
  },
  resetButton: {
    marginBottom: 16,
  },
  dataButton: {
    marginVertical: 8,
  },
});
