import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Switch, Text, Divider } from 'react-native-paper';
import CalculatorInput from './CalculatorInput';
import { useTheme } from '../context/ThemeContext';

interface AdvancedOptionsProps {
  commission: string;
  setCommission: (value: string) => void;
  slippage: string;
  setSlippage: (value: string) => void;
  positionFees: string;
  setPositionFees: (value: string) => void;
  taxRate: string;
  setTaxRate: (value: string) => void;
  includeCommission: boolean;
  setIncludeCommission: (value: boolean) => void;
  includeSlippage: boolean;
  setIncludeSlippage: (value: boolean) => void;
  includePositionFees: boolean;
  setIncludePositionFees: (value: boolean) => void;
  includeTax: boolean;
  setIncludeTax: (value: boolean) => void;
}

const AdvancedOptionsCard: React.FC<AdvancedOptionsProps> = ({
  commission,
  setCommission,
  slippage,
  setSlippage,
  positionFees,
  setPositionFees,
  taxRate,
  setTaxRate,
  includeCommission,
  setIncludeCommission,
  includeSlippage,
  setIncludeSlippage,
  includePositionFees,
  setIncludePositionFees,
  includeTax,
  setIncludeTax,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  
  return (
    <Card style={[styles.card, { backgroundColor: colors.surface }]}>
      <Card.Title 
        title="Advanced Options" 
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
      
      {expanded && (
        <Card.Content>
          <View style={styles.optionRow}>
            <View style={styles.switchContainer}>
              <Text style={{ color: colors.text }}>Include Commission</Text>
              <Switch
                value={includeCommission}
                onValueChange={setIncludeCommission}
                color={colors.primary}
              />
            </View>
            <CalculatorInput
              label="Commission (%)"
              value={commission}
              onChangeText={setCommission}
              keyboardType="decimal-pad"
              suffix="%"
              disabled={!includeCommission}
            />
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          
          <View style={styles.optionRow}>
            <View style={styles.switchContainer}>
              <Text style={{ color: colors.text }}>Include Slippage</Text>
              <Switch
                value={includeSlippage}
                onValueChange={setIncludeSlippage}
                color={colors.primary}
              />
            </View>
            <CalculatorInput
              label="Slippage Cost"
              value={slippage}
              onChangeText={setSlippage}
              keyboardType="decimal-pad"
              prefix="$"
              disabled={!includeSlippage}
            />
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          
          <View style={styles.optionRow}>
            <View style={styles.switchContainer}>
              <Text style={{ color: colors.text }}>Include Position Fees</Text>
              <Switch
                value={includePositionFees}
                onValueChange={setIncludePositionFees}
                color={colors.primary}
              />
            </View>
            <CalculatorInput
              label="Position Fees"
              value={positionFees}
              onChangeText={setPositionFees}
              keyboardType="decimal-pad"
              prefix="$"
              disabled={!includePositionFees}
            />
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          
          <View style={styles.optionRow}>
            <View style={styles.switchContainer}>
              <Text style={{ color: colors.text }}>Include Tax</Text>
              <Switch
                value={includeTax}
                onValueChange={setIncludeTax}
                color={colors.primary}
              />
            </View>
            <CalculatorInput
              label="Tax Rate (%)"
              value={taxRate}
              onChangeText={setTaxRate}
              keyboardType="decimal-pad"
              suffix="%"
              disabled={!includeTax}
            />
          </View>
        </Card.Content>
      )}
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
  optionRow: {
    marginVertical: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
});

export default AdvancedOptionsCard;
