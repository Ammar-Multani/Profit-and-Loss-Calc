import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ResultItem = ({ label, value, type = 'neutral', icon }) => {
  const theme = useTheme();
  
  const getColor = () => {
    switch (type) {
      case 'positive':
        return theme.colors.success;
      case 'negative':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.onSurface;
    }
  };

  return (
    <MotiView
      style={[
        styles.resultItem,
        {
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: theme.roundness,
        },
      ]}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 400 }}
    >
      <View style={styles.resultHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={getColor()}
          style={styles.icon}
        />
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {label}
        </Text>
      </View>
      <Text
        variant="headlineMedium"
        style={[styles.value, { color: getColor() }]}
      >
        {value}
      </Text>
    </MotiView>
  );
};

const ResultsCard = ({ results }) => {
  const theme = useTheme();

  return (
    <Shadow distance={8} startColor="rgba(0, 0, 0, 0.05)" offset={[0, 4]}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
          },
        ]}
      >
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={{ color: theme.colors.onSurface }}
          >
            Results
          </Text>
          <MaterialCommunityIcons
            name="chart-box"
            size={24}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.resultsGrid}>
          <ResultItem
            label="Net Profit"
            value={`$${results.netProfit.toFixed(2)}`}
            type={results.netProfit >= 0 ? 'positive' : 'negative'}
            icon="cash"
          />
          <ResultItem
            label="ROI"
            value={`${results.roi.toFixed(2)}%`}
            type={results.roi >= 0 ? 'positive' : 'negative'}
            icon="chart-line"
          />
          <ResultItem
            label="Break-even Units"
            value={results.breakEvenUnits}
            type="warning"
            icon="scale-balance"
          />
          <ResultItem
            label="Total Investment"
            value={`$${results.investment.toFixed(2)}`}
            icon="wallet"
          />
        </View>
      </View>
    </Shadow>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  resultsGrid: {
    gap: 16,
  },
  resultItem: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  value: {
    fontWeight: '600',
  },
});

export default ResultsCard;