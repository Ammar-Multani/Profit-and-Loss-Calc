import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../context/ThemeContext";
import Svg, { Circle, Path, G, Text as SvgText } from "react-native-svg";

interface CircularProgressDisplayProps {
  data: {
    revenue: number;
    costOfGoodsSold: number;
    totalExpenses: number;
    taxAmount: number;
    netProfit: number;
  };
}

const CircularProgressDisplay: React.FC<CircularProgressDisplayProps> = ({
  data,
}) => {
  const { isDarkMode } = useTheme();
  const screenWidth = Dimensions.get("window").width;
  const size = screenWidth * 0.7;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const innerRadius = radius * 0.65;

  // Calculate percentages safely
  const total = Math.max(data.revenue, 0.01);

  // Handle negative profit by calculating absolute values for the chart
  const netProfitAbs = Math.abs(data.netProfit);
  const isNetProfitNegative = data.netProfit < 0;

  // Recalculate percentages to ensure they sum to 100%
  let netProfitPercentage = (netProfitAbs / total) * 100;
  let costPercentage = (data.costOfGoodsSold / total) * 100;
  let expensesPercentage = (data.totalExpenses / total) * 100;
  const taxPercentage = (data.taxAmount / total) * 100;

  // If net profit is negative, it means costs are greater than revenue
  // Adjust the chart to show this correctly
  if (isNetProfitNegative) {
    // For negative profit, we need to normalize percentages to show a proper chart
    const totalWithoutProfit =
      costPercentage + expensesPercentage + taxPercentage;
    const scaleFactor = 100 / totalWithoutProfit;

    // Scale percentages to fill the chart (excluding negative profit)
    costPercentage *= scaleFactor;
    expensesPercentage *= scaleFactor;
  } else {
    // Ensure all segments add up to 100%
    const totalPercentage =
      netProfitPercentage + costPercentage + expensesPercentage + taxPercentage;
    if (totalPercentage > 0 && Math.abs(totalPercentage - 100) > 0.1) {
      const scaleFactor = 100 / totalPercentage;
      netProfitPercentage *= scaleFactor;
      costPercentage *= scaleFactor;
      expensesPercentage *= scaleFactor;
    }
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Colors for the donut chart
  const COLORS = {
    netProfit: isNetProfitNegative ? "#F44336" : "#8BC34A",
    cogs: "#B39B80", // Light brown from reference
    expenses: "#FFA07A", // Light salmon
    tax: "#F08080", // Light coral
  };

  // Function to create SVG arc path
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      centerX,
      centerY,
      "Z",
    ].join(" ");
  };

  // Function to convert polar coordinates to cartesian
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Calculate the angles for each segment
  let startAngle = 0;

  // Setup chart segments and labels
  const segments = [];
  const legendItems = [];

  // Add COGS segment
  const cogsEndAngle = startAngle + (costPercentage / 100) * 360;
  if (costPercentage > 0) {
    const cogsPath = createArc(startAngle, cogsEndAngle, radius);
    segments.push({
      path: cogsPath,
      color: COLORS.cogs,
    });

    legendItems.push({
      name: "Cost of goods sold",
      percentage: costPercentage,
      color: COLORS.cogs,
    });
  }

  // Update start angle for next segment
  startAngle = cogsEndAngle;

  // Add Expenses segment
  const expensesEndAngle = startAngle + (expensesPercentage / 100) * 360;
  if (expensesPercentage > 0) {
    const expensesPath = createArc(startAngle, expensesEndAngle, radius);
    segments.push({
      path: expensesPath,
      color: COLORS.expenses,
    });

    legendItems.push({
      name: "Selling and operating expenses",
      percentage: expensesPercentage,
      color: COLORS.expenses,
    });
  }

  // Update start angle for next segment
  startAngle = expensesEndAngle;

  // Add Tax segment if present
  if (taxPercentage > 0) {
    const taxEndAngle = startAngle + (taxPercentage / 100) * 360;
    const taxPath = createArc(startAngle, taxEndAngle, radius);
    segments.push({
      path: taxPath,
      color: COLORS.tax,
    });

    legendItems.push({
      name: "Tax",
      percentage: taxPercentage,
      color: COLORS.tax,
    });

    // Update start angle for next segment
    startAngle = taxEndAngle;
  }

  // Add Net Profit segment if not negative
  if (!isNetProfitNegative && netProfitPercentage > 0) {
    const netProfitEndAngle = startAngle + (netProfitPercentage / 100) * 360;
    const netProfitPath = createArc(startAngle, netProfitEndAngle, radius);
    segments.push({
      path: netProfitPath,
      color: COLORS.netProfit,
    });
  }

  // Always add net profit/loss to legend
  if (isNetProfitNegative) {
    legendItems.push({
      name: "Net loss",
      percentage: netProfitPercentage,
      color: COLORS.netProfit,
      isNegative: true,
    });
  } else {
    legendItems.push({
      name: "Net profit margin",
      percentage: netProfitPercentage,
      color: COLORS.netProfit,
    });
  }

  // Create donut chart by drawing a smaller circle in the middle
  const donutHolePath = `M ${centerX} ${centerY} m -${innerRadius}, 0 a ${innerRadius},${innerRadius} 0 1,0 ${
    innerRadius * 2
  },0 a ${innerRadius},${innerRadius} 0 1,0 -${innerRadius * 2},0`;

  // Find the largest segment for center label
  const largestSegment = Math.max(
    costPercentage,
    expensesPercentage,
    netProfitPercentage
  );
  let centerLabel = "";
  let centerLabelColor = COLORS.cogs;

  if (largestSegment === costPercentage) {
    centerLabel = `${Math.round(costPercentage)}%`;
    centerLabelColor = COLORS.cogs;
  } else if (largestSegment === expensesPercentage) {
    centerLabel = `${Math.round(expensesPercentage)}%`;
    centerLabelColor = COLORS.expenses;
  } else {
    centerLabel = `${Math.round(netProfitPercentage)}%`;
    centerLabelColor = COLORS.netProfit;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#252525" : "#FFFFFF" },
      ]}
    >
      <Text
        style={[styles.title, { color: isDarkMode ? "#90CAF9" : "#2196F3" }]}
      >
        Breakdown
      </Text>

      {isNetProfitNegative && (
        <Text style={[styles.warningText, { color: COLORS.netProfit }]}>
          Net Loss: {formatPercentage(Math.abs((data.netProfit / total) * 100))}
        </Text>
      )}

      <View style={styles.chartContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Draw all segments */}
          {segments.map((segment, index) => (
            <Path
              key={`segment-${index}`}
              d={segment.path}
              fill={segment.color}
            />
          ))}

          {/* Donut Hole */}
          <Path d={donutHolePath} fill={isDarkMode ? "#252525" : "#FFFFFF"} />

          {/* Center label for largest segment */}
          <SvgText
            x={centerX}
            y={centerY}
            fontSize={28}
            fontWeight="bold"
            fill="white"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {centerLabel}
          </SvgText>
        </Svg>
      </View>

      <View style={styles.legendContainer}>
        {legendItems.map((item, index) => (
          <View key={index} style={styles.legendRow}>
            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
            <Text
              style={[
                styles.legendText,
                { color: isDarkMode ? "#EEEEEE" : "#757575" },
              ]}
            >
              {item.name} ({item.isNegative ? "-" : ""}
              {Math.round(item.percentage).toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  warningText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  legendContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  colorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 15,
    fontWeight: "500",
  },
});

export default CircularProgressDisplay;
