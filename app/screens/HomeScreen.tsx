import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Text, 
  IconButton,
  useTheme,
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { calculateResults } from '../utils/calculations';
import { saveCalculation, getSettings } from '../utils/storage';
import { TradeCalculation } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  
  // Basic inputs
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [units, setUnits] = useState('');
  
  // Advanced inputs
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [operatingExpenses, setOperatingExpenses] = useState('0');
  const [buyingExpensesPerUnit, setBuyingExpensesPerUnit] = useState('0');
  const [sellingExpensesPerUnit, setSellingExpensesPerUnit] = useState('0');
  const [taxRate, setTaxRate] = useState('0');
  
  // Calculator mode
  const [calculatorMode, setCalculatorMode] = useState('standard');
  
  // Results
  const [results, setResults] = useState(null);
  
  // Load calculator mode on mount
  useEffect(() => {
    const loadCalculatorMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('calculatorMode');
        if (savedMode) {
          setCalculatorMode(savedMode);
          // If mode is advanced or professional, show advanced options by default
          if (savedMode === 'advanced' || savedMode === 'professional') {
            setShowAdvanced(true);
          }
        }
      } catch (error) {
        console.error('Failed to load calculator mode:', error);
      }
    };
    
    loadCalculatorMode();
  }, []);
  
  // Calculate results whenever inputs change
  useEffect(() => {
    if (buyingPrice && sellingPrice && units) {
      calculateAndUpdateResults();
    }
  }, [buyingPrice, sellingPrice, units, operatingExpenses, 
      buyingExpensesPerUnit, sellingExpensesPerUnit, taxRate]);
  
  const calculateAndUpdateResults = () => {
    const buyPrice = parseFloat(buyingPrice) || 0;
    const sellPrice = parseFloat(sellingPrice) || 0;
    const quantity = parseFloat(units) || 0;
    const opExpenses = parseFloat(operatingExpenses) || 0;
    const buyExpenses = parseFloat(buyingExpensesPerUnit) || 0;
    const sellExpenses = parseFloat(sellingExpensesPerUnit) || 0;
    const tax = parseFloat(taxRate) || 0;
    
    // Calculate revenue
    const revenue = sellPrice * quantity;
    
    // Calculate cost of goods sold
    const costOfGoodsSold = buyPrice * quantity;
    
    // Calculate total expenses
    const totalBuyingExpenses = buyExpenses * quantity;
    const totalSellingExpenses = sellExpenses * quantity;
    const totalExpenses = opExpenses + totalBuyingExpenses + totalSellingExpenses;
    
    // Calculate profit before tax
    const profitBeforeTax = revenue - costOfGoodsSold - totalExpenses;
    
    // Calculate tax amount
    const taxAmount = profitBeforeTax > 0 ? (profitBeforeTax * (tax / 100)) : 0;
    
    // Calculate net profit
    const netProfit = profitBeforeTax - taxAmount;
    
    // Calculate net profit margin
    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    
    // Calculate return on investment
    const investment = costOfGoodsSold;
    const roi = investment > 0 ? (netProfit / investment) * 100 : 0;
    
    // Additional metrics for professional mode
    let additionalMetrics = {};
    if (calculatorMode === 'professional') {
      const grossProfit = revenue - costOfGoodsSold;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      const breakEvenUnits = opExpenses > 0 ? 
        opExpenses / ((sellPrice - buyPrice) - (buyExpenses + sellExpenses)) : 0;
      
      additionalMetrics = {
        grossProfit,
        grossMargin,
        breakEvenUnits
      };
    }
    
    setResults({
      revenue,
      costOfGoodsSold,
      netProfitMargin,
      netProfit,
      investment,
      roi,
      ...additionalMetrics
    });
  };
  
  const saveToHistory = () => {
    if (!buyingPrice || !sellingPrice || !units) return;
    
    const calculation: TradeCalculation = {
      id: uuidv4(),
      entryPrice: parseFloat(buyingPrice),
      exitPrice: parseFloat(sellingPrice),
      quantity: parseFloat(units),
      commission: parseFloat(buyingExpensesPerUnit) + parseFloat(sellingExpensesPerUnit),
      slippage: 0,
      positionFees: parseFloat(operatingExpenses),
      taxRate: parseFloat(taxRate),
      includeCommission: true,
      includeSlippage: false,
      includePositionFees: true,
      includeTax: parseFloat(taxRate) > 0,
      stopLoss: null,
      takeProfit: null,
      timestamp: Date.now(),
      notes: ''
    };
    
    saveCalculation(calculation);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const formatCurrency = (value) => {
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };
  
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  const resetCalculator = () => {
    setBuyingPrice('');
    setSellingPrice('');
    setUnits('');
    setOperatingExpenses('0');
    setBuyingExpensesPerUnit('0');
    setSellingExpensesPerUnit('0');
    setTaxRate('0');
    setResults(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <IconButton
            icon="account-cog"
            size={24}
            onPress={() => navigation.navigate('Settings' as never)}
          />
          <View style={styles.headerActions}>
            <IconButton
              icon="refresh"
              size={24}
              onPress={resetCalculator}
            />
            <IconButton
              icon="content-save"
              size={24}
              onPress={saveToHistory}
            />
          </View>
        </View>
        
        <ScrollView style={styles.scrollView}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Calculator</Text>
              <View style={styles.cardActions}>
                <IconButton icon="information" size={20} />
                <IconButton icon="calculator-variant" size={20} />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Buying price</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={buyingPrice}
                  onChangeText={setBuyingPrice}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Selling price</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expected sale units</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={units}
                  onChangeText={setUnits}
                  keyboardType="decimal-pad"
                  placeholder="0"
                />
                <View style={styles.quantityButtons}>
                  <IconButton 
                    icon="minus" 
                    size={16} 
                    onPress={() => {
                      const currentValue = parseInt(units) || 0;
                      if (currentValue > 0) {
                        setUnits((currentValue - 1).toString());
                      }
                    }}
                  />
                  <IconButton 
                    icon="plus" 
                    size={16} 
                    onPress={() => {
                      const currentValue = parseInt(units) || 0;
                      setUnits((currentValue + 1).toString());
                    }}
                  />
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.advancedToggle}
              onPress={() => setShowAdvanced(!showAdvanced)}
            >
              <Text style={styles.advancedToggleText}>ADVANCED</Text>
              <IconButton 
                icon={showAdvanced ? "chevron-up" : "chevron-down"} 
                size={20} 
              />
            </TouchableOpacity>
            
            {showAdvanced && (
              <View style={styles.advancedSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Operating expenses</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={operatingExpenses}
                      onChangeText={setOperatingExpenses}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                    <View style={styles.quantityButtons}>
                      <IconButton 
                        icon="minus" 
                        size={16} 
                        onPress={() => {
                          const currentValue = parseFloat(operatingExpenses) || 0;
                          if (currentValue > 0) {
                            setOperatingExpenses((currentValue - 1).toString());
                          }
                        }}
                      />
                      <IconButton 
                        icon="plus" 
                        size={16} 
                        onPress={() => {
                          const currentValue = parseFloat(operatingExpenses) || 0;
                          setOperatingExpenses((currentValue + 1).toString());
                        }}
                      />
                    </View>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Buying expenses per unit</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={buyingExpensesPerUnit}
                      onChangeText={setBuyingExpensesPerUnit}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                    <IconButton icon="dots-vertical" size={20} />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Selling expenses per unit</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={sellingExpensesPerUnit}
                      onChangeText={setSellingExpensesPerUnit}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                    <IconButton icon="dots-vertical" size={20} />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Tax rate</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={taxRate}
                      onChangeText={setTaxRate}
                      keyboardType="decimal-pad"
                      placeholder="0"
                    />
                    <Text style={styles.percentSymbol}>%</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          
          {results && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Results</Text>
                <IconButton icon="chart-line" size={20} />
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Revenue</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={styles.resultValue}>{formatCurrency(results.revenue)}</Text>
                  <IconButton 
                    icon="content-copy" 
                    size={16} 
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Cost of goods sold</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={styles.resultValue}>{formatCurrency(results.costOfGoodsSold)}</Text>
                  <IconButton 
                    icon="content-copy" 
                    size={16} 
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
              </View>
              
              {calculatorMode === 'professional' && (
                <>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Gross profit</Text>
                    <View style={styles.resultValueContainer}>
                      <Text style={[
                        styles.resultValue, 
                        {color: results.grossProfit >= 0 ? '#4CAF50' : '#F44336'}
                      ]}>
                        {formatCurrency(results.grossProfit)}
                      </Text>
                      <IconButton icon="content-copy" size={16} />
                    </View>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Gross margin</Text>
                    <View style={styles.resultValueContainer}>
                      <Text style={[
                        styles.resultValue, 
                        {color: results.grossMargin >= 0 ? '#4CAF50' : '#F44336'}
                      ]}>
                        {formatPercentage(results.grossMargin)}
                      </Text>
                      <IconButton icon="content-copy" size={16} />
                    </View>
                  </View>
                </>
              )}
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Net profit margin</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[
                    styles.resultValue, 
                    {color: results.netProfitMargin >= 0 ? '#4CAF50' : '#F44336'}
                  ]}>
                    {formatPercentage(results.netProfitMargin)}
                  </Text>
                  <IconButton 
                    icon="content-copy" 
                    size={16} 
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Net profit</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[
                    styles.resultValue, 
                    {color: results.netProfit >= 0 ? '#4CAF50' : '#F44336'}
                  ]}>
                    {formatCurrency(results.netProfit)}
                  </Text>
                  <IconButton 
                    icon="content-copy" 
                    size={16} 
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
              </View>
              
              <Divider style={styles.divider} />
              <Text style={styles.additionalMetricsLabel}>Additional metrics</Text>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Cost of investment</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={styles.resultValue}>{formatCurrency(results.investment)}</Text>
                  <IconButton 
                    icon="content-copy" 
                    size={16} 
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Return on investment</Text>
                <View style={styles.resultValueContainer}>
                  <Text style={[
                    styles.resultValue, 
                    {color: results.roi >= 0 ? '#4CAF50' : '#F44336'}
                  ]}>
                    {formatPercentage(results.roi)}
                  </Text>
                  <IconButton 
                    icon="content-copy" 
                    size={16} 
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                  />
                </View>
              </View>
              
              {calculatorMode === 'professional' && results.breakEvenUnits > 0 && (
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Break-even units</Text>
                  <View style={styles.resultValueContainer}>
                    <Text style={styles.resultValue}>{Math.ceil(results.breakEvenUnits)}</Text>
                    <IconButton icon="content-copy" size={16} />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2196F3',
  },
  cardActions: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#757575',
    paddingRight: 8,
  },
  percentSymbol: {
    fontSize: 16,
    color: '#757575',
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#212121',
  },
  quantityButtons: {
    flexDirection: 'row',
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  advancedSection: {
    marginTop: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultLabel: {
    fontSize: 14,
    color: '#757575',
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  divider: {
    marginVertical: 16,
  },
  additionalMetricsLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
});
