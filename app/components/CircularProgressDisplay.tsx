import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgressIndicator from 'react-native-circular-progress-indicator';
import { useTheme } from '../context/ThemeContext';

interface CircularProgressDisplayProps {
  data: {
    revenue: number;
    costOfGoodsSold: number;
    totalExpenses: number;
    taxAmount: number;
    netProfit: number;
  };
}

const CircularProgressDisplay: React.FC<CircularProgressDisplayProps> = ({ data }) => {
  const { colors, isDarkMode } = useTheme();
  
  // Calculate percentages
  const total = data.revenue;
  const netProfitPercentage = (data.netProfit / total) * 100;
  const costPercentage = (data.costOfGoodsSold / total) * 100;
  const expensesPercentage = (data.totalExpenses / total) * 100;
  const taxPercentage = (data.taxAmount / total) * 100;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <CircularProgressIndicator
          value={netProfitPercentage > 0 ? netProfitPercentage : 0}
          radius={80}
          duration={1500}
          progressValueColor={colors.text}
          maxValue={100}
          title={'Net Profit'}
          titleColor={colors.textSecondary}
          titleStyle={{ fontWeight: '500', fontSize: 14 }}
          subtitle={formatCurrency(data.netProfit)}
          subtitleColor={data.netProfit >= 0 ? colors.success : colors.error}
          subtitleStyle={{ fontWeight: 'bold' }}
          activeStrokeColor={data.netProfit >= 0 ? colors.success : colors.error}
          inActiveStrokeColor={colors.borderLight}
          inActiveStrokeOpacity={0.2}
          inActiveStrokeWidth={10}
          activeStrokeWidth={10}
        />
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendRow}>
          <View style={[styles.legendColorBox, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>
            Net Profit: {formatPercentage(netProfitPercentage)}
          </Text>
          <Text style={[styles.legendValue, { color: data.netProfit >= 0 ? colors.success : colors.error }]}>
            {formatCurrency(data.netProfit)}
          </Text>
        </View>
        
        <View style={styles.legendRow}>
          <View style={[styles.legendColorBox, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>
            Cost of Goods: {formatPercentage(costPercentage)}
          </Text>
          <Text style={[styles.legendValue, { color: colors.text }]}>
            {formatCurrency(data.costOfGoodsSold)}
          </Text>
        </View>
        
        <View style={styles.legendRow}>
          <View style={[styles.legendColorBox, { backgroundColor: colors.warning }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>
            Expenses: {formatPercentage(expensesPercentage)}
          </Text>
          <Text style={[styles.legendValue, { color: colors.text }]}>
            {formatCurrency(data.totalExpenses)}
          </Text>
        </View>
        
        {data.taxAmount > 0 && (
          <View style={styles.legendRow}>
            <View style={[styles.legendColorBox, { backgroundColor: colors.error }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Tax: {formatPercentage(taxPercentage)}
            </Text>
            <Text style={[styles.legendValue, { color: colors.text }]}>
              {formatCurrency(data.taxAmount)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  legendContainer: {
    width: '100%',
    marginTop: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CircularProgressDisplay;