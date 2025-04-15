import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { 
  Text, 
  IconButton,
  useTheme,
  Divider,
  Button
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { calculateResults } from '../utils/calculations';
import { saveCalculation, getSettings } from '../utils/storage';
import { TradeCalculation } from '../types';
import { useTheme as useAppTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { isDarkMode, setThemeMode } = useAppTheme();
  
  // Currency setup
  const [accountCurrency, setAccountCurrency] = useState('USD');
  const [currencyPair, setCurrencyPair] = useState('EUR/USD');
  
  // Position size
  const [lotType, setLotType] = useState('Standard');
  const [lotCount, setLotCount] = useState('1');
  const [totalUnits, setTotalUnits] = useState('100,000');
  
  // Pip value
  const [pips, setPips] = useState('10');
  
  // Results
  const [pipValue, setPipValue] = useState(100);
  const [totalValue, setTotalValue] = useState(1000);
  
  // Lot sizes
  const lotSizes = {
    Standard: { units: 100000, pipValue: 10 },
    Mini: { units: 10000, pipValue: 1 },
    Micro: { units: 1000, pipValue: 0.1 },
    Nano: { units: 100, pipValue: 0.01 }
  };
  
  // Calculate values when inputs change
  useEffect(() => {
    calculatePipValues();
  }, [lotType, lotCount, pips]);
  
  const calculatePipValues = () => {
    const count = parseFloat(lotCount) || 1;
    const pipCount = parseFloat(pips) || 0;
    
    // Get base pip value for selected lot type
    const basePipValue = lotSizes[lotType]?.pipValue || 10;
    
    // Calculate pip value based on lot count
    const calculatedPipValue = basePipValue * count;
    setPipValue(calculatedPipValue);
    
    // Calculate total value
    const calculatedTotalValue = calculatedPipValue * pipCount;
    setTotalValue(calculatedTotalValue);
    
    // Update total units
    const baseUnits = lotSizes[lotType]?.units || 100000;
    const totalCalculatedUnits = baseUnits * count;
    setTotalUnits(totalCalculatedUnits.toLocaleString());
  };
  
  const handleLotTypeChange = () => {
    // This would open a dialog to select lot type
    const types = Object.keys(lotSizes);
    const currentIndex = types.indexOf(lotType);
    const nextIndex = (currentIndex + 1) % types.length;
    setLotType(types[nextIndex]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const formatCurrency = (value) => {
    return value.toFixed(3).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  const saveToHistory = () => {
    const calculation: TradeCalculation = {
      id: uuidv4(),
      entryPrice: 0,
      exitPrice: 0,
      quantity: parseFloat(lotCount) || 1,
      commission: 0,
      slippage: 0,
      positionFees: 0,
      taxRate: 0,
      includeCommission: false,
      includeSlippage: false,
      includePositionFees: false,
      includeTax: false,
      stopLoss: null,
      takeProfit: null,
      timestamp: Date.now(),
      notes: `${pips} pips - ${currencyPair} - ${lotType} lot`
    };
    
    saveCalculation(calculation);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="information-outline"
          size={24}
          onPress={() => navigation.navigate('History' as never)}
        />
        <Text style={styles.headerTitle}>Forex Pip Calculator</Text>
        <View style={styles.headerRight}>
          <IconButton
            icon={isDarkMode ? "weather-night" : "weather-sunny"}
            size={24}
            onPress={() => setThemeMode(isDarkMode ? 'light' : 'dark')}
          />
          <IconButton
            icon="cog"
            size={24}
            onPress={() => navigation.navigate('Settings' as never)}
          />
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Currency Setup Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <IconButton icon="currency-usd" size={24} style={styles.cardIcon} />
            </View>
            <Text style={styles.cardTitle}>Currency Setup</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Account Currency</Text>
            <TouchableOpacity 
              style={styles.currencySelector}
              onPress={() => {
                // This would open a currency selection dialog
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.currencyFlag}>
                <Text style={styles.flagText}>🇺🇸</Text>
              </View>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyCode}>{accountCurrency}</Text>
                <Text style={styles.currencyName}>US Dollar</Text>
              </View>
              <View style={styles.currencyActions}>
                <Text style={styles.currencySymbol}>$</Text>
                <IconButton icon="chevron-down" size={24} />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Currency Pair</Text>
            <TouchableOpacity 
              style={styles.currencySelector}
              onPress={() => {
                // This would open a currency pair selection dialog
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.currencyFlag}>
                <Text style={styles.flagText}>🇪🇺🇺🇸</Text>
              </View>
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyCode}>{currencyPair}</Text>
                <Text style={styles.currencyName}>Euro / US Dollar</Text>
              </View>
              <IconButton icon="chevron-down" size={24} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Position Size Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <IconButton icon="bank" size={24} style={styles.cardIcon} />
            </View>
            <Text style={styles.cardTitle}>Position Size</Text>
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Lot Type:</Text>
            <TouchableOpacity 
              style={styles.valueSelector}
              onPress={handleLotTypeChange}
            >
              <Text style={styles.selectorValue}>{lotType}</Text>
              <IconButton icon="chevron-down" size={20} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Count:</Text>
            <TextInput
              style={styles.valueInput}
              value={lotCount}
              onChangeText={setLotCount}
              keyboardType="decimal-pad"
              textAlign="right"
            />
          </View>
          
          <View style={styles.totalUnitsRow}>
            <Button 
              mode="contained" 
              icon="pencil"
              onPress={() => {
                // This would open a dialog to edit lot values
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.editButton}
              labelStyle={styles.editButtonLabel}
            >
              Edit Lot Values
            </Button>
            <View style={styles.totalUnitsContainer}>
              <Text style={styles.totalUnitsLabel}>Total Units:</Text>
              <Text style={styles.totalUnitsValue}>{totalUnits}</Text>
            </View>
          </View>
        </View>
        
        {/* Pip Value Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <IconButton icon="chart-line" size={24} style={styles.cardIcon} />
            </View>
            <Text style={styles.cardTitle}>Pip Value</Text>
          </View>
          
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Pips:</Text>
            <TextInput
              style={styles.valueInput}
              value={pips}
              onChangeText={setPips}
              keyboardType="decimal-pad"
              textAlign="right"
            />
          </View>
          
          <View style={styles.pipInfoRow}>
            <IconButton icon="information-outline" size={16} style={styles.infoIcon} />
            <Text style={styles.pipInfoText}>Enter the number of pips for your calculation</Text>
          </View>
        </View>
        
        {/* Results Card */}
        <View style={styles.resultsCard}>
          <Text style={styles.pipsLabel}>{pips} pips</Text>
          <View style={styles.totalValueContainer}>
            <Text style={styles.currencyPrefix}>$</Text>
            <Text style={styles.totalValueText}>{totalValue.toFixed(2)}</Text>
          </View>
          <Text style={styles.currencySuffix}>{accountCurrency}</Text>
          
          <View style={styles.resultTabs}>
            <TouchableOpacity style={styles.resultTab}>
              <IconButton icon="calculator" size={16} />
              <Text style={styles.resultTabText}>Per Pip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.resultTab, styles.activeTab]}>
              <IconButton icon="calculator-variant" size={16} />
              <Text style={styles.resultTabText}>Total ({pips})</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.resultRows}>
            <View style={styles.resultRow}>
              <Text style={styles.resultCurrency}>{accountCurrency}</Text>
              <Text style={styles.resultValue}>${pipValue.toFixed(3)}</Text>
              <Text style={styles.resultCurrency}>{accountCurrency}</Text>
              <Text style={styles.resultValue}>${totalValue.toFixed(3)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultCurrency}>{accountCurrency}</Text>
              <Text style={styles.resultValue}>${pipValue.toFixed(3)}</Text>
              <Text style={styles.resultCurrency}>{accountCurrency}</Text>
              <Text style={styles.resultValue}>${totalValue.toFixed(3)}</Text>
            </View>
          </View>
          
          <View style={styles.exchangeRateContainer}>
            <View style={styles.exchangeRateHeader}>
              <View style={styles.exchangeRateLeft}>
                <IconButton icon="currency-usd" size={16} style={styles.exchangeIcon} />
                <Text style={styles.exchangeRateTitle}>Exchange Rate</Text>
              </View>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.exchangeRateValue}>Same currency (USD)</Text>
          </View>
          
          <View style={styles.pipValuesContainer}>
            <View style={styles.pipValuesHeader}>
              <IconButton icon="bank" size={16} style={styles.pipValuesIcon} />
              <Text style={styles.pipValuesTitle}>Pip Values by Lot Size</Text>
            </View>
            
            <View style={styles.lotSizesGrid}>
              <View style={[styles.lotSizeItem, styles.standardLot]}>
                <Text style={styles.lotSizeTitle}>Standard</Text>
                <Text style={styles.lotSizeUnits}>100,000 units</Text>
                <Text style={styles.lotSizeValue}>$10.000</Text>
                <Text style={styles.lotSizePerPip}>per pip</Text>
              </View>
              
              <View style={[styles.lotSizeItem, styles.miniLot]}>
                <Text style={styles.lotSizeTitle}>Mini</Text>
                <Text style={styles.lotSizeUnits}>10,000 units</Text>
                <Text style={styles.lotSizeValue}>$1.000</Text>
                <Text style={styles.lotSizePerPip}>per pip</Text>
              </View>
              
              <View style={[styles.lotSizeItem, styles.microLot]}>
                <Text style={styles.lotSizeTitle}>Micro</Text>
                <Text style={styles.lotSizeUnits}>1,000 units</Text>
                <Text style={styles.lotSizeValue}>$0.100</Text>
                <Text style={styles.lotSizePerPip}>per pip</Text>
              </View>
              
              <View style={[styles.lotSizeItem, styles.nanoLot]}>
                <Text style={styles.lotSizeTitle}>Nano</Text>
                <Text style={styles.lotSizeUnits}>100 units</Text>
                <Text style={styles.lotSizeValue}>$0.010</Text>
                <Text style={styles.lotSizePerPip}>per pip</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    backgroundColor: '#EEF3FF',
    borderRadius: 20,
    marginRight: 8,
  },
  cardIcon: {
    margin: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
  },
  currencyFlag: {
    marginRight: 8,
  },
  flagText: {
    fontSize: 20,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyName: {
    fontSize: 12,
    color: '#666',
  },
  currencyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
  },
  selectorValue: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  valueInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
    fontSize: 14,
  },
  totalUnitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#5B7FFF',
    borderRadius: 8,
  },
  editButtonLabel: {
    fontSize: 12,
  },
  totalUnitsContainer: {
    alignItems: 'flex-end',
  },
  totalUnitsLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalUnitsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  pipInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    margin: 0,
  },
  pipInfoText: {
    fontSize: 12,
    color: '#666',
  },
  resultsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  pipsLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: 'white',
    backgroundColor: '#5B7FFF',
    paddingVertical: 8,
  },
  totalValueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    backgroundColor: '#5B7FFF',
    paddingBottom: 16,
  },
  currencyPrefix: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
  totalValueText: {
    fontSize: 36,
    color: 'white',
    fontWeight: '700',
  },
  currencySuffix: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    backgroundColor: '#5B7FFF',
    paddingBottom: 16,
  },
  resultTabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resultTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: 'white',
  },
  resultTabText: {
    fontSize: 14,
  },
  resultRows: {
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultCurrency: {
    fontSize: 12,
    color: '#666',
    width: 40,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    width: 100,
    textAlign: 'right',
  },
  exchangeRateContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  exchangeRateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exchangeRateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exchangeIcon: {
    margin: 0,
  },
  exchangeRateTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    color: '#4CAF50',
    fontWeight: '600',
  },
  exchangeRateValue: {
    fontSize: 14,
    color: '#666',
  },
  pipValuesContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pipValuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pipValuesIcon: {
    margin: 0,
  },
  pipValuesTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  lotSizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lotSizeItem: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  standardLot: {
    backgroundColor: '#E8F0FE',
  },
  miniLot: {
    backgroundColor: '#E0F2F1',
  },
  microLot: {
    backgroundColor: '#FFF8E1',
  },
  nanoLot: {
    backgroundColor: '#FCE4EC',
  },
  lotSizeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  lotSizeUnits: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  lotSizeValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  lotSizePerPip: {
    fontSize: 12,
    color: '#666',
  },
});
