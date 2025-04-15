import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
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
  const screenWidth = Dimensions.get('window').width;
  
  // Determine if we have negative values
  const hasNegativeValues = data.netProfit < 0 || data.totalExpenses < 0;
  
  // Calculate the appropriate max value for the chart
  const positiveMax = Math.max(
    data.revenue, 
    data.costOfGoodsSold, 
    data.totalExpenses > 0 ? data.totalExpenses : 0, 
    data.netProfit > 0 ? data.netProfit : 0
  );
  
  // Calculate the appropriate min value for the chart
  const negativeMin = Math.min(
    0,
    data.netProfit < 0 ? data.netProfit : 0,
    data.totalExpenses < 0 ? data.totalExpenses : 0
  );
  
  // Add some padding to the max and min values
  const maxValue = positiveMax * 1.1;
  const minValue = hasNegativeValues ? negativeMin * 1.1 : undefined;
  
  const chartData = [
    {
      value: data.revenue,
      label: 'Revenue',
      frontColor: colors.primary,
      sideColor: colors.primary,
      topColor: colors.primary,
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.3)',
    },
    {
      value: data.costOfGoodsSold,
      label: 'COGS',
      frontColor: colors.error,
      sideColor: colors.error,
      topColor: colors.error,
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.3)',
    },
    {
      value: data.totalExpenses,
      label: 'Expenses',
      frontColor: colors.warning,
      sideColor: colors.warning,
      topColor: colors.warning,
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.3)',
    },
    {
      value: data.netProfit,
      label: 'Net Profit',
      frontColor: colors.success,
      sideColor: colors.success,
      topColor: colors.success,
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.3)',
    },
  ];

  // Format currency for display
  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return (
    <Card style={[styles.container, { backgroundColor: colors.surface }]}>
      <Card.Content>
        <Text style={[styles.title, { color: colors.text }]}>
          Financial Breakdown
        </Text>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            barWidth={Math.min(50, (screenWidth - 100) / 5)} // Responsive bar width
            spacing={Math.min(24, (screenWidth - 100) / 10)} // Responsive spacing
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={1}
            yAxisThickness={1}
            yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 9, width: 60, textAlign: 'center' }}
            labelWidth={60}
            label
            height={220}
            barBorderRadius={6}
            isAnimated
            animationDuration={800}
            noOfSections={5}
            maxValue={maxValue}
            minValue={minValue}
            yAxisOffset={5}
            showYAxisIndices={true}
            yAxisIndicesHeight={2}
            yAxisIndicesWidth={4}
            yAxisIndicesColor={colors.border}
            showFractionalValues={false}
            hideOrigin={false}
            rulesType="solid"
            rulesColor={colors.border}
            dashWidth={4}
            dashGap={8}
            renderTooltip={(item) => (
              <View style={[styles.tooltip, { 
                backgroundColor: colors.surface, 
                borderColor: colors.border,
                shadowColor: '#000000',
              }]}>
                <Text style={[styles.tooltipLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </Text>
                <Text style={[styles.tooltipValue, { 
                  color: item.value >= 0 ? item.frontColor : colors.error 
                }]}>
                  {item.value >= 0 ? '+' : '-'}{formatCurrency(item.value)}
                </Text>
              </View>
            )}
          />
        </View>
        <View style={styles.legend}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.frontColor }]} />
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
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    marginHorizontal: -10, // Give more space for the chart
    height: 250,
  },
  tooltip: {
    padding: 12,
    borderRadius: 8,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    minWidth: 120,
  },
  tooltipLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
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
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default ResultsChart;