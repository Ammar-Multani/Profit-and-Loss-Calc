import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";

export default function PrivacyScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#121212" : "#F8F9FA" },
      ]}
      edges={["left", "right"]}
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
            paddingTop: Platform.OS === "ios" ? 0 : 16,
            height: Platform.OS === "ios" ? 60 : 100,
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
              PRIVACY POLICY
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
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: isDarkMode ? "#1E1E1E" : "white",
              borderColor: isDarkMode
                ? "rgba(80, 80, 80, 0.5)"
                : "rgba(220, 220, 220, 0.8)",
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
            style={styles.contentGradient}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              Privacy Policy
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              Your privacy is important to us. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you
              use our Profit & Loss Calculator application.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              1. Information We Collect
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              We collect the following types of information:
              {"\n\n"}• User Settings: We collect and store your app preferences
              such as theme settings, language selection, and currency
              preferences to provide a customized experience.
              {"\n\n"}• Calculation Data: We store your calculation history
              within the app to allow you to review past calculations. This data
              remains on your device and is not transmitted to our servers.
              {"\n\n"}• Device Information: We may collect device information
              such as operating system version and device type to optimize the
              app for your device.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              2. How We Use Your Information
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              We use the information we collect to:
              {"\n\n"}• Provide, maintain, and improve our application
              {"\n\n"}• Save your calculation history for future reference
              {"\n\n"}• Personalize your experience with saved preferences
              {"\n\n"}• Analyze usage patterns to enhance app functionality
              {"\n\n"}• Identify and fix technical issues
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              3. Data Storage and Security
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              All of your calculation data and settings are stored locally on
              your device using secure storage mechanisms. We do not transmit or
              store your personal calculation data on external servers. Your
              data remains private and accessible only through your device.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              4. Information Sharing
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              We do not sell, trade, or otherwise transfer your information to
              outside parties. We may share generic, aggregated demographic
              information not linked to any personal identification information
              with our business partners for the purposes outlined above.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              5. Your Data Rights
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              You have the right to:
              {"\n\n"}• Clear your calculation history through the app settings
              {"\n\n"}• Reset all app preferences to default values
              {"\n\n"}• Uninstall the application, which will remove all app
              data from your device
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              6. Changes to This Privacy Policy
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242", marginBottom: 20 },
              ]}
            >
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy in this
              section. You are advised to review this Privacy Policy
              periodically for any changes.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              7. Contact Us
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242", marginBottom: 20 },
              ]}
            >
              If you have any questions about this Privacy Policy, please
              contact us at privacy@profitloss-calculator.com.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 10,
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
    paddingTop: 20,
    paddingHorizontal: 10,
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
  contentContainer: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  contentGradient: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
});
