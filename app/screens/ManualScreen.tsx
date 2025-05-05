import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Text, IconButton, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import LinearGradient from "react-native-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useTheme } from "../context/ThemeContext";

export default function ManualScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const renderSection = (title: string, content: string) => (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: isDarkMode ? "#252525" : "#FFFFFF",
          marginBottom: 16,
        },
      ]}
    >
      <Card.Title
        title={title}
        titleStyle={[
          styles.cardTitle,
          { color: isDarkMode ? "#FFFFFF" : "#212121" },
        ]}
      />
      <Card.Content>
        <Text
          style={[
            styles.contentText,
            { color: isDarkMode ? "#DDDDDD" : "#424242" },
          ]}
        >
          {content}
        </Text>
      </Card.Content>
    </Card>
  );

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
              USER MANUAL
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
              Profit & Loss Calculator Manual
            </Text>

            <Text
              style={[
                styles.contentText,
                { color: isDarkMode ? "#DDDDDD" : "#424242", marginBottom: 20 },
              ]}
            >
              Welcome to the Profit & Loss Calculator app! This manual will
              guide you through all the features and functionality of the
              application to help you make the most of it.
            </Text>

            {renderSection(
              "Getting Started",
              "The Profit & Loss Calculator helps you calculate your profits and losses for various investments or business transactions. To get started, simply enter your purchase price, selling price, and quantity on the home screen."
            )}

            {renderSection(
              "Basic Calculations",
              "Enter the buy price, sell price, and quantity in their respective fields. The app will automatically calculate:\n\n• Total Investment (Buy Price × Quantity)\n• Total Return (Sell Price × Quantity)\n• Profit/Loss (Total Return - Total Investment)\n• Profit/Loss Percentage ((Profit/Loss ÷ Total Investment) × 100%)"
            )}

            {renderSection(
              "Currency Selection",
              "You can change your preferred currency by going to Settings > Primary Currency. This will update all calculations to display in your selected currency format. The app supports multiple currencies from around the world."
            )}

            {renderSection(
              "Calculation History",
              "All your calculations are automatically saved in the History section. To access your calculation history, tap the History icon in the top right corner of the home screen. You can review past calculations, see detailed results, and even duplicate or delete entries as needed."
            )}

            {renderSection(
              "Theme Options",
              "The app supports both light and dark themes. You can change the theme by:\n\n1. Going to Settings > Appearance\n2. Selecting Light, Dark, or System (which follows your device settings)\n\nYou can also quickly toggle between light and dark modes by tapping the theme icon in the top right corner of the home screen."
            )}

            {renderSection(
              "Advanced Features",
              "In addition to basic profit and loss calculations, the app includes:\n\n• Support for fees and commissions\n• Tax calculations\n• Multiple currency support\n• Detailed performance metrics\n• Data visualization with charts and graphs"
            )}

            {renderSection(
              "Data Management",
              "Your data is stored locally on your device. You can clear your calculation history or reset all settings from the Settings menu. The app does not transmit your calculation data to external servers."
            )}

            {renderSection(
              "Need Help?",
              "If you encounter any issues or have questions about using the app, you can report a bug or contact customer support through the Settings > Report a Bug option."
            )}
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
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
});
