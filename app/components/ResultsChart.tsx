import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface ResultsChartProps {
  data?: {
    revenue: number;
    netProfit: number;
    costOfGoodsSold: number;
    totalExpenses: number;
  };
}

const ResultsChart = ({ data }: ResultsChartProps) => {
  const { isDarkMode } = useTheme();

  if (!data) {
    return (
      <View style={styles.container}>
        <Text
          style={[
            styles.noDataText,
            { color: isDarkMode ? "#BBBBBB" : "#757575" },
          ]}
        >
          No data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.chartTitle,
          { color: isDarkMode ? "#FFFFFF" : "#333333" },
        ]}
      >
        Results Chart
      </Text>
      <Text
        style={[
          styles.description,
          { color: isDarkMode ? "#BBBBBB" : "#757575" },
        ]}
      >
        Chart visualization will appear here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    height: 200,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ResultsChart;
