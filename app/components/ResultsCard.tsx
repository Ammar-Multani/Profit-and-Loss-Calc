import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Canvas, RoundedRect, LinearGradient as SkiaGradient } from '@shopify/react-native-skia';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const ResultItem = ({ label, value, type = 'neutral', icon, index }) => {
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
      from={{ opacity: 0, scale: 0.9, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: index * 100,
        damping: 15,
      }}
      style={[
        styles.resultItem,
        {
          backgroundColor: theme.colors.surfaceVariant + '80',
        },
      ]}
    >
      <LinearGradient
        colors={[getColor() + '10', getColor() + '05']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.resultHeader}>
        <MaterialCommunityIcons
          name={icon}
          size={24}
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
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 1000 }}
      style={styles.wrapper}
    >
      <Shadow
        distance={20}
        startColor="rgba(0, 0, 0, 0.08)"
        finalColor="rgba(0, 0, 0, 0)"
        offset={[0, 8]}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <Canvas style={styles.canvas}>
              <RoundedRect
                x={0}
                y={0}
                width={CARD_WIDTH}
                height={500}
                r={24}
              >
                <SkiaGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: CARD_WIDTH, y: 500 }}
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                />
              </RoundedRect>
            </Canvas>

            <View style={styles.content}>
              <View style={styles.header}>
                <Text
                  variant="headlineMedium"
                  style={[styles.title, { color: theme.colors.onSurface }]}
                >
                  Results
                </Text>
                <MaterialCommunityIcons
                  name="chart-box"
                  size={28}
                  color={theme.colors.primary}
                  style={styles.headerIcon}
                />
              </View>

              <View style={styles.resultsGrid}>
                <ResultItem
                  label="Net Profit"
                  value={`$${results.netProfit.toFixed(2)}`}
                  type={results.netProfit >= 0 ? 'positive' : 'negative'}
                  icon="cash"
                  index={0}
                />
                <ResultItem
                  label="ROI"
                  value={`${results.roi.toFixed(2)}%`}
                  type={results.roi >= 0 ? 'positive' : 'negative'}
                  icon="chart-line"
                  index={1}
                />
                <ResultItem
                  label="Break-even Units"
                  value={results.breakEvenUnits}
                  type="warning"
                  icon="scale-balance"
                  index={2}
                />
                <ResultItem
                  label="Total Investment"
                  value={`$${results.investment.toFixed(2)}`}
                  icon="wallet"
                  index={3}
                />
              </View>
            </View>
          </View>
        </BlurView>
      </Shadow>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    margin: 16,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  canvas: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: 500,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  title: {
    fontWeight: '700',
  },
  headerIcon: {
    transform: [{ rotate: '-8deg' }],
  },
  resultsGrid: {
    gap: 16,
  },
  resultItem: {
    padding: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 12,
  },
  value: {
    fontWeight: '700',
  },
});

export default ResultsCard;