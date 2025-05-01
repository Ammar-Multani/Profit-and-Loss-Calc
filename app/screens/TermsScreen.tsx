import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import LinearGradient from "react-native-linear-gradient";

import { useTheme } from "../context/ThemeContext";

export default function TermsScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();

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
              TERMS OF SERVICE
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
              Terms and Conditions
            </Text>


            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              Please read these Terms and Conditions carefully before using the
              Profit & Loss Calculator application.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              1. Acceptance of Terms
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              By downloading, installing, or using the Profit & Loss Calculator
              application, you agree to be bound by these Terms and Conditions.
              If you do not agree to these Terms, please do not use the
              application.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              2. Use of the Application
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              The Profit & Loss Calculator is provided for personal and business
              use. You may use this application to calculate and track profit
              and loss for your investments or business activities. The
              application is provided "as is" and we make no warranties
              regarding its functionality or accuracy.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              3. Financial Advice Disclaimer
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              The Profit & Loss Calculator is a tool for calculation purposes
              only and does not provide financial advice. The results generated
              by the application should not be considered as financial
              recommendations. Please consult with a qualified financial advisor
              before making any investment decisions.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              4. User Data and Privacy
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              We respect your privacy and handle your data in accordance with
              our Privacy Policy. The application may store calculation history
              and preferences on your device. Please refer to our Privacy Policy
              for more details on how we handle your information.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              5. Intellectual Property
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              All intellectual property rights in the application, including but
              not limited to copyright, trademarks, and design rights, are owned
              by or licensed to us. You may not copy, modify, distribute, or
              reproduce any part of the application without our prior written
              consent.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              6. Changes to Terms
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              We reserve the right to modify these Terms at any time. Any
              changes will be effective immediately upon posting the updated
              Terms in the application. Your continued use of the application
              after the changes have been made will constitute your acceptance
              of the revised Terms.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              7. Contact Information
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242", marginBottom: 20 },
              ]}
            >
              If you have any questions about these Terms, please contact us at
              support@profitloss-calculator.com.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
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
