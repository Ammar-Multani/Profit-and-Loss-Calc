import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
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
  const { colors, isDarkMode, spacing, roundness } = useTheme();
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const translateXAnim1 = React.useRef(new Animated.Value(-20)).current;
  const translateXAnim2 = React.useRef(new Animated.Value(-20)).current;
  const translateXAnim3 = React.useRef(new Animated.Value(-20)).current;
  const translateXAnim4 = React.useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    // Animate the chart
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate the legend items with staggered delays
    Animated.stagger(100, [
      Animated.timing(translateXAnim1, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim2, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim3, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim4, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, translateXAnim1, translateXAnim2, translateXAnim3, translateXAnim4]);
  
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
      <Animated.View
        style={[
          styles.progressContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
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
      </Animated.View>
      
      <View style={styles.legendContainer}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim1 }],
          }}
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
        </Animated.View>
        
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim2 }],
          }}
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
        </Animated.View>
        
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim3 }],
          }}
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
        </Animated.View>
        
        {data.taxAmount > 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateX: translateXAnim4 }],
            }}
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
          </Animated.View>
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
