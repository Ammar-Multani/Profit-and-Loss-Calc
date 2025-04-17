import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Share,
} from "react-native";
import {
  Text,
  IconButton,
  Dialog,
  Portal,
  RadioButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

import {
  resetSettings,
  clearCalculationHistory,
  getSettings,
  saveSettings,
} from "../utils/storage";
import { useTheme } from "../context/ThemeContext";

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode, isDarkMode } = useTheme();
  const navigation = useNavigation();

  const [appearanceDialogVisible, setAppearanceDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [calculatorDialogVisible, setCalculatorDialogVisible] = useState(false);

  const [language, setLanguage] = useState("english");
  const [calculatorMode, setCalculatorMode] = useState("standard");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem("language");
        if (savedLanguage) setLanguage(savedLanguage);

        const savedCalculatorMode = await AsyncStorage.getItem(
          "calculatorMode"
        );
        if (savedCalculatorMode) setCalculatorMode(savedCalculatorMode);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  const saveLanguage = async (value) => {
    setLanguage(value);
    try {
      await AsyncStorage.setItem("language", value);
    } catch (error) {
      console.error("Failed to save language setting:", error);
    }
  };

  const saveCalculatorMode = async (value) => {
    setCalculatorMode(value);
    try {
      await AsyncStorage.setItem("calculatorMode", value);
    } catch (error) {
      console.error("Failed to save calculator mode setting:", error);
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
      "Reset Settings",
      "Are you sure you want to reset all settings to default values?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            await resetSettings();
            setThemeMode("system");
            saveLanguage("english");
            saveCalculatorMode("standard");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              "Settings Reset",
              "All settings have been reset to default values."
            );
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleClearHistory = async () => {
    Alert.alert(
      "Erase All Content",
      "Are you sure you want to erase all content and settings? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Erase",
          onPress: async () => {
            await clearCalculationHistory();
            await resetSettings();
            setThemeMode("system");
            saveLanguage("english");
            saveCalculatorMode("standard");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              "Content Erased",
              "All content and settings have been erased."
            );
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: "Check out this amazing Profit & Loss Calculator app!",
        url: "https://example.com/app",
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Error", "Failed to share the app.");
    }
  };

  const handleRateApp = () => {
    Linking.openURL(
      "https://play.google.com/store/apps/details?id=com.example.app"
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleOpenLink = (url) => {
    Linking.openURL(url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSubmitBugReport = () => {
    Linking.openURL("mailto:support@example.com?subject=Bug%20Report");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderSettingItem = (icon, title, onPress, showChevron = true) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          borderBottomColor: isDarkMode
            ? "rgba(80, 80, 80, 0.5)"
            : "rgba(220, 220, 220, 0.8)",
          borderBottomWidth: 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <IconButton
          icon={icon}
          size={24}
          iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
        />
        <Text
          style={[
            styles.settingItemText,
            { color: isDarkMode ? "#FFFFFF" : "#212121" },
          ]}
        >
          {title}
        </Text>
      </View>
      {showChevron && (
        <IconButton
          icon="chevron-right"
          size={24}
          iconColor={isDarkMode ? "#AAAAAA" : "#757575"}
        />
      )}
    </TouchableOpacity>
  );

  const renderSection = (title, children) => (
    <>
      <Text
        style={[
          styles.sectionTitle,
          { color: isDarkMode ? "#AAAAAA" : "#757575" },
        ]}
      >
        {title}
      </Text>
      <View
        style={[
          styles.section,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "white",
            borderColor: isDarkMode
              ? "rgba(80, 80, 80, 0.5)"
              : "rgba(220, 220, 220, 0.8)",
            borderWidth: 1,
            borderRadius: 20,
            marginBottom: 16,
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={
            isDarkMode
              ? ["rgba(40, 40, 40, 0.7)", "rgba(30, 30, 30, 0.5)"]
              : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 255, 0.85)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionGradient}
        >
          {children}
        </LinearGradient>
      </View>
    </>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#F8F9FA" },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: isDarkMode ? "#1A1A1A" : "#FFFFFF",
            borderBottomColor: isDarkMode
              ? "rgba(75, 75, 75, 0.3)"
              : "rgba(230, 230, 230, 0.8)",
            borderBottomWidth: 1,
          },
        ]}
      >
        <LinearGradient
          colors={
            isDarkMode
              ? ["rgba(40, 40, 40, 0.8)", "rgba(30, 30, 30, 0.8)"]
              : ["rgba(255, 255, 255, 1)", "rgba(250, 250, 250, 0.95)"]
          }
          style={styles.headerGradient}
        >
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
          <View style={styles.headerTitleContainer}>
            <Text
              style={[
                styles.headerTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              SETTINGS
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderSection(
          "APPEARANCE",
          <>
            {renderSettingItem("palette", "Appearance", () =>
              setAppearanceDialogVisible(true)
            )}
            {/* {renderSettingItem("translate", "Language", () =>
              setLanguageDialogVisible(true)
            )}
            {renderSettingItem("calculator", "Calculator", () =>
              setCalculatorDialogVisible(true)
            )} */}
          </>
        )}

        {renderSection(
          "LEGAL",
          <>
            {renderSettingItem(
              "file-document-outline",
              "Terms of service",
              () => handleOpenLink("https://example.com/terms")
            )}
            {renderSettingItem("alert-circle-outline", "Disclaimer", () =>
              handleOpenLink("https://example.com/disclaimer")
            )}
          </>
        )}

        {renderSection(
          "PRIVACY",
          <>
            {renderSettingItem("shield-account", "Privacy policy", () =>
              handleOpenLink("https://example.com/privacy")
            )}
          </>
        )}

        {renderSection(
          "PROFIT AND LOSS CALCULATOR",
          <>
            {renderSettingItem("book-open-variant", "Manual", () =>
              handleOpenLink("https://example.com/manual")
            )}
            {renderSettingItem(
              "share-variant",
              "Share this app",
              handleShareApp,
              false
            )}
            {renderSettingItem("thumb-up", "Rate us", handleRateApp, false)}
          </>
        )}

        {renderSection(
          "CUSTOMER SERVICE",
          <>{renderSettingItem("bug", "Report a bug", handleSubmitBugReport)}</>
        )}

        <View style={styles.dangerSection}>
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(40, 40, 40, 0.7)", "rgba(30, 30, 30, 0.5)"]
                : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 255, 0.85)"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.dangerSectionGradient,
              {
                borderColor: isDarkMode
                  ? "rgba(75, 75, 75, 0.2)"
                  : "rgba(230, 230, 230, 0.8)",
                borderWidth: 1,
                borderRadius: 20,
              },
            ]}
          >
            {/* <TouchableOpacity
              style={[
                styles.dangerButton,
                {
                  borderBottomColor: isDarkMode
                    ? "rgba(80, 80, 80, 0.5)"
                    : "rgba(220, 220, 220, 0.8)",
                  borderBottomWidth: 1,
                },
              ]}
              onPress={handleResetSettings}
            >
              <View style={styles.dangerButtonContent}>
                <IconButton icon="refresh" size={24} iconColor="#F44336" />
                <Text style={[styles.dangerButtonText, { color: "#F44336" }]}>
                  Reset Settings
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                size={24}
                iconColor={isDarkMode ? "#AAAAAA" : "#757575"}
              />
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearHistory}
            >
              <View style={styles.dangerButtonContent}>
                <IconButton icon="delete" size={24} iconColor="#F44336" />
                <Text style={[styles.dangerButtonText, { color: "#F44336" }]}>
                  Erase All Content
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                size={24}
                iconColor={isDarkMode ? "#AAAAAA" : "#757575"}
              />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.footer}>
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(40, 40, 40, 0.5)", "rgba(30, 30, 30, 0.3)"]
                : ["rgba(247, 247, 247, 0.5)", "rgba(255, 255, 255, 0.3)"]
            }
            style={[
              styles.versionContainer,
              {
                borderColor: isDarkMode
                  ? "rgba(75, 75, 75, 0.2)"
                  : "rgba(230, 230, 230, 0.8)",
                borderWidth: 1,
                borderRadius: 16,
              },
            ]}
          >
            <Text
              style={[
                styles.footerText,
                { color: isDarkMode ? "#AAAAAA" : "#9E9E9E" },
              ]}
            >
              Version 1.0.0
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>

      <Portal>
        <Dialog
          visible={appearanceDialogVisible}
          onDismiss={() => setAppearanceDialogVisible(false)}
          style={{ backgroundColor: isDarkMode ? "#1E1E1E" : colors.surface }}
        >
          <Dialog.Title style={{ color: isDarkMode ? "#FFFFFF" : colors.text }}>
            Appearance
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleThemeChange}
              value={themeMode}
            >
              <RadioButton.Item
                label="Light"
                value="light"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="Dark"
                value="dark"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="System"
                value="system"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setAppearanceDialogVisible(false)}>
              <Text
                style={[
                  styles.dialogButton,
                  { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={languageDialogVisible}
          onDismiss={() => setLanguageDialogVisible(false)}
          style={{ backgroundColor: isDarkMode ? "#1E1E1E" : colors.surface }}
        >
          <Dialog.Title style={{ color: isDarkMode ? "#FFFFFF" : colors.text }}>
            Language
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleLanguageChange}
              value={language}
            >
              <RadioButton.Item
                label="English"
                value="english"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="Spanish"
                value="spanish"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="French"
                value="french"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="German"
                value="german"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="Chinese"
                value="chinese"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setLanguageDialogVisible(false)}>
              <Text
                style={[
                  styles.dialogButton,
                  { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={calculatorDialogVisible}
          onDismiss={() => setCalculatorDialogVisible(false)}
          style={{ backgroundColor: isDarkMode ? "#1E1E1E" : colors.surface }}
        >
          <Dialog.Title style={{ color: isDarkMode ? "#FFFFFF" : colors.text }}>
            Calculator Mode
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleCalculatorModeChange}
              value={calculatorMode}
            >
              <RadioButton.Item
                label="Standard"
                value="standard"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="Advanced"
                value="advanced"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
              <RadioButton.Item
                label="Professional"
                value="professional"
                labelStyle={{ color: isDarkMode ? "#FFFFFF" : colors.text }}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <TouchableOpacity onPress={() => setCalculatorDialogVisible(false)}>
              <Text
                style={[
                  styles.dialogButton,
                  { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    height: 100,
    paddingBottom: 16,
    borderBottomWidth: 1,
    elevation: 3,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  backButton: {
    margin: 0,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionGradient: {
    borderRadius: 20,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingItemText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  dangerSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  dangerSectionGradient: {
    overflow: "hidden",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  dangerButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginBottom: 30,
  },
  versionContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dialogButton: {
    fontSize: 16,
    fontWeight: "500",
    padding: 8,
  },
});
