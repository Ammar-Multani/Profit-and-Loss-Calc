import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { v4 as uuidv4 } from 'uuid';

import CalculatorCard from '../components/CalculatorCard';
import ResultsCard from '../components/ResultsCard';
import { saveCalculation } from '../utils/storage';
import { TradeCalculation } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  
  const [values, setValues] = useState({
    entryPrice: '',
    exitPrice: '',
    quantity: '',
  });
  
  const [results, setResults] = useState(null);

  const handleInputChange = (field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateResults = () => {
    const entryPrice = parseFloat(values.entryPrice) || 0;
    const exitPrice = parseFloat(values.exitPrice) || 0;
    const quantity = parseFloat(values.quantity) || 0;

    const investment = entryPrice * quantity;
    const revenue = exitPrice * quantity;
    const netProfit = revenue - investment;
    const roi = (netProfit / investment) * 100;
    const breakEvenUnits = Math.ceil(investment / exitPrice);

    setResults({
      netProfit,
      roi,
      breakEvenUnits,
      investment
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const saveToHistory = () => {
    if (!values.entryPrice || !values.exitPrice || !values.quantity) return;
    
    const calculation: TradeCalculation = {
      id: uuidv4(),
      entryPrice: parseFloat(values.entryPrice),
      exitPrice: parseFloat(values.exitPrice),
      quantity: parseFloat(values.quantity),
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
      notes: ''
    };
    
    saveCalculation(calculation);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <IconButton
            icon="account-outline"
            size={24}
            onPress={() => navigation.navigate('Settings' as never)}
          />
          <IconButton
            icon="file-pdf-box"
            size={24}
            onPress={saveToHistory}
          />
        </View>
        
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <CalculatorCard
            values={values}
            onChange={handleInputChange}
            onCalculate={calculateResults}
          />
          
          {results && (
            <ResultsCard results={results} />
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
  },
  scrollContent: {
    paddingBottom: 24,
  },
});