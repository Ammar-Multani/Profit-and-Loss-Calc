import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider, useTheme } from 'react-native-paper';
import { CalculationResult } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';

interface ResultCardProps {
  result: CalculationResult;
  expanded?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, expanded = false }) => {
  const theme = useTheme();
  const isProfitable = result.netProfitLoss > 0;
  
  const profitLossColor = isProfitable 
    ? theme.colors.primary 
    : theme.colors.error;
  
  return (
    <Card style={styles.card}>
      <Card.Title 
        title="Trade Results" 
        titleStyle={styles.cardTitle}
      />
      <Card.Content>
        <View style={styles.resultRow}>
          <Text variant="bodyMedium">Net Profit/Loss:</Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.resultValue, { color: profitLossColor }]}
          >
            {formatCurrency(result.netProfitLoss)}
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text variant="bodyMedium">Return on Investment:</Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.resultValue, { color: profitLossColor }]}
          >
            {formatPercentage(result.profitLossPercentage)}
          </Text>
        </View>
        
        {result.riskRewardRatio !== null && (
          <View style={styles.resultRow}>
            <Text variant="bodyMedium">Risk/Reward Ratio:</Text>
            <Text variant="bodyLarge" style={styles.resultValue}>
              {result.riskRewardRatio.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={styles.resultRow}>
          <Text variant="bodyMedium">Break-even Price:</Text>
          <Text variant="bodyLarge" style={styles.resultValue}>
            {formatCurrency(result.breakEvenPrice)}
          </Text>
        </View>
        
        {expanded && (
          <>
            <Divider style={styles.divider} />
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium">Position Value:</Text>
              <Text variant="bodyLarge" style={styles.resultValue}>
                {formatCurrency(result.positionValue)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium">Total Costs:</Text>
              <Text variant="bodyLarge" style={styles.resultValue}>
                {formatCurrency(result.totalCosts)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium">Required Price Movement:</Text>
              <Text variant="bodyLarge" style={styles.resultValue}>
                {formatCurrency(result.requiredPriceMovement)}
              </Text>
            </View>
            
            {result.maxDrawdown !== null && (
              <View style={styles.resultRow}>
                <Text variant="bodyMedium">Maximum Drawdown:</Text>
                <Text variant="bodyLarge" style={styles.resultValue}>
                  {formatPercentage(result.maxDrawdown)}
                </Text>
              </View>
            )}
          </>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    elevation: 2,
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultValue: {
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
});

export default ResultCard;