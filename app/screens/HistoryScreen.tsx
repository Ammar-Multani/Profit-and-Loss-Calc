import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, IconButton, Searchbar, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import LinearGradient from "react-native-linear-gradient";

import { getCalculationHistory, deleteCalculation } from "../utils/storage";
import { HistoryItem } from "../types";
import { useTheme } from "../context/ThemeContext";

export default function HistoryScreen() {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState<HistoryItem[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      loadHistory();
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredHistory(history);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = history.filter((item) => {
        const entryPrice = item.entryPrice.toString().includes(query);
        const exitPrice = item.exitPrice.toString().includes(query);
        const quantity = item.quantity.toString().includes(query);
        const date = new Date(item.timestamp)
          .toLocaleDateString()
          .toLowerCase()
          .includes(query);
        const profit = item.result.netProfitLoss.toString().includes(query);

        return entryPrice || exitPrice || quantity || date || profit;
      });
      setFilteredHistory(filtered);
    }
  }, [searchQuery, history]);

  const loadHistory = async () => {
    const calculationHistory = await getCalculationHistory();
    setHistory(calculationHistory);
    setFilteredHistory(calculationHistory);
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      "Delete Calculation",
      "Are you sure you want to delete this calculation?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            await deleteCalculation(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            loadHistory();
          },
          style: "destructive",
        },
      ]
    );
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const isProfitable = item.result.netProfitLoss > 0;

    return (
      <View
        style={[
          styles.historyItem,
          {
            backgroundColor: isDarkMode ? "#1E1E1E" : "white",
            borderColor: isDarkMode
              ? "rgba(80, 80, 80, 0.5)"
              : "rgba(220, 220, 220, 0.8)",
            borderWidth: 1,
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
          style={styles.historyItemGradient}
        >
          <View style={styles.historyItemHeader}>
            <View style={styles.dateContainer}>
              <IconButton
                icon="calendar"
                size={16}
                iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                style={styles.calendarIcon}
              />
              <Text
                style={[
                  styles.historyItemDate,
                  { color: isDarkMode ? "#BBBBBB" : "#757575" },
                ]}
              >
                {formatDate(item.timestamp)}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(50, 50, 50, 0.7)"
                    : "rgba(245, 245, 245, 0.8)",
                  borderColor: isDarkMode
                    ? "rgba(80, 80, 80, 0.5)"
                    : "rgba(220, 220, 220, 0.8)",
                },
              ]}
              onPress={() => handleDeleteItem(item.id)}
            >
              <IconButton
                icon="delete-outline"
                size={18}
                iconColor={isDarkMode ? "#EF5350" : "#F44336"}
                style={styles.deleteIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.historyItemDetails}>
            <View style={styles.priceContainer}>
              <View style={styles.priceItem}>
                <Text
                  style={[
                    styles.priceLabel,
                    { color: isDarkMode ? "#AAAAAA" : "#757575" },
                  ]}
                >
                  Entry
                </Text>
                <Text
                  style={[
                    styles.priceValue,
                    { color: isDarkMode ? "#FFFFFF" : "#212121" },
                  ]}
                >
                  {formatCurrency(item.entryPrice)}
                </Text>
              </View>

              <IconButton
                icon="arrow-right"
                size={20}
                iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                style={styles.arrowIcon}
              />

              <View style={styles.priceItem}>
                <Text
                  style={[
                    styles.priceLabel,
                    { color: isDarkMode ? "#AAAAAA" : "#757575" },
                  ]}
                >
                  Exit
                </Text>
                <Text
                  style={[
                    styles.priceValue,
                    { color: isDarkMode ? "#FFFFFF" : "#212121" },
                  ]}
                >
                  {formatCurrency(item.exitPrice)}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.quantityBadge,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(50, 50, 50, 0.7)"
                    : "rgba(245, 245, 245, 0.8)",
                  borderColor: isDarkMode
                    ? "rgba(80, 80, 80, 0.5)"
                    : "rgba(220, 220, 220, 0.8)",
                },
              ]}
            >
              <Text
                style={[
                  styles.quantityLabel,
                  { color: isDarkMode ? "#AAAAAA" : "#757575" },
                ]}
              >
                QTY
              </Text>
              <Text
                style={[
                  styles.quantityValue,
                  { color: isDarkMode ? "#FFFFFF" : "#212121" },
                ]}
              >
                {item.quantity}
              </Text>
            </View>

            <Divider
              style={[
                styles.divider,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(80, 80, 80, 0.5)"
                    : "rgba(220, 220, 220, 0.8)",
                },
              ]}
            />

            <View style={styles.resultContainer}>
              <View style={styles.resultItem}>
                <Text
                  style={[
                    styles.resultLabel,
                    { color: isDarkMode ? "#AAAAAA" : "#757575" },
                  ]}
                >
                  Net Profit/Loss
                </Text>
                <Text
                  style={[
                    styles.resultValue,
                    {
                      color: isProfitable
                        ? isDarkMode
                          ? "#81C784"
                          : "#4CAF50"
                        : isDarkMode
                        ? "#EF5350"
                        : "#F44336",
                    },
                  ]}
                >
                  {isProfitable ? "+" : ""}
                  {formatCurrency(item.result.netProfitLoss)}
                </Text>
              </View>

              <View
                style={[
                  styles.returnBadge,
                  {
                    backgroundColor: isProfitable
                      ? isDarkMode
                        ? "rgba(129, 199, 132, 0.15)"
                        : "rgba(76, 175, 80, 0.1)"
                      : isDarkMode
                      ? "rgba(239, 83, 80, 0.15)"
                      : "rgba(244, 67, 54, 0.1)",
                    borderColor: isProfitable
                      ? isDarkMode
                        ? "rgba(129, 199, 132, 0.3)"
                        : "rgba(76, 175, 80, 0.2)"
                      : isDarkMode
                      ? "rgba(239, 83, 80, 0.3)"
                      : "rgba(244, 67, 54, 0.2)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.returnValue,
                    {
                      color: isProfitable
                        ? isDarkMode
                          ? "#81C784"
                          : "#4CAF50"
                        : isDarkMode
                        ? "#EF5350"
                        : "#F44336",
                    },
                  ]}
                >
                  {isProfitable ? "+" : ""}
                  {formatPercentage(item.result.profitLossPercentage)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

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
              CALCULATION HISTORY
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDarkMode
              ? "rgba(30, 30, 30, 0.5)"
              : "rgba(255, 255, 255, 0.5)",
            borderBottomColor: isDarkMode
              ? "rgba(75, 75, 75, 0.2)"
              : "rgba(230, 230, 230, 0.5)",
          },
        ]}
      >
        <View style={styles.searchBarWrapper}>
          <Searchbar
            placeholder="Search by price, quantity, date..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[
              styles.searchBar,
              {
                backgroundColor: isDarkMode
                  ? "rgba(40, 40, 40, 0.7)"
                  : "rgba(255, 255, 255, 0.9)",
                borderColor: isDarkMode
                  ? "rgba(80, 80, 80, 0.5)"
                  : "rgba(220, 220, 220, 0.8)",
              },
            ]}
            iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
            placeholderTextColor={isDarkMode ? "#777777" : "#AAAAAA"}
            inputStyle={{ color: isDarkMode ? "#FFFFFF" : "#212121" }}
            elevation={0}
          />
          {searchQuery.length > 0 && (
            <Text
              style={[
                styles.resultsCount,
                { color: isDarkMode ? "#BBBBBB" : "#757575" },
              ]}
            >
              {filteredHistory.length}{" "}
              {filteredHistory.length === 1 ? "result" : "results"} found
            </Text>
          )}
        </View>
      </View>

      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={
              isDarkMode
                ? ["rgba(40, 40, 40, 0.7)", "rgba(30, 30, 30, 0.5)"]
                : ["rgba(255, 255, 255, 0.95)", "rgba(250, 250, 255, 0.85)"]
            }
            style={[
              styles.emptyCard,
              {
                borderColor: isDarkMode
                  ? "rgba(75, 75, 75, 0.2)"
                  : "rgba(230, 230, 230, 0.8)",
              },
            ]}
          >
            <View style={styles.emptyIconContainer}>
              <IconButton
                icon={searchQuery.length > 0 ? "magnify-close" : "history"}
                size={50}
                iconColor={isDarkMode ? "#90CAF9" : "#2196F3"}
                style={styles.emptyIcon}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                { color: isDarkMode ? "#FFFFFF" : "#333333" },
              ]}
            >
              {searchQuery.length > 0
                ? "No Matching Results"
                : "No History Yet"}
            </Text>

            <Text
              style={[
                styles.emptyText,
                { color: isDarkMode ? "#BBBBBB" : "#757575" },
              ]}
            >
              {searchQuery.length > 0
                ? "Try different search terms or clear the search"
                : "Your calculation history will appear here"}
            </Text>

            {history.length === 0 && (
              <View style={styles.emptyTipsContainer}>
                <View style={styles.emptyTipRow}>
                  <View
                    style={[
                      styles.emptyTipBullet,
                      { backgroundColor: isDarkMode ? "#90CAF9" : "#2196F3" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.emptyTipText,
                      { color: isDarkMode ? "#DDDDDD" : "#555555" },
                    ]}
                  >
                    Calculate profit and loss on the home screen
                  </Text>
                </View>
                <View style={styles.emptyTipRow}>
                  <View
                    style={[
                      styles.emptyTipBullet,
                      { backgroundColor: isDarkMode ? "#90CAF9" : "#2196F3" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.emptyTipText,
                      { color: isDarkMode ? "#DDDDDD" : "#555555" },
                    ]}
                  >
                    Save calculations to track profits over time
                  </Text>
                </View>
              </View>
            )}

            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.clearSearchButton,
                  {
                    backgroundColor: isDarkMode
                      ? "rgba(50, 50, 50, 0.7)"
                      : "rgba(245, 245, 245, 0.8)",
                    borderColor: isDarkMode
                      ? "rgba(80, 80, 80, 0.5)"
                      : "rgba(220, 220, 220, 0.8)",
                  },
                ]}
                onPress={() => setSearchQuery("")}
              >
                <Text
                  style={[
                    styles.clearSearchText,
                    { color: isDarkMode ? "#90CAF9" : "#2196F3" },
                  ]}
                >
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>
      )}
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
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBarWrapper: {
    marginBottom: 4,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
    borderWidth: 1,
    height: 57,
  },
  resultsCount: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
    fontStyle: "italic",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  historyItem: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  historyItemGradient: {
    padding: 16,
    borderRadius: 16,
  },
  historyItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  calendarIcon: {
    margin: 0,
    marginRight: -4,
  },
  historyItemDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  deleteButton: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 0,
    height: 32,
    width: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    margin: 0,
  },
  historyItemDetails: {
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  priceItem: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 17,
    fontWeight: "600",
  },
  arrowIcon: {
    margin: 0,
  },
  quantityBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  quantityLabel: {
    fontSize: 12,
    marginRight: 6,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    marginBottom: 12,
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  resultItem: {
    flex: 1,
  },
  resultLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  returnBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  returnValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 30,
    width: "100%",
    alignItems: "center",
  },
  emptyIconContainer: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 50,
    padding: 10,
    marginBottom: 20,
  },
  emptyIcon: {
    margin: 0,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 16,
  },
  emptyTipsContainer: {
    width: "100%",
    marginTop: 8,
    marginBottom: 8,
  },
  emptyTipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  emptyTipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
