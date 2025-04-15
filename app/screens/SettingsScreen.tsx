import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { Text, IconButton, Dialog, Portal, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { resetSettings, clearCalculationHistory, getSettings, saveSettings } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode } = useTheme();
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
      'Erase All Content',
      'Are you sure you want to erase all content and settings? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Erase',
          onPress: async () => {
            await clearCalculationHistory();
            await resetSettings();
            setThemeMode('system');
            saveLanguage('english');
            saveCalculatorMode('standard');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Content Erased', 'All content and settings have been erased.');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this amazing Profit & Loss Calculator app!',
        url: 'https://example.com/app',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to share the app.');
    }
  };
  
  const handleRateApp = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.example.app');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleOpenLink = (url) => {
    Linking.openURL(url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const handleSubmitBugReport = () => {
    Linking.openURL('mailto:support@example.com?subject=Bug%20Report');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const renderSettingItem = (icon, title, onPress, showChevron = true) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.borderLight }]} 
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <IconButton icon={icon} size={24} iconColor={colors.icon} />
        <Text style={[styles.settingItemText, { color: colors.text }]}>{title}</Text>
      </View>
      {showChevron && <IconButton icon="chevron-right" size={24} iconColor={colors.placeholder} />}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { 
        backgroundColor: colors.surface, 
        borderBottomColor: colors.border 
      }]}>
        <IconButton
          icon="close"
          size={24}
          iconColor={colors.icon}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.headerTitle, { color: colors.textSecondary }]}>APPLICATION SETTINGS</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE & LANGUAGE</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          {renderSettingItem('palette', 'Appearance', () => setAppearanceDialogVisible(true))}
          {renderSettingItem('translate', 'Language', () => setLanguageDialogVisible(true))}
          {renderSettingItem('calculator', 'Calculator', () => setCalculatorDialogVisible(true))}
        </View>
        
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <View style={styles.section}>
          {renderSettingItem('file-document-outline', 'Terms of service', () => 
            handleOpenLink('https://example.com/terms'))}
          {renderSettingItem('alert-circle-outline', 'Disclaimer', () => 
            handleOpenLink('https://example.com/disclaimer'))}
        </View>
        
        <Text style={styles.sectionTitle}>PRIVACY</Text>
        <View style={styles.section}>
          {renderSettingItem('shield-account', 'Privacy policy', () => 
            handleOpenLink('https://example.com/privacy'))}
        </View>
        
        <Text style={styles.sectionTitle}>PROFIT AND LOSS CALCULATOR</Text>
        <View style={styles.section}>
          {renderSettingItem('book-open-variant', 'Manual', () => 
            handleOpenLink('https://example.com/manual'))}
          {renderSettingItem('share-variant', 'Share this app', handleShareApp, false)}
          {renderSettingItem('thumb-up', 'Rate us', handleRateApp, false)}
        </View>
        
        <Text style={styles.sectionTitle}>CUSTOMER SERVICE</Text>
        <View style={styles.section}>
          {renderSettingItem('help-circle-outline', 'Help & Support', () => 
            handleOpenLink('https://example.com/support'))}
          {renderSettingItem('bug', 'Submit a bug report', handleSubmitBugReport)}
        </View>
        
        <Text style={styles.sectionTitle}>FOLLOW US</Text>
        <View style={styles.section}>
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
          <Text style={[styles.resetButtonText, { color: colors.error }]}>Erase all content and settings</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.placeholder }]}>Copyright 2025 Tyrcord, Inc. All rights reserved.</Text>
          <Text style={[styles.footerText, { color: colors.placeholder }]}>Version 3.22.5 (317009)</Text>
        </View>
      </ScrollView>
      
      <Portal>
        <Dialog 
          visible={appearanceDialogVisible} 
          onDismiss={() => setAppearanceDialogVisible(false)}
          style={{ backgroundColor: colors.surface }}
        >
          <Dialog.Title style={{ color: colors.text }}>Appearance</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleThemeChange} value={themeMode}>
              <RadioButton.Item 
                label="Light" 
                value="light" 
                labelStyle={{ color: colors.text }}
              />
              <RadioButton.Item 
                label="Dark" 
                value="dark" 
                labelStyle={{ color: colors.text }}
              />
              <RadioButton.Item 
                label="System" 
                value="system" 
                labelStyle={{ color: colors.text }}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setAppearanceDialogVisible(false)}>
              <Text style={[styles.dialogButton, { color: colors.primary }]}>Cancel</Text>
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
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 16,
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
  settingItemText: {
    fontSize: 16,
    color: '#212121',
    marginLeft: 8,
  },
  resetButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 24,
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
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
    padding: 8,
  },
});
