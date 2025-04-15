import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../context/ThemeContext';
import { Card } from 'react-native-paper';

interface ResultsChartProps {
  data: {
    revenue: number;
    costOfGoodsSold: number;
    totalExpenses: number;
    netProfit: number;
  };
}

const ResultsChart: React.FC<ResultsChartProps> = ({ data }) => {
  const { colors, isDarkMode } = useTheme();
  
  const chartData = [
    {
      value: data.revenue,
      label: 'Revenue',
      color: colors.primary,
      frontColor: colors.primary,
    },
    {
      value: data.costOfGoodsSold,
      label: 'COGS',
      color: colors.error,
      frontColor: colors.error,
    },
    {
      value: data.totalExpenses,
      label: 'Expenses',
      color: colors.warning,
      frontColor: colors.warning,
    },
    {
      value: data.netProfit,
      label: 'Net Profit',
      color: colors.success,
      frontColor: colors.success,
    },
  ];

  return (
    <Card style={[styles.container, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <Text style={[styles.title, { color: colors.text }]}>
          Financial Breakdown
        </Text>
        <BarChart
          data={chartData}
          barWidth={32}
          spacing={24}
          roundedTop
          roundedBottom
          hideRules
          xAxisThickness={2}
          yAxisThickness={2}
          yAxisTextStyle={{ color: colors.textSecondary }}
          xAxisTextStyle={{ color: colors.textSecondary }}
          labelWidth={85}
          label
          height={200}
          barBorderRadius={6}
          showGradient
          gradientColor={colors.background}
          activeOpacity={0.8}
          isAnimated
          animationDuration={500}
          noOfSections={5}
          maxValue={Math.max(...chartData.map(item => item.value)) * 1.1}
          renderTooltip={(item) => (
            <View style={[styles.tooltip, { 
              backgroundColor: colors.surface, 
              borderColor: colors.border,
              shadowColor: isDarkMode ? '#000000' : '#000000',
            }]}>
              <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
              <Text style={[styles.tooltipValue, { color: item.frontColor }]}>
                ${item.value.toFixed(2)}
              </Text>
            </View>
          )}
        />
        <View style={styles.legend}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    elevation: 2,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tooltip: {
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
  },
  tooltipLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  tooltipValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
});

export default ResultsChart;
