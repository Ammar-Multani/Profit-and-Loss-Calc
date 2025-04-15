import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  TextInput as RNTextInput,
  Share
} from 'react-native';
import { 
  Appbar, 
  Card, 
  Button, 
  useTheme, 
  IconButton,
  FAB,
  Snackbar
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';

import CalculatorInput from '../components/CalculatorInput';
import QuantitySelector from '../components/QuantitySelector';
import AdvancedOptionsCard from '../components/AdvancedOptionsCard';
import ResultCard from '../components/ResultCard';
import RiskManagementCard from '../components/RiskManagementCard';
import { calculateResults, formatCurrency, formatPercentage } from '../utils/calculations';
import { saveCalculation, getSettings } from '../utils/storage';
import { TradeCalculation, CalculationResult } from '../types';
import { useTheme as useAppTheme } from '../context/ThemeContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  
  // Input refs for keyboard navigation
  const exitPriceRef = useRef<RNTextInput>(null);
  const quantityRef = useRef<RNTextInput>(null);
  
  // Form state
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [commission, setCommission] = useState('0.1');
  const [slippage, setSlippage] = useState('0');
  const [positionFees, setPositionFees] = useState('0');
  const [taxRate, setTaxRate] = useState('0');
  const [includeCommission, setIncludeCommission] = useState(true);
  const [includeSlippage, setIncludeSlippage] = useState(false);
  const [includePositionFees, setIncludePositionFees] = useState(false);
  const [includeTax, setIncludeTax] = useState(false);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [notes, setNotes] = useState('');
  
  // Validation state
  const [entryPriceError, setEntryPriceError] = useState('');
  const [exitPriceError, setExitPriceError] = useState('');
  const [quantityError, setQuantityError] = useState('');
  
  // Results state
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [showExpandedResults, setShowExpandedResults] = useState(false);
  
  // UI state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [enableHaptics, setEnableHaptics] = useState(true);
  
  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSettings();
      setCommission(settings.defaultCommission.toString());
      setSlippage(settings.defaultSlippage.toString());
      setPositionFees(settings.defaultPositionFees.toString());
      setTaxRate(settings.defaultTaxRate.toString());
      setIncludeCommission(settings.includeCommissionByDefault);
      setIncludeSlippage(settings.includeSlippageByDefault);
      setIncludePositionFees(settings.includePositionFeesByDefault);
      setIncludeTax(settings.includeTaxByDefault);
      setEnableHaptics(settings.enableHapticFeedback);
    };
    
    loadSettings();
  }, []);
  
  // Validate inputs
  const validateInputs = (): boolean => {
    let isValid = true;
    
    if (!entryPrice || isNaN(parseFloat(entryPrice)) || parseFloat(entryPrice) <= 0) {
      setEntryPriceError('Please enter a valid entry price');
      isValid = false;
    } else {
      setEntryPriceError('');
    }
    
    if (!exitPrice || isNaN(parseFloat(exitPrice)) || parseFloat(exitPrice) <= 0) {
      setExitPriceError('Please enter a valid exit price');
      isValid = false;
    } else {
      setExitPriceError('');
    }
    
    if (!quantity || isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setQuantityError('Please enter a valid quantity');
      isValid = false;
    } else {
      setQuantityError('');
    }
    
    return isValid;
  };
  
  // Calculate results
  const calculate = () => {
    if (!validateInputs()) {
      if (enableHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }
    
    if (enableHaptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    const calculation: TradeCalculation = {
      id: uuidv4(),
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      quantity: parseFloat(quantity),
      commission: parseFloat(commission),
      slippage: parseFloat(slippage),
      positionFees: parseFloat(positionFees),
      taxRate: parseFloat(taxRate),
      includeCommission,
      includeSlippage,
      includePositionFees,
      includeTax,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      timestamp: Date.now(),
      notes,
    };
    
    const result = calculateResults(calculation);
    setCalculationResult(result);
  };
  
  // Save calculation
  const saveToHistory = async () => {
    if (!calculationResult || !validateInputs()) {
      return;
    }
    
    try {
      const calculation: TradeCalculation = {
        id: uuidv4(),
        entryPrice: parseFloat(entryPrice),
        exitPrice: parseFloat(exitPrice),
        quantity: parseFloat(quantity),
        commission: parseFloat(commission),
        slippage: parseFloat(slippage),
        positionFees: parseFloat(positionFees),
        taxRate: parseFloat(taxRate),
        includeCommission,
        includeSlippage,
        includePositionFees,
        includeTax,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        timestamp: Date.now(),
        notes,
      };
      
      await saveCalculation(calculation);
      
      if (enableHaptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setSnackbarMessage('Calculation saved to history');
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error saving calculation:', error);
      setSnackbarMessage('Failed to save calculation');
      setSnackbarVisible(true);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setEntryPrice('');
    setExitPrice('');
    setQuantity('1');
    setStopLoss('');
    setTakeProfit('');
    setNotes('');
    setCalculationResult(null);
    setEntryPriceError('');
    setExitPriceError('');
    setQuantityError('');
    
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Share results
  const shareResults = async () => {
    if (!calculationResult) return;
    
    const isProfitable = calculationResult.netProfitLoss > 0;
    const profitLossText = isProfitable ? 'Profit' : 'Loss';
    
    const message = `
Trade Summary:
Entry Price: ${formatCurrency(parseFloat(entryPrice))}
Exit Price: ${formatCurrency(parseFloat(exitPrice))}
Quantity: ${quantity}

${profitLossText}: ${formatCurrency(calculationResult.netProfitLoss)}
ROI: ${formatPercentage(calculationResult.profitLossPercentage)}
Break-even Price: ${formatCurrency(calculationResult.breakEvenPrice)}

Calculated with Profit & Loss Calculator
    `;
    
    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error('Error sharing results:', error);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.Content title="Profit & Loss Calculator" />
          <Appbar.Action icon="history" onPress={() => navigation.navigate('History' as never)} />
          <Appbar.Action icon="cog" onPress={() => navigation.navigate('Settings' as never)} />
        </Appbar.Header>
        
        <ScrollView 
          style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title title="Trade Details" titleStyle={styles.cardTitle} />
            <Card.Content>
              <CalculatorInput
                label="Entry Price"
                value={entryPrice}
                onChangeText={setEntryPrice}
                keyboardType="decimal-pad"
                error={entryPriceError}
                prefix="$"
                autoFocus
                returnKeyType="next"
                onSubmitEditing={() => exitPriceRef.current?.focus()}
                blurOnSubmit={false}
              />
              
              <CalculatorInput
                label="Exit Price"
                value={exitPrice}
                onChangeText={setExitPrice}
                keyboardType="decimal-pad"
                error={exitPriceError}
                prefix="$"
                reference={exitPriceRef}
                returnKeyType="next"
                onSubmitEditing={() => quantityRef.current?.focus()}
                blurOnSubmit={false}
              />
              
              <QuantitySelector
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                error={quantityError}
                enableHaptics={enableHaptics}
                min={1}
              />
              
              <Button 
                mode="contained" 
                onPress={calculate}
                style={styles.calculateButton}
              >
                Calculate
              </Button>
            </Card.Content>
          </Card>
          
          <RiskManagementCard
            entryPrice={entryPrice}
            stopLoss={stopLoss}
            setStopLoss={setStopLoss}
            takeProfit={takeProfit}
            setTakeProfit={setTakeProfit}
            quantity={quantity}
          />
          
          <AdvancedOptionsCard
            commission={commission}
            setCommission={setCommission}
            slippage={slippage}
            setSlippage={setSlippage}
            positionFees={positionFees}
            setPositionFees={setPositionFees}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
            includeCommission={includeCommission}
            setIncludeCommission={setIncludeCommission}
            includeSlippage={includeSlippage}
            setIncludeSlippage={setIncludeSlippage}
            includePositionFees={includePositionFees}
            setIncludePositionFees={setIncludePositionFees}
            includeTax={includeTax}
            setIncludeTax={setIncludeTax}
          />
          
          {calculationResult && (
            <>
              <ResultCard 
                result={calculationResult} 
                expanded={showExpandedResults}
              />
              
              <View style={styles.resultActions}>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowExpandedResults(!showExpandedResults)}
                  style={styles.actionButton}
                >
                  {showExpandedResults ? 'Show Less' : 'Show More'}
                </Button>
                
                <Button 
                  mode="outlined" 
                  onPress={shareResults}
                  style={styles.actionButton}
                  icon="share"
                >
                  Share
                </Button>
                
                <Button 
                  mode="outlined" 
                  onPress={saveToHistory}
                  style={styles.actionButton}
                  icon="content-save"
                >
                  Save
                </Button>
              </View>
            </>
          )}
          
          <View style={styles.spacer} />
        </ScrollView>
        
        <FAB
          icon="refresh"
          style={[
            styles.fab,
            { 
              backgroundColor: theme.colors.primaryContainer,
              color: theme.colors.onPrimaryContainer
            }
          ]}
          onPress={resetForm}
          visible={!!calculationResult}
        />
        
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  calculateButton: {
    marginTop: 16,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  spacer: {
    height: 80,
  },
});
