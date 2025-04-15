import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, TradeCalculation } from '../types';
import { calculateResults } from './calculations';

const HISTORY_STORAGE_KEY = 'trade_calculation_history';
const SETTINGS_STORAGE_KEY = 'trade_calculator_settings';

export async function saveCalculation(calculation: TradeCalculation): Promise<void> {
  try {
    // Get existing history
    const existingHistory = await getCalculationHistory();
    
    // Create history item with results
    const historyItem: HistoryItem = {
      ...calculation,
      result: calculateResults(calculation)
    };
    
    // Add new calculation to history
    const updatedHistory = [historyItem, ...existingHistory];
    
    // Save updated history
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error saving calculation:', error);
    throw error;
  }
}

export async function getCalculationHistory(): Promise<HistoryItem[]> {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Error getting calculation history:', error);
    return [];
  }
}

export async function clearCalculationHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing calculation history:', error);
    throw error;
  }
}

export async function deleteCalculation(id: string): Promise<void> {
  try {
    const history = await getCalculationHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error deleting calculation:', error);
    throw error;
  }
}

export interface CalculatorSettings {
  defaultCommission: number;
  defaultSlippage: number;
  defaultPositionFees: number;
  defaultTaxRate: number;
  includeCommissionByDefault: boolean;
  includeSlippageByDefault: boolean;
  includePositionFeesByDefault: boolean;
  includeTaxByDefault: boolean;
  defaultRiskPercentage: number;
  defaultRiskRewardRatio: number;
  enableHapticFeedback: boolean;
}

export const DEFAULT_SETTINGS: CalculatorSettings = {
  defaultCommission: 0.1,
  defaultSlippage: 0,
  defaultPositionFees: 0,
  defaultTaxRate: 0,
  includeCommissionByDefault: true,
  includeSlippageByDefault: false,
  includePositionFeesByDefault: false,
  includeTaxByDefault: false,
  defaultRiskPercentage: 1,
  defaultRiskRewardRatio: 2,
  enableHapticFeedback: true
};

export async function saveSettings(settings: CalculatorSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

export async function getSettings(): Promise<CalculatorSettings> {
  try {
    const settingsJson = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function resetSettings(): Promise<void> {
  try {
    await saveSettings(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error resetting settings:', error);
    throw error;
  }
}