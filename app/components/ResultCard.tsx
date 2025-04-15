import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';
import { CalculationResult } from '../types';
import { formatCurrency, formatPercentage } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

interface ResultCardProps {
  result: CalculationResult;
  expanded?: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, expanded = false }) => {
  const { colors } = useTheme();
  const isProfitable = result.netProfitLoss > 0;
  
  const profitLossColor = isProfitable ? colors.success : colors.error;
  
  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Title 
        title="Trade Results" 
        titleStyle={[styles.cardTitle, { color: colors.text }]}
      />
      <Card.Content>
        <View style={styles.resultRow}>
          <Text variant="bodyMedium" style={{ color: colors.text }}>Net Profit/Loss:</Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.resultValue, { color: profitLossColor }]}
          >
            {formatCurrency(result.netProfitLoss)}
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text variant="bodyMedium" style={{ color: colors.text }}>Return on Investment:</Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.resultValue, { color: profitLossColor }]}
          >
            {formatPercentage(result.profitLossPercentage)}
          </Text>
        </View>
        
        {result.riskRewardRatio !== null && (
          <View style={styles.resultRow}>
            <Text variant="bodyMedium" style={{ color: colors.text }}>Risk/Reward Ratio:</Text>
            <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
              {result.riskRewardRatio.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={styles.resultRow}>
          <Text variant="bodyMedium" style={{ color: colors.text }}>Break-even Price:</Text>
          <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
            {formatCurrency(result.breakEvenPrice)}
          </Text>
        </View>
        
        {expanded && (
          <>
            <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium" style={{ color: colors.text }}>Position Value:</Text>
              <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
                {formatCurrency(result.positionValue)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium" style={{ color: colors.text }}>Total Costs:</Text>
              <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
                {formatCurrency(result.totalCosts)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium" style={{ color: colors.text }}>Required Price Movement:</Text>
              <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
                {formatCurrency(result.requiredPriceMovement)}
              </Text>
            </View>
            
            {result.maxDrawdown !== null && (
              <View style={styles.resultRow}>
                <Text variant="bodyMedium" style={{ color: colors.text }}>Maximum Drawdown:</Text>
                <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
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
