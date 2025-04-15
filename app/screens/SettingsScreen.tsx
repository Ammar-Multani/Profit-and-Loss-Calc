import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { Text, IconButton, useTheme, Dialog, Portal, RadioButton, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { resetSettings, clearCalculationHistory, getSettings, saveSettings } from '../utils/storage';
import { useTheme as useAppTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useAppTheme();
  const navigation = useNavigation();
  
  const [appearanceDialogVisible, setAppearanceDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [calculatorDialogVisible, setCalculatorDialogVisible] = useState(false);
  
  const [language, setLanguage] = useState('english');
  const [calculatorMode, setCalculatorMode] = useState('standard');
  
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('language');
        if (savedLanguage) setLanguage(savedLanguage);
        
        const savedCalculatorMode = await AsyncStorage.getItem('calculatorMode');
        if (savedCalculatorMode) setCalculatorMode(savedCalculatorMode);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  const saveLanguage = async (value) => {
    setLanguage(value);
    try {
      await AsyncStorage.setItem('language', value);
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  };
  
  const saveCalculatorMode = async (value) => {
    setCalculatorMode(value);
    try {
      await AsyncStorage.setItem('calculatorMode', value);
    } catch (error) {
      console.error('Failed to save calculator mode setting:', error);
    }
  };
  
  const handleThemeChange = (value) => {
    setThemeMode(value);
    setAppearanceDialogVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleLanguageChange = (value) => {
    saveLanguage(value);
    setLanguageDialogVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleCalculatorModeChange = (value) => {
    saveCalculatorMode(value);
    setCalculatorDialogVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleResetSettings = async () => {
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
          onPress: async () => {
            await resetSettings();
            setThemeMode('system');
            saveLanguage('english');
            saveCalculatorMode('standard');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Settings Reset', 'All settings have been reset to default values.');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all calculation history? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          onPress: async () => {
            await clearCalculationHistory();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('History Cleared', 'All calculation history has been cleared.');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing Forex Pip Calculator app!',
        url: 'https://example.com/app',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to share the app.');
    }
  };
  
  const handleRateApp = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.example.app');
    Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Light);
  };
  
  const handleOpenLink = (url) => {
    Linking.openURL(url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Light);
  };
  
  const handleSubmitBugReport = () => {
    Linking.openURL('mailto:support@example.com?subject=Bug%20Report');
    Haptics.notificationAsync(Haptics.NotificationFeedbackStyle.Light);
  };
  
  const renderSettingItem = (icon, title, onPress, showChevron = true) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIconContainer}>
          <IconButton icon={icon} size={20} style={styles.settingIcon} />
        </View>
        <Text style={styles.settingItemText}>{title}</Text>
      </View>
      {showChevron && <IconButton icon="chevron-right" size={24} />}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>APPLICATION SETTINGS</Text>
          
          {renderSettingItem('palette', 'Appearance', () => setAppearanceDialogVisible(true))}
          {renderSettingItem('translate', 'Language', () => setLanguageDialogVisible(true))}
          {renderSettingItem('calculator', 'Calculator', () => setCalculatorDialogVisible(true))}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          
          {renderSettingItem('file-document-outline', 'Terms of service', () => 
            handleOpenLink('https://example.com/terms'))}
          {renderSettingItem('alert-circle-outline', 'Disclaimer', () => 
            handleOpenLink('https://example.com/disclaimer'))}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          
          {renderSettingItem('shield-account', 'Privacy policy', () => 
            handleOpenLink('https://example.com/privacy'))}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>FOREX PIP CALCULATOR</Text>
          
          {renderSettingItem('book-open-variant', 'Manual', () => 
            handleOpenLink('https://example.com/manual'))}
          {renderSettingItem('share-variant', 'Share this app', handleShareApp, false)}
          {renderSettingItem('thumb-up', 'Rate us', handleRateApp, false)}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>CUSTOMER SERVICE</Text>
          
          {renderSettingItem('help-circle-outline', 'Help & Support', () => 
            handleOpenLink('https://example.com/support'))}
          {renderSettingItem('bug', 'Submit a bug report', handleSubmitBugReport)}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>FOLLOW US</Text>
          
          {renderSettingItem('home', 'Website', () => 
            handleOpenLink('https://example.com'))}
          {renderSettingItem('twitter', 'X', () => 
            handleOpenLink('https://twitter.com/example'))}
          {renderSettingItem('facebook', 'Facebook', () => 
            handleOpenLink('https://facebook.com/example'))}
        </View>
        
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={handleClearHistory}
        >
          <Text style={styles.resetButtonText}>Erase all content and settings</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Copyright 2025 Tyrcord, Inc. All rights reserved.</Text>
          <Text style={styles.footerText}>Version 3.22.5 (317009)</Text>
        </View>
      </ScrollView>
      
      <Portal>
        <Dialog visible={appearanceDialogVisible} onDismiss={() => setAppearanceDialogVisible(false)}>
          <Dialog.Title>Appearance</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleThemeChange} value={themeMode}>
              <RadioButton.Item label="Light" value="light" />
              <RadioButton.Item label="Dark" value="dark" />
              <RadioButton.Item label="System" value="system" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setAppearanceDialogVisible(false)}>
              <Text style={styles.dialogButton}>Cancel</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <Portal>
        <Dialog visible={languageDialogVisible} onDismiss={() => setLanguageDialogVisible(false)}>
          <Dialog.Title>Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleLanguageChange} value={language}>
              <RadioButton.Item label="English" value="english" />
              <RadioButton.Item label="Spanish" value="spanish" />
              <RadioButton.Item label="French" value="french" />
              <RadioButton.Item label="German" value="german" />
              <RadioButton.Item label="Chinese" value="chinese" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setLanguageDialogVisible(false)}>
              <Text style={styles.dialogButton}>Cancel</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <Portal>
        <Dialog visible={calculatorDialogVisible} onDismiss={() => setCalculatorDialogVisible(false)}>
          <Dialog.Title>Calculator Mode</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleCalculatorModeChange} value={calculatorMode}>
              <RadioButton.Item label="Standard" value="standard" />
              <RadioButton.Item label="Advanced" value="advanced" />
              <RadioButton.Item label="Professional" value="professional" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setCalculatorDialogVisible(false)}>
              <Text style={styles.dialogButton}>Cancel</Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconContainer: {
    backgroundColor: '#EEF3FF',
    borderRadius: 20,
    marginRight: 12,
  },
  settingIcon: {
    margin: 0,
  },
  settingItemText: {
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#F44336',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },
  dialogButton: {
    color: '#5B7FFF',
    fontSize: 16,
    fontWeight: '500',
    padding: 8,
  },
});
