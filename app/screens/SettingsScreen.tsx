import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Share } from 'react-native';
import { Text, IconButton, Dialog, Portal, RadioButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated } from 'react-native';
import { BlurView } from 'expo-blur';

import { resetSettings, clearCalculationHistory, getSettings, saveSettings } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, isDarkMode, spacing, roundness } = useTheme();
  const navigation = useNavigation();
  
  const [appearanceDialogVisible, setAppearanceDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [calculatorDialogVisible, setCalculatorDialogVisible] = useState(false);
  
  const [language, setLanguage] = useState('english');
  const [calculatorMode, setCalculatorMode] = useState('standard');
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateXAnim = React.useRef(new Animated.Value(-10)).current;
  
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
  
  const renderSettingItem = (icon, title, onPress, showChevron = true, index = 0, total = 1) => {
    const itemFadeAnim = React.useRef(new Animated.Value(0)).current;
    const itemTranslateYAnim = React.useRef(new Animated.Value(10)).current;
    
    React.useEffect(() => {
      Animated.timing(itemFadeAnim, {
        toValue: 1,
        duration: 400,
        delay: 100 + (index * 50),
        useNativeDriver: true,
      }).start();
      
      Animated.timing(itemTranslateYAnim, {
        toValue: 0,
        duration: 400,
        delay: 100 + (index * 50),
        useNativeDriver: true,
      }).start();
    }, [itemFadeAnim, itemTranslateYAnim]);
    
    return (
      <Animated.View
        style={{
          opacity: itemFadeAnim,
          transform: [{ translateY: itemTranslateYAnim }],
        }}
      >
        <TouchableOpacity 
          style={[
            styles.settingItem, 
            { 
              borderBottomColor: colors.borderLight,
              borderBottomWidth: index < total - 1 ? 1 : 0,
              backgroundColor: colors.surface,
            }
          ]} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.settingItemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
              <IconButton icon={icon} size={20} iconColor={colors.primary} />
            </View>
            <Text style={[styles.settingItemText, { color: colors.text }]}>{title}</Text>
          </View>
          {showChevron && (
            <IconButton 
              icon="chevron-right" 
              size={20} 
              iconColor={colors.textTertiary} 
              style={styles.chevronIcon}
            />
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const renderSection = (title, items) => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <Card elevation="sm">
        <View style={styles.sectionContent}>
          {items.map((item, index) => 
            renderSettingItem(
              item.icon, 
              item.title, 
              item.onPress, 
              item.showChevron !== false, 
              index, 
              items.length
            )
          )}
        </View>
      </Card>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim }],
          }}
        >
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={colors.primary}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={styles.backButton}
          />
        </Animated.View>
        
        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        </Animated.View>
        
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {renderSection('APPEARANCE & LANGUAGE', [
          { icon: 'palette', title: 'Appearance', onPress: () => setAppearanceDialogVisible(true) },
          { icon: 'translate', title: 'Language', onPress: () => setLanguageDialogVisible(true) },
          { icon: 'calculator', title: 'Calculator Mode', onPress: () => setCalculatorDialogVisible(true) },
        ])}
        
        {renderSection('LEGAL', [
          { icon: 'file-document-outline', title: 'Terms of Service', onPress: () => handleOpenLink('https://example.com/terms') },
          { icon: 'alert-circle-outline', title: 'Disclaimer', onPress: () => handleOpenLink('https://example.com/disclaimer') },
        ])}
        
        {renderSection('PRIVACY', [
          { icon: 'shield-account', title: 'Privacy Policy', onPress: () => handleOpenLink('https://example.com/privacy') },
        ])}
        
        {renderSection('PROFIT AND LOSS CALCULATOR', [
          { icon: 'book-open-variant', title: 'User Manual', onPress: () => handleOpenLink('https://example.com/manual') },
          { icon: 'share-variant', title: 'Share this App', onPress: handleShareApp, showChevron: false },
          { icon: 'thumb-up', title: 'Rate Us', onPress: handleRateApp, showChevron: false },
        ])}
        
        {renderSection('CUSTOMER SERVICE', [
          { icon: 'help-circle-outline', title: 'Help & Support', onPress: () => handleOpenLink('https://example.com/support') },
          { icon: 'bug', title: 'Submit a Bug Report', onPress: handleSubmitBugReport },
        ])}
        
        {renderSection('FOLLOW US', [
          { icon: 'web', title: 'Website', onPress: () => handleOpenLink('https://example.com') },
          { icon: 'twitter', title: 'X', onPress: () => handleOpenLink('https://twitter.com/example') },
          { icon: 'facebook', title: 'Facebook', onPress: () => handleOpenLink('https://facebook.com/example') },
        ])}
        
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: 0.95 + (fadeAnim.__getValue() * 0.05) }],
            marginTop: 16,
            marginBottom: 24,
          }}
        >
          <Card elevation="sm">
            <View style={styles.dangerZoneContent}>
              <Text style={[styles.dangerZoneTitle, { color: colors.error }]}>
                Danger Zone
              </Text>
              <Text style={[styles.dangerZoneDescription, { color: colors.textSecondary }]}>
                These actions are irreversible. Please proceed with caution.
              </Text>
              <View style={styles.dangerZoneButtons}>
                <Button
                  title="Reset Settings"
                  onPress={handleResetSettings}
                  variant="outlined"
                  color="error"
                  style={styles.dangerButton}
                />
                <Button
                  title="Erase All Content"
                  onPress={handleClearHistory}
                  variant="filled"
                  color="error"
                  style={styles.dangerButton}
                />
              </View>
            </View>
          </Card>
        </Animated.View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Copyright 2025 Tyrcord, Inc. All rights reserved.
          </Text>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Version 3.22.5 (317009)
          </Text>
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
                color={colors.primary}
              />
              <RadioButton.Item 
                label="Dark" 
                value="dark" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
              <RadioButton.Item 
                label="System" 
                value="system" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              onPress={() => setAppearanceDialogVisible(false)}
              variant="text"
              color="primary"
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <Portal>
        <Dialog 
          visible={languageDialogVisible} 
          onDismiss={() => setLanguageDialogVisible(false)}
          style={{ backgroundColor: colors.surface }}
        >
          <Dialog.Title style={{ color: colors.text }}>Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleLanguageChange} value={language}>
              <RadioButton.Item 
                label="English" 
                value="english" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
              <RadioButton.Item 
                label="Spanish" 
                value="spanish" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
              <RadioButton.Item 
                label="French" 
                value="french" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
              <RadioButton.Item 
                label="German" 
                value="german" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
              <RadioButton.Item 
                label="Chinese" 
                value="chinese" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              onPress={() => setLanguageDialogVisible(false)}
              variant="text"
              color="primary"
            />
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      <Portal>
        <Dialog 
          visible={calculatorDialogVisible} 
          onDismiss={() => setCalculatorDialogVisible(false)}
          style={{ backgroundColor: colors.surface }}
        >
          <Dialog.Title style={{ color: colors.text }}>Calculator Mode</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleCalculatorModeChange} value={calculatorMode}>
              <RadioButton.Item 
                label="Standard" 
                value="standard" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
              <RadioButton.Item 
                label="Advanced" 
                value="advanced" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
              <RadioButton.Item 
                label="Professional" 
                value="professional" 
                labelStyle={{ color: colors.text }}
                color={colors.primary}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              title="Cancel"
              onPress={() => setCalculatorDialogVisible(false)}
              variant="text"
              color="primary"
            />
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  backButton: {
    margin: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 8,
    marginRight: 16,
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevronIcon: {
    margin: 0,
  },
  dangerZone: {
    marginTop: 16,
    marginBottom: 24,
  },
  dangerZoneContent: {
    padding: 16,
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dangerZoneDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  dangerZoneButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dangerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
  },
});
