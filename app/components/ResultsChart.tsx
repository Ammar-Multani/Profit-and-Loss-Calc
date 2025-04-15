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
  const minValue = hasNegativeValues ? negativeMin * 1.1 : 0;
  
  const chartData = [
    {
      value: data.revenue,
      label: 'Revenue',
      frontColor: '#4285F4', // Google blue
      topColor: '#4285F4',
      sideColor: isDarkMode ? '#3367D6' : '#5A95F5',
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(66, 133, 244, 0.1)' : 'rgba(66, 133, 244, 0.3)',
    },
    {
      value: data.costOfGoodsSold,
      label: 'COGS',
      frontColor: '#EA4335', // Google red
      topColor: '#EA4335',
      sideColor: isDarkMode ? '#C53929' : '#F15749',
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(234, 67, 53, 0.1)' : 'rgba(234, 67, 53, 0.3)',
    },
    {
      value: data.totalExpenses,
      label: 'Expenses',
      frontColor: '#FBBC05', // Google yellow
      topColor: '#FBBC05',
      sideColor: isDarkMode ? '#F09300' : '#FCC934',
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(251, 188, 5, 0.1)' : 'rgba(251, 188, 5, 0.3)',
    },
    {
      value: data.netProfit,
      label: 'Net Profit',
      frontColor: '#34A853', // Google green
      topColor: '#34A853',
      sideColor: isDarkMode ? '#2A8745' : '#4CC066',
      showGradient: true,
      gradientColor: isDarkMode ? 'rgba(52, 168, 83, 0.1)' : 'rgba(52, 168, 83, 0.3)',
    },
  ];

  // Format currency for display
  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  // Format currency for y-axis labels (shorter format)
  const formatYAxisLabel = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(Math.abs(value) / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(Math.abs(value) / 1000).toFixed(1)}K`;
    } else {
      return `$${Math.abs(value)}`;
    }
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
            barWidth={Math.min(45, (screenWidth - 120) / 5)} // Responsive bar width
            spacing={Math.min(20, (screenWidth - 120) / 10)} // Responsive spacing
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
            yAxisLabelPrefix=""
            yAxisLabelSuffix=""
            formatYLabel={formatYAxisLabel}
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
    paddingBottom: 20, // Add padding for the legend
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