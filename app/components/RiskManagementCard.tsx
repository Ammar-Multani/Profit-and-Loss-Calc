import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';
import CalculatorInput from './CalculatorInput';
import { formatCurrency } from '../utils/calculations';
import { useTheme } from '../context/ThemeContext';

interface RiskManagementCardProps {
  entryPrice: string;
  stopLoss: string;
  setStopLoss: (value: string) => void;
  takeProfit: string;
  setTakeProfit: (value: string) => void;
  quantity: string;
}

const RiskManagementCard: React.FC<RiskManagementCardProps> = ({
  entryPrice,
  stopLoss,
  setStopLoss,
  takeProfit,
  setTakeProfit,
  quantity,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [accountSize, setAccountSize] = useState('10000');
  const [riskPercentage, setRiskPercentage] = useState('1');
  const { colors } = useTheme();
  
  const entryPriceNum = parseFloat(entryPrice) || 0;
  const stopLossNum = parseFloat(stopLoss) || 0;
  const takeProfitNum = parseFloat(takeProfit) || 0;
  const quantityNum = parseFloat(quantity) || 0;
  const accountSizeNum = parseFloat(accountSize) || 0;
  const riskPercentageNum = parseFloat(riskPercentage) || 0;
  
  const riskAmount = accountSizeNum * (riskPercentageNum / 100);
  const riskPerShare = stopLossNum > 0 ? Math.abs(entryPriceNum - stopLossNum) : 0;
  const suggestedPositionSize = riskPerShare > 0 ? riskAmount / riskPerShare : 0;
  const actualRiskAmount = riskPerShare * quantityNum;
  const actualRiskPercentage = accountSizeNum > 0 ? (actualRiskAmount / accountSizeNum) * 100 : 0;
  const rewardAmount = takeProfitNum > 0 ? Math.abs(takeProfitNum - entryPriceNum) * quantityNum : 0;
  const riskRewardRatio = actualRiskAmount > 0 ? rewardAmount / actualRiskAmount : 0;
  
  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Title 
        title="Risk Management" 
        titleStyle={[styles.cardTitle, { color: colors.text }]}
        right={(props) => (
          <Text 
            {...props} 
            onPress={() => setExpanded(!expanded)}
            style={[styles.expandButton, { color: colors.primary }]}
          >
            {expanded ? 'Hide' : 'Show'}
          </Text>
        )}
        onPress={() => setExpanded(!expanded)}
      />
      
      <Card.Content>
        <View style={styles.inputRow}>
          <CalculatorInput
            label="Stop Loss"
            value={stopLoss}
            onChangeText={setStopLoss}
            keyboardType="decimal-pad"
            prefix="$"
            style={styles.input}
          />
          <CalculatorInput
            label="Take Profit"
            value={takeProfit}
            onChangeText={setTakeProfit}
            keyboardType="decimal-pad"
            prefix="$"
            style={styles.input}
          />
        </View>
        
        {expanded && (
          <>
            <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            
            <View style={styles.inputRow}>
              <CalculatorInput
                label="Account Size"
                value={accountSize}
                onChangeText={setAccountSize}
                keyboardType="decimal-pad"
                prefix="$"
                style={styles.input}
              />
              <CalculatorInput
                label="Risk Percentage"
                value={riskPercentage}
                onChangeText={setRiskPercentage}
                keyboardType="decimal-pad"
                suffix="%"
                style={styles.input}
              />
            </View>
            
            <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium" style={{ color: colors.text }}>Suggested Position Size:</Text>
              <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
                {suggestedPositionSize.toFixed(2)} shares
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium" style={{ color: colors.text }}>Risk Amount:</Text>
              <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
                {formatCurrency(actualRiskAmount)}
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium" style={{ color: colors.text }}>Risk Percentage:</Text>
              <Text 
                variant="bodyLarge" 
                style={[
                  styles.resultValue, 
                  { color: actualRiskPercentage > riskPercentageNum ? colors.error : colors.success }
                ]}
              >
                {actualRiskPercentage.toFixed(2)}%
              </Text>
            </View>
            
            <View style={styles.resultRow}>
              <Text variant="bodyMedium" style={{ color: colors.text }}>Risk/Reward Ratio:</Text>
              <Text variant="bodyLarge" style={[styles.resultValue, { color: colors.text }]}>
                1:{riskRewardRatio.toFixed(2)}
              </Text>
            </View>
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
  expandButton: {
    marginRight: 16,
    color: 'blue',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 12,
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
});

export default RiskManagementCard;
