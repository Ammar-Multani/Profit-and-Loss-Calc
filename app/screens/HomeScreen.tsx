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
  Divider
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DonutChart } from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';

import { calculateResults } from '../utils/calculations';
import { saveCalculation, getSettings } from '../utils/storage';
import { TradeCalculation } from '../types';
import { useTheme } from '../context/ThemeContext';
import ResultsChart from '../components/ResultsChart';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode } = useTheme();
  
  const [buyingPrice, setBuyingPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [units, setUnits] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [operatingExpenses, setOperatingExpenses] = useState('0');
  const [buyingExpensesPerUnit, setBuyingExpensesPerUnit] = useState('0');
  const [sellingExpensesPerUnit, setSellingExpensesPerUnit] = useState('0');
  const [taxRate, setTaxRate] = useState('0');
  
  const [calculatorMode, setCalculatorMode] = useState('standard');
  const [results, setResults] = useState(null);
  const [showChart, setShowChart] = useState(false);
  
  useEffect(() => {
    const loadCalculatorMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('calculatorMode');
        if (savedMode) {
          setCalculatorMode(savedMode);
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
    
    const revenue = sellPrice * quantity;
    const costOfGoodsSold = (buyPrice * quantity) + (buyExpenses * quantity);
    const grossProfit = revenue - costOfGoodsSold;
    const grossProfitMargin = (grossProfit / revenue) * 100;
    const totalExpenses = opExpenses + (sellExpenses * quantity);
    const operatingProfit = grossProfit - totalExpenses;
    const taxAmount = (operatingProfit * tax) / 100;
    const netProfit = operatingProfit - taxAmount;
    const netProfitMargin = (netProfit / revenue) * 100;
    const investment = costOfGoodsSold + totalExpenses;
    const roi = (netProfit / investment) * 100;
    
    const unitContribution = sellPrice - buyPrice - buyExpenses - sellExpenses;
    
    let breakEvenUnits = 0;
    if (unitContribution > 0) {
      breakEvenUnits = Math.ceil(opExpenses / unitContribution);
    }
    
    setResults({
      revenue,
      costOfGoodsSold,
      grossProfit,
      grossProfitMargin,
      totalExpenses,
      operatingProfit,
      netProfitMargin,
      taxAmount,
      netProfit,
      investment,
      roi,
      breakEvenUnits
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
    setShowChart(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };
  
  const getDonutChartData = () => {
    if (!results) return [];
    
    const total = results.revenue;
    
    return [
      {
        value: results.costOfGoodsSold,
        color: '#A0887E',
        text: `${((results.costOfGoodsSold / total) * 100).toFixed(2)}%`,
        name: 'Cost of goods sold'
      },
      {
        value: results.totalExpenses,
        color: '#FFA07A',
        text: `${((results.totalExpenses / total) * 100).toFixed(2)}%`,
        name: 'Selling and operating expenses'
      },
      {
        value: results.taxAmount,
        color: '#F08080',
        text: `${((results.taxAmount / total) * 100).toFixed(2)}%`,
        name: 'Taxes'
      },
      {
        value: results.netProfit,
        color: '#8FBC8F',
        text: `${((results.netProfit / total) * 100).toFixed(2)}%`,
        name: 'Net profit margin'
      }
    ];
  };
  
  const renderResultsChart = () => {
    if (!results) return null;
    
    const chartData = {
      revenue: results.revenue,
      costOfGoodsSold: results.costOfGoodsSold,
      totalExpenses: results.totalExpenses,
      netProfit: results.netProfit
    };
    
    return <ResultsChart data={chartData} />;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F5F5F5' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.header, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
          <IconButton
            icon="account-outline"
            size={24}
            iconColor={isDarkMode ? '#BBBBBB' : '#2196F3'}
            onPress={() => navigation.navigate('Settings' as never)}
          />
          <IconButton
            icon="file-pdf-box"
            size={24}
            iconColor={isDarkMode ? '#BBBBBB' : '#2196F3'}
            onPress={saveToHistory}
          />
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={[styles.mainCard, { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#90CAF9' : '#2196F3' }]}>Calculator</Text>
              <View style={styles.cardActions}>
                <IconButton icon="information-outline" size={20} iconColor={isDarkMode ? '#BBBBBB' : '#2196F3'} />
                <IconButton icon="calculator-variant" size={20} iconColor={isDarkMode ? '#BBBBBB' : '#2196F3'} />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Buying price</Text>
              <View style={[styles.inputContainer, { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
                <Text style={[styles.currencySymbol, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>$</Text>
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}
                  value={buyingPrice}
                  onChangeText={setBuyingPrice}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={isDarkMode ? '#555555' : '#AAAAAA'}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Selling price</Text>
              <View style={[styles.inputContainer, { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
                <Text style={[styles.currencySymbol, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>$</Text>
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}
                  value={sellingPrice}
                  onChangeText={setSellingPrice}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={isDarkMode ? '#555555' : '#AAAAAA'}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Expected sale units</Text>
              <View style={[styles.inputContainer, { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
                <TextInput
                  style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}
                  value={units}
                  onChangeText={setUnits}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={isDarkMode ? '#555555' : '#AAAAAA'}
                />
                <View style={styles.quantityButtons}>
                  <IconButton 
                    icon="minus" 
                    size={16}
                    iconColor={isDarkMode ? '#BBBBBB' : '#757575'}
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
                    iconColor={isDarkMode ? '#BBBBBB' : '#757575'}
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
              <Text style={[styles.advancedToggleText, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>ADVANCED</Text>
              <IconButton 
                icon={showAdvanced ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={isDarkMode ? '#BBBBBB' : '#757575'}
              />
            </TouchableOpacity>
            
            {showAdvanced && (
              <View style={styles.advancedSection}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Operating expenses</Text>
                  <View style={[styles.inputContainer, { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
                    <Text style={[styles.currencySymbol, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>$</Text>
                    <TextInput
                      style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}
                      value={operatingExpenses}
                      onChangeText={setOperatingExpenses}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={isDarkMode ? '#555555' : '#AAAAAA'}
                    />
                    <View style={styles.quantityButtons}>
                      <IconButton 
                        icon="minus" 
                        size={16}
                        iconColor={isDarkMode ? '#BBBBBB' : '#757575'}
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
                        iconColor={isDarkMode ? '#BBBBBB' : '#757575'}
                        onPress={() => {
                          const currentValue = parseFloat(operatingExpenses) || 0;
                          setOperatingExpenses((currentValue + 1).toString());
                        }}
                      />
                    </View>
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Buying expenses per unit</Text>
                  <View style={[styles.inputContainer, { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
                    <Text style={[styles.currencySymbol, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>$</Text>
                    <TextInput
                      style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}
                      value={buyingExpensesPerUnit}
                      onChangeText={setBuyingExpensesPerUnit}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={isDarkMode ? '#555555' : '#AAAAAA'}
                    />
                    <IconButton 
                      icon="dots-vertical" 
                      size={20} 
                      iconColor={isDarkMode ? '#BBBBBB' : '#757575'} 
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Selling expenses per unit</Text>
                  <View style={[styles.inputContainer, { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
                    <Text style={[styles.currencySymbol, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>$</Text>
                    <TextInput
                      style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}
                      value={sellingExpensesPerUnit}
                      onChangeText={setSellingExpensesPerUnit}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={isDarkMode ? '#555555' : '#AAAAAA'}
                    />
                    <IconButton 
                      icon="dots-vertical" 
                      size={20} 
                      iconColor={isDarkMode ? '#BBBBBB' : '#757575'} 
                    />
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Tax rate</Text>
                  <View style={[styles.inputContainer, { borderBottomColor: isDarkMode ? '#333333' : '#E0E0E0' }]}>
                    <TextInput
                      style={[styles.input, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}
                      value={taxRate}
                      onChangeText={setTaxRate}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={isDarkMode ? '#555555' : '#AAAAAA'}
                    />
                    <Text style={[styles.percentSymbol, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>%</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          
          {results && (
            <View style={[styles.mainCard, { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: isDarkMode ? '#90CAF9' : '#2196F3' }]}>Results</Text>
                <IconButton 
                  icon={showChart ? "chart-bar" : "chart-donut"} 
                  size={20} 
                  iconColor={isDarkMode ? '#90CAF9' : '#2196F3'} 
                  onPress={() => {
                    setShowChart(!showChart);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                />
              </View>
              
              {showChart ? (
                renderResultsChart()
              ) : (
                <>
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Revenue</Text>
                    <View style={styles.resultValueContainer}>
                      <Text style={[styles.resultValue, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}>
                        {formatCurrency(results.revenue)}
                      </Text>
                      <IconButton 
                        icon="content-copy" 
                        size={16} 
                        color="#757575"
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Cost of goods sold</Text>
                    <View style={styles.resultValueContainer}>
                      <Text style={[styles.resultValue, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}>
                        {formatCurrency(results.costOfGoodsSold)}
                      </Text>
                      <IconButton 
                        icon="content-copy" 
                        size={16} 
                        color="#757575"
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Gross profit</Text>
                    <View style={styles.resultValueContainer}>
                      <Text style={[
                        styles.resultValue, 
                        {color: results.grossProfit >= 0 ? '#4CAF50' : '#F44336'}
                      ]}>
                        {formatCurrency(results.grossProfit)}
                      </Text>
                      <IconButton icon="content-copy" size={16} color="#757575" />
                    </View>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Gross profit margin</Text>
                    <View style={styles.resultValueContainer}>
                      <Text style={[
                        styles.resultValue, 
                        {color: results.grossProfitMargin >= 0 ? '#4CAF50' : '#F44336'}
                      ]}>
                        {formatPercentage(results.grossProfitMargin)}
                      </Text>
                      <IconButton icon="content-copy" size={16} color="#757575" />
                    </View>
                  </View>
                  
                  {showAdvanced && (
                    <>
                      <View style={styles.resultRow}>
                        <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Selling and operating expenses</Text>
                        <View style={styles.resultValueContainer}>
                          <Text style={[styles.resultValue, {color: '#F44336'}]}>
                            {formatCurrency(results.totalExpenses)}
                          </Text>
                          <IconButton icon="content-copy" size={16} color="#757575" />
                        </View>
                      </View>
                      
                      <View style={styles.resultRow}>
                        <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Operating profit</Text>
                        <View style={styles.resultValueContainer}>
                          <Text style={[
                            styles.resultValue, 
                            {color: results.operatingProfit >= 0 ? '#4CAF50' : '#F44336'}
                          ]}>
                            {formatCurrency(results.operatingProfit)}
                          </Text>
                          <IconButton icon="content-copy" size={16} color="#757575" />
                        </View>
                      </View>
                    </>
                  )}
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Net profit margin</Text>
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
                        color="#757575"
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                      />
                    </View>
                  </View>
                  
                  {showAdvanced && parseFloat(taxRate) > 0 && (
                    <View style={styles.resultRow}>
                      <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Tax amount</Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[styles.resultValue, {color: '#F44336'}]}>
                          {formatCurrency(results.taxAmount)}
                        </Text>
                        <IconButton icon="content-copy" size={16} color="#757575" />
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Net profit</Text>
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
                        color="#757575"
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                      />
                    </View>
                  </View>
                  
                  <Divider style={[styles.divider, { backgroundColor: isDarkMode ? '#333333' : '#F0F0F0' }]} />
                  <Text style={[styles.additionalMetricsLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>
                    Additional metrics
                  </Text>
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Cost of investment</Text>
                    <View style={styles.resultValueContainer}>
                      <Text style={[styles.resultValue, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}>
                        {formatCurrency(results.investment)}
                      </Text>
                      <IconButton 
                        icon="content-copy" 
                        size={16} 
                        iconColor={isDarkMode ? '#BBBBBB' : '#757575'}
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                      />
                    </View>
                  </View>
                  
                  {results.breakEvenUnits > 0 && (
                    <View style={styles.resultRow}>
                      <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Break-even units</Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[styles.resultValue, { color: isDarkMode ? '#FFFFFF' : '#212121' }]}>
                          {results.breakEvenUnits}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={isDarkMode ? '#BBBBBB' : '#757575'} 
                        />
                      </View>
                    </View>
                  )}
                  
                  <View style={styles.resultRow}>
                    <Text style={[styles.resultLabel, { color: isDarkMode ? '#BBBBBB' : '#757575' }]}>Return on investment</Text>
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
                        color="#757575"
                        onPress={() => {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }}
                      />
                    </View>
                  </View>
                </>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2196F3',
  },
  cardActions: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 20,
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
    marginTop: 8,
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
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  donutChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  legendContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#757575',
  },
  simpleChartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  simpleDonut: {
    flexDirection: 'row',
    height: 30,
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 20,
  },
  donutSegment: {
    height: '100%',
  },
});
