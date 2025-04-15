import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgressIndicator from 'react-native-circular-progress-indicator';
import { MotiView } from 'moti';
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
  const { colors, isDarkMode, spacing, roundness } = useTheme();
  
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
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        style={styles.progressContainer}
      >
        <CircularProgressIndicator
          value={netProfitPercentage > 0 ? netProfitPercentage : 0}
          radius={90}
          duration={1500}
          progressValueColor={colors.text}
          maxValue={100}
          title={'Net Profit'}
          titleColor={colors.textSecondary}
          titleStyle={{ fontWeight: '600', fontSize: 14 }}
          subtitle={formatCurrency(data.netProfit)}
          subtitleColor={data.netProfit >= 0 ? colors.success : colors.error}
          subtitleStyle={{ fontWeight: 'bold', fontSize: 18 }}
          activeStrokeColor={data.netProfit >= 0 ? colors.success : colors.error}
          inActiveStrokeColor={colors.borderLight}
          inActiveStrokeOpacity={0.2}
          inActiveStrokeWidth={12}
          activeStrokeWidth={12}
          valueSuffix="%"
          progressValueStyle={{ fontWeight: '600', fontSize: 24 }}
        />
      </MotiView>
      
      <View style={styles.legendContainer}>
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 200 }}
        >
          <View style={[styles.legendRow, { backgroundColor: colors.surfaceVariant, borderRadius: roundness.md }]}>
            <View style={[styles.legendColorBox, { backgroundColor: colors.success }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Net Profit: {formatPercentage(netProfitPercentage)}
            </Text>
            <Text style={[styles.legendValue, { color: data.netProfit >= 0 ? colors.success : colors.error }]}>
              {formatCurrency(data.netProfit)}
            </Text>
          </View>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 300 }}
        >
          <View style={[styles.legendRow, { backgroundColor: colors.surfaceVariant, borderRadius: roundness.md }]}>
            <View style={[styles.legendColorBox, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Cost of Goods: {formatPercentage(costPercentage)}
            </Text>
            <Text style={[styles.legendValue, { color: colors.text }]}>
              {formatCurrency(data.costOfGoodsSold)}
            </Text>
          </View>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 400 }}
        >
          <View style={[styles.legendRow, { backgroundColor: colors.surfaceVariant, borderRadius: roundness.md }]}>
            <View style={[styles.legendColorBox, { backgroundColor: colors.warning }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>
              Expenses: {formatPercentage(expensesPercentage)}
            </Text>
            <Text style={[styles.legendValue, { color: colors.text }]}>
              {formatCurrency(data.totalExpenses)}
            </Text>
          </View>
        </MotiView>
        
        {data.taxAmount > 0 && (
          <MotiView
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'timing', duration: 600, delay: 500 }}
          >
            <View style={[styles.legendRow, { backgroundColor: colors.surfaceVariant, borderRadius: roundness.md }]}>
              <View style={[styles.legendColorBox, { backgroundColor: colors.error }]} />
              <Text style={[styles.legendText, { color: colors.text }]}>
                Tax: {formatPercentage(taxPercentage)}
              </Text>
              <Text style={[styles.legendValue, { color: colors.text }]}>
                {formatCurrency(data.taxAmount)}
              </Text>
            </View>
          </MotiView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    width: '100%',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  legendContainer: {
    width: '100%',
    marginTop: 8,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-between',
    padding: 12,
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CircularProgressDisplay;