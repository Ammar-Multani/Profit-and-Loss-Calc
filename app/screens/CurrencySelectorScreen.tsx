import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  TextInput,
  Platform,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { CurrencySelectorScreenProps } from "../types/navigation";

// Storage key for the selected currency
export const ACCOUNT_CURRENCY_KEY = "profit-calculator-account-currency";

// Define Currency type
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  countryCode: string;
}

// Sample currencies list - you can expand this
export const currencies: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", countryCode: "US" },
  { code: "EUR", name: "Euro", symbol: "€", countryCode: "EU" },
  { code: "GBP", name: "British Pound", symbol: "£", countryCode: "GB" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", countryCode: "JP" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", countryCode: "CA" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", countryCode: "AU" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", countryCode: "CH" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", countryCode: "CN" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", countryCode: "IN" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", countryCode: "SG" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", countryCode: "NZ" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", countryCode: "MX" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", countryCode: "BR" },
  { code: "ZAR", name: "South African Rand", symbol: "R", countryCode: "ZA" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", countryCode: "HK" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", countryCode: "SE" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", countryCode: "NO" },
  { code: "DKK", name: "Danish Krone", symbol: "kr", countryCode: "DK" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł", countryCode: "PL" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", countryCode: "AE" },
];

// Filter currencies based on search term
export const filterCurrencies = (searchTerm: string): Currency[] => {
  const term = searchTerm.toLowerCase().trim();
  return currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(term) ||
      currency.name.toLowerCase().includes(term)
  );
};

// Currency Selector Screen component
const CurrencySelectorScreen: React.FC<CurrencySelectorScreenProps> = ({
  navigation,
}) => {
  const { colors, isDarkMode } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    currencies[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCurrencies, setFilteredCurrencies] =
    useState<Currency[]>(currencies);

  // Load saved currency on mount
  useEffect(() => {
    const loadSavedCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem(ACCOUNT_CURRENCY_KEY);
        if (savedCurrency) {
          setSelectedCurrency(JSON.parse(savedCurrency));
        }
      } catch (error) {
        console.error("Failed to load saved currency:", error);
      }
    };

    loadSavedCurrency();
  }, []);

  // Update filtered currencies when search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCurrencies(currencies);
    } else {
      setFilteredCurrencies(filterCurrencies(searchTerm));
    }
  }, [searchTerm]);

  // Handle currency selection
  const handleCurrencySelect = async (currency: Currency) => {
    setSelectedCurrency(currency);
    try {
      await AsyncStorage.setItem(
        ACCOUNT_CURRENCY_KEY,
        JSON.stringify(currency)
      );
      // Go back or navigate to another screen
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save currency selection:", error);
    }
  };

  // Render currency item
  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = selectedCurrency.code === item.code;

    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          isSelected && {
            backgroundColor: colors.primary + "15",
          },
        ]}
        onPress={() => handleCurrencySelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.currencyLeftContent}>
          <View style={styles.flagContainer}>
            <Image
              source={{
                uri: `https://flagcdn.com/w160/${item.countryCode.toLowerCase()}.png`,
              }}
              style={styles.flag}
              resizeMode="cover"
            />
          </View>
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyCode, { color: colors.text }]}>
              {item.code}
            </Text>
            <Text
              style={[styles.currencyName, { color: colors.textSecondary }]}
            >
              {item.name}
            </Text>
          </View>
        </View>
        <View style={styles.currencyRight}>
          <View
            style={[
              styles.symbolContainer,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Text style={[styles.currencySymbol, { color: colors.primary }]}>
              {item.symbol}
            </Text>
          </View>
          {isSelected && (
            <MaterialIcons
              name="check-circle"
              size={24}
              color={colors.primary}
              style={styles.checkIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Base Currency</Text>
        <View style={styles.placeholder} />
      </View>

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialIcons name="search" size={24} color={colors.primary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search available currencies..."
          placeholderTextColor={colors.textSecondary}
          value={searchTerm}
          onChangeText={setSearchTerm}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchTerm("")}
            activeOpacity={0.7}
            style={styles.clearButton}
          >
            <MaterialIcons
              name="cancel"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCurrencies}
        renderItem={renderCurrencyItem}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={20}
        windowSize={10}
        ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "android" ? 30 : 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "white",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  placeholder: {
    width: 40, // To balance the header
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 4,
  },
  clearButton: {
    padding: 6,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 40 : 16,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currencyLeftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  flagContainer: {
    marginRight: 15,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  flag: {
    width: 35,
    height: 22,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.15)",
  },
  currencyInfo: {
    flexDirection: "column",
    marginLeft: 4,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
    opacity: 0.8,
  },
  currencyRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  symbolContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default CurrencySelectorScreen;
