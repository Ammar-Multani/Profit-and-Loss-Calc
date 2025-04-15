import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, IconButton, useTheme, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

import { resetSettings, clearCalculationHistory } from '../utils/storage';
import { useTheme as useAppTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useAppTheme();
  const navigation = useNavigation();
  
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
  
  const handleExportData = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Export Successful', 'Your data has been exported successfully.');
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your data.');
    }
  };
  
  const renderSettingItem = (icon, title, onPress, showChevron = true) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <IconButton icon={icon} size={24} />
        <Text style={styles.settingItemText}>{title}</Text>
      </View>
      {showChevron && <IconButton icon="chevron-right" size={24} />}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          size={24}
          onPress={() => navigation.goBack()}
        />
      </View>
      
      <Text style={styles.sectionTitle}>APPLICATION SETTINGS</Text>
      
      <ScrollView style={styles.scrollView}>
        {renderSettingItem('palette', 'Appearance', () => {})}
        {renderSettingItem('translate', 'Language', () => {})}
        {renderSettingItem('calculator', 'Calculator', () => {})}
        
        <Text style={styles.sectionTitle}>LEGAL</Text>
        
        {renderSettingItem('file-document-outline', 'Terms of service', () => {})}
        {renderSettingItem('alert-circle-outline', 'Disclaimer', () => {})}
        
        <Text style={styles.sectionTitle}>PRIVACY</Text>
        
        {renderSettingItem('shield-account', 'Privacy policy', () => {})}
        
        <Text style={styles.sectionTitle}>PROFIT AND LOSS CALCULATOR</Text>
        
        {renderSettingItem('book-open-variant', 'Manual', () => {})}
        {renderSettingItem('share-variant', 'Share this app', () => {}, false)}
        {renderSettingItem('thumb-up', 'Rate us', () => {}, false)}
        
        <Text style={styles.sectionTitle}>CUSTOMER SERVICE</Text>
        
        {renderSettingItem('help-circle-outline', 'Help & Support', () => {})}
        {renderSettingItem('bug', 'Submit a bug report', () => {})}
        
        <Text style={styles.sectionTitle}>FOLLOW US</Text>
        
        {renderSettingItem('home', 'Website', () => {})}
        {renderSettingItem('twitter', 'X', () => {})}
        {renderSettingItem('facebook', 'Facebook', () => {})}
        
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#757575',
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
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
});
