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

export default function DisclaimerScreen() {
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
              DISCLAIMER
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
              Financial Disclaimer
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              This disclaimer applies to all users of the Profit & Loss
              Calculator application.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              1. Not Financial Advice
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              The Profit & Loss Calculator is a tool designed to help you
              calculate and track potential profits and losses. The information
              provided by this application is for general informational and
              educational purposes only. It is not intended to be and should not
              be construed as financial, investment, or trading advice.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              2. No Guarantee of Accuracy
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              While we strive to ensure that all calculations performed by the
              Profit & Loss Calculator are accurate, we make no guarantees
              regarding the accuracy, completeness, or reliability of any
              information provided by the application. The results generated by
              the calculator are based on the data you input and the
              mathematical formulas programmed into the application.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              3. Risk Warning
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              Trading and investing involve substantial risk. The value of
              investments can go up or down and past performance is not
              necessarily indicative of future results. You should be aware that
              there is a risk of loss, including the potential loss of the money
              invested.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              4. Consult with Professionals
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              Before making any financial decisions, we strongly recommend that
              you consult with a qualified financial advisor, accountant, or tax
              professional who can take into account your specific financial
              situation, needs, and goals.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              5. No Responsibility for Financial Decisions
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242" },
              ]}
            >
              By using the Profit & Loss Calculator, you acknowledge and agree
              that you are solely responsible for your own financial decisions
              and actions. We shall not be liable for any losses, damages, or
              other liabilities resulting from your use of, or reliance on, the
              information provided by the application.
            </Text>

            <Text
              style={[
                styles.sectionSubtitle,
                { color: isDarkMode ? "#FFFFFF" : "#212121" },
              ]}
            >
              6. Changes to this Disclaimer
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242", marginBottom: 20 },
              ]}
            >
              We reserve the right to update, change, or replace any part of
              this disclaimer at any time. Any changes will be effective
              immediately upon posting the updated disclaimer in the
              application. Your continued use of the application following the
              posting of any changes constitutes acceptance of those changes.
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
