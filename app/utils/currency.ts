import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ACCOUNT_CURRENCY_KEY,
  Currency,
  currencies,
} from "../screens/CurrencySelectorScreen";

// Default currency (USD)
const defaultCurrency: Currency = currencies[0];

/**
 * Get the user's selected currency
 */
export const getSelectedCurrency = async (): Promise<Currency> => {
  try {
    const savedCurrency = await AsyncStorage.getItem(ACCOUNT_CURRENCY_KEY);
    if (savedCurrency) {
      return JSON.parse(savedCurrency);
    }
  } catch (error) {
    console.error("Failed to load currency:", error);
  }
  return defaultCurrency;
};

/**
 * Format a number as currency with the proper symbol
 */
export const formatCurrency = (value: number, currency?: Currency): string => {
  const symbol = currency ? currency.symbol : "$";
  return `${symbol}${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

/**
 * Format a number as a percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};
