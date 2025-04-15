import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Animated,
} from 'react-native';
import { 
  Text, 
  IconButton,
  Divider,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';

import { calculateResults } from '../utils/calculations';
import { saveCalculation, getSettings } from '../utils/storage';
import { TradeCalculation } from '../types';
import { useTheme } from '../context/ThemeContext';
import CircularProgressDisplay from '../components/CircularProgressDisplay';
import Card from '../components/Card';
import Button from '../components/Button';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, isDarkMode, spacing, roundness } = useTheme();
  
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
  
  const fadeAnim1 = React.useRef(new Animated.Value(0)).current;
  const translateYAnim1 = React.useRef(new Animated.Value(20)).current;
  const fadeAnim2 = React.useRef(new Animated.Value(0)).current;
  const translateYAnim2 = React.useRef(new Animated.Value(20)).current;
  
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
  
  const renderResultsChart = () => {
    if (!results) return null;
    
    const chartData = {
      revenue: results.revenue,
      costOfGoodsSold: results.costOfGoodsSold,
      totalExpenses: results.totalExpenses,
      taxAmount: results.taxAmount,
      netProfit: results.netProfit
    };
    
    return <CircularProgressDisplay data={chartData} />;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <IconButton
              icon="account-outline"
              size={24}
              iconColor={colors.primary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                navigation.navigate('Settings' as never);
              }}
              style={styles.headerIcon}
            />
          </MotiView>
          
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 100 }}
          >
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Profit Calculator
            </Text>
          </MotiView>
          
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500 }}
          >
            <IconButton
              icon="history"
              size={24}
              iconColor={colors.primary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                navigation.navigate('History' as never);
              }}
              style={styles.headerIcon}
            />
          </MotiView>
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <Animated.View
            style={{
              opacity: fadeAnim1,
              transform: [{ translateY: translateYAnim1 }],
            }}
          >
            <Card elevation="md" animated>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.primary }]}>
                  Calculator
                </Text>
                <View style={styles.cardActions}>
                  <IconButton 
                    icon="refresh" 
                    size={20} 
                    iconColor={colors.primary} 
                    onPress={resetCalculator}
                  />
                  <IconButton 
                    icon="content-save" 
                    size={20} 
                    iconColor={colors.primary} 
                    onPress={saveToHistory}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Buying price
                </Text>
                <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={buyingPrice}
                    onChangeText={setBuyingPrice}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Selling price
                </Text>
                <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={sellingPrice}
                    onChangeText={setSellingPrice}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Expected sale units
                </Text>
                <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={units}
                    onChangeText={setUnits}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                  <View style={styles.quantityButtons}>
                    <IconButton 
                      icon="minus" 
                      size={16}
                      iconColor={colors.textSecondary}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                        const currentValue = parseInt(units) || 0;
                        if (currentValue > 0) {
                          setUnits((currentValue - 1).toString());
                        }
                      }}
                    />
                    <IconButton 
                      icon="plus" 
                      size={16}
                      iconColor={colors.textSecondary}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                        const currentValue = parseInt(units) || 0;
                        setUnits((currentValue + 1).toString());
                      }}
                    />
                  </View>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.advancedToggle}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                  setShowAdvanced(!showAdvanced);
                }}
              >
                <Text style={[styles.advancedToggleText, { color: colors.primary }]}>
                  {showAdvanced ? 'HIDE ADVANCED OPTIONS' : 'SHOW ADVANCED OPTIONS'}
                </Text>
                <IconButton 
                  icon={showAdvanced ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  iconColor={colors.primary}
                />
              </TouchableOpacity>
              
              {showAdvanced && (
                <MotiView
                  from={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ type: 'timing', duration: 300 }}
                  style={styles.advancedSection}
                >
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Operating expenses
                    </Text>
                    <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={operatingExpenses}
                        onChangeText={setOperatingExpenses}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <View style={styles.quantityButtons}>
                        <IconButton 
                          icon="minus" 
                          size={16}
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                            const currentValue = parseFloat(operatingExpenses) || 0;
                            if (currentValue > 0) {
                              setOperatingExpenses((currentValue - 1).toString());
                            }
                          }}
                        />
                        <IconButton 
                          icon="plus" 
                          size={16}
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                            const currentValue = parseFloat(operatingExpenses) || 0;
                            setOperatingExpenses((currentValue + 1).toString());
                          }}
                        />
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Buying expenses per unit
                    </Text>
                    <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={buyingExpensesPerUnit}
                        onChangeText={setBuyingExpensesPerUnit}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <IconButton 
                        icon="information-outline" 
                        size={20} 
                        iconColor={colors.textSecondary} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Selling expenses per unit
                    </Text>
                    <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={sellingExpensesPerUnit}
                        onChangeText={setSellingExpensesPerUnit}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <IconButton 
                        icon="information-outline" 
                        size={20} 
                        iconColor={colors.textSecondary} 
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                      Tax rate
                    </Text>
                    <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        value={taxRate}
                        onChangeText={setTaxRate}
                        keyboardType="decimal-pad"
                        placeholder="0"
                        placeholderTextColor={colors.placeholder}
                      />
                      <Text style={[styles.percentSymbol, { color: colors.textSecondary }]}>%</Text>
                    </View>
                  </View>
                </MotiView>
              )}
            </Card>
          </Animated.View>
          
          {results && (
            <Animated.View
              style={[
                styles.resultsCardContainer,
                {
                  opacity: fadeAnim2,
                  transform: [{ translateY: translateYAnim2 }],
                }
              ]}
            >
              <Card elevation="md" animated>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.primary }]}>
                    Results
                  </Text>
                  <IconButton 
                    icon={showChart ? "chart-box-outline" : "chart-donut"} 
                    size={20} 
                    iconColor={colors.primary} 
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackType.Light);
                      setShowChart(!showChart);
                    }}
                  />
                </View>
                
                {showChart ? (
                  <View style={styles.chartContainer}>
                    {renderResultsChart()}
                  </View>
                ) : (
                  <>
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Revenue
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[styles.resultValue, { color: colors.text }]}>
                          {formatCurrency(results.revenue)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Cost of goods sold
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[styles.resultValue, { color: colors.text }]}>
                          {formatCurrency(results.costOfGoodsSold)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Gross profit
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[
                          styles.resultValue, 
                          {color: results.grossProfit >= 0 ? colors.success : colors.error}
                        ]}>
                          {formatCurrency(results.grossProfit)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary} 
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Gross profit margin
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[
                          styles.resultValue, 
                          {color: results.grossProfitMargin >= 0 ? colors.success : colors.error}
                        ]}>
                          {formatPercentage(results.grossProfitMargin)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary} 
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    {showAdvanced && (
                      <>
                        <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                            Selling and operating expenses
                          </Text>
                          <View style={styles.resultValueContainer}>
                            <Text style={[styles.resultValue, {color: colors.error}]}>
                              {formatCurrency(results.totalExpenses)}
                            </Text>
                            <IconButton 
                              icon="content-copy" 
                              size={16} 
                              iconColor={colors.textSecondary} 
                              onPress={() => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              }}
                            />
                          </View>
                        </View>
                        
                        <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                            Operating profit
                          </Text>
                          <View style={styles.resultValueContainer}>
                            <Text style={[
                              styles.resultValue, 
                              {color: results.operatingProfit >= 0 ? colors.success : colors.error}
                            ]}>
                              {formatCurrency(results.operatingProfit)}
                            </Text>
                            <IconButton 
                              icon="content-copy" 
                              size={16} 
                              iconColor={colors.textSecondary} 
                              onPress={() => {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                              }}
                            />
                          </View>
                        </View>
                      </>
                    )}
                    
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Net profit margin
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[
                          styles.resultValue, 
                          {color: results.netProfitMargin >= 0 ? colors.success : colors.error}
                        ]}>
                          {formatPercentage(results.netProfitMargin)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    {showAdvanced && parseFloat(taxRate) > 0 && (
                      <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                          Tax amount
                        </Text>
                        <View style={styles.resultValueContainer}>
                          <Text style={[styles.resultValue, {color: colors.error}]}>
                            {formatCurrency(results.taxAmount)}
                          </Text>
                          <IconButton 
                            icon="content-copy" 
                            size={16} 
                            iconColor={colors.textSecondary} 
                            onPress={() => {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }}
                          />
                        </View>
                      </View>
                    )}
                    
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Net profit
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[
                          styles.resultValue, 
                          {color: results.netProfit >= 0 ? colors.success : colors.error}
                        ]}>
                          {formatCurrency(results.netProfit)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
                    
                    <Text style={[styles.additionalMetricsLabel, { color: colors.textSecondary }]}>
                      Additional metrics
                    </Text>
                    
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Cost of investment
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[styles.resultValue, { color: colors.text }]}>
                          {formatCurrency(results.investment)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    {results.breakEvenUnits > 0 && (
                      <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                          Break-even units
                        </Text>
                        <View style={styles.resultValueContainer}>
                          <Text style={[styles.resultValue, { color: colors.text }]}>
                            {results.breakEvenUnits}
                          </Text>
                          <IconButton 
                            icon="content-copy" 
                            size={16} 
                            iconColor={colors.textSecondary} 
                            onPress={() => {
                              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            }}
                          />
                        </View>
                      </View>
                    )}
                    
                    <View style={[styles.resultRow, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
                        Return on investment
                      </Text>
                      <View style={styles.resultValueContainer}>
                        <Text style={[
                          styles.resultValue, 
                          {color: results.roi >= 0 ? colors.success : colors.error}
                        ]}>
                          {formatPercentage(results.roi)}
                        </Text>
                        <IconButton 
                          icon="content-copy" 
                          size={16} 
                          iconColor={colors.textSecondary}
                          onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                          }}
                        />
                      </View>
                    </View>
                    
                    <View style={styles.actionButtonsContainer}>
                      <Button
                        title="Save to History"
                        onPress={saveToHistory}
                        icon={<IconButton icon="content-save-outline" size={18} iconColor="#FFFFFF" />}
                        iconPosition="left"
                        style={styles.actionButton}
                      />
                      <Button
                        title="Reset"
                        onPress={resetCalculator}
                        variant="outlined"
                        color="neutral"
                        icon={<IconButton icon="refresh" size={18} iconColor={colors.text} />}
                        iconPosition="left"
                        style={styles.actionButton}
                      />
                    </View>
                  </>
                )}
              </Card>
            </Animated.View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerIcon: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  currencySymbol: {
    fontSize: 16,
    paddingRight: 8,
  },
  percentSymbol: {
    fontSize: 16,
    paddingLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
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
  },
  advancedSection: {
    marginTop: 8,
    overflow: 'hidden',
  },
  resultsCardContainer: {
    marginTop: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  resultLabel: {
    fontSize: 14,
    flex: 1,
  },
  resultValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  additionalMetricsLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  chartContainer: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
