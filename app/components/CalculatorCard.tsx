import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  interpolateColor,
  useSharedValue,
  withTiming 
} from 'react-native-reanimated';
import { Canvas, RoundedRect, LinearGradient as SkiaGradient } from '@shopify/react-native-skia';
import CalculatorInput from './CalculatorInput';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CalculatorCard = ({ values, onChange, onCalculate }) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.surface, theme.colors.primaryContainer]
    ),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    progress.value = withTiming(1);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    progress.value = withTiming(0);
  };

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
          <Animated.View style={[styles.container, cardStyle]}>
            <Canvas style={styles.canvas}>
              <RoundedRect
                x={0}
                y={0}
                width={CARD_WIDTH}
                height={400}
                r={24}
              >
                <SkiaGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: CARD_WIDTH, y: 400 }}
                  colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                />
              </RoundedRect>
            </Canvas>

            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.primary + '05']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            />

            <View style={styles.content}>
              <View style={styles.header}>
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'timing', duration: 800, delay: 200 }}
                >
                  <Text variant="headlineMedium" style={styles.title}>
                    Trade Calculator
                  </Text>
                </MotiView>
                <MaterialCommunityIcons
                  name="calculator-variant"
                  size={28}
                  color={theme.colors.primary}
                  style={styles.icon}
                />
              </View>

              <View style={styles.inputGroup}>
                {['entryPrice', 'exitPrice', 'quantity'].map((field, index) => (
                  <MotiView
                    key={field}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ type: 'timing', duration: 600, delay: 300 + index * 100 }}
                  >
                    <CalculatorInput
                      label={field === 'entryPrice' ? 'Entry Price' : field === 'exitPrice' ? 'Exit Price' : 'Quantity'}
                      value={values[field]}
                      onChangeText={(text) => onChange(field, text)}
                      keyboardType={field === 'quantity' ? 'number-pad' : 'decimal-pad'}
                      leftIcon={field === 'entryPrice' ? 'login-variant' : field === 'exitPrice' ? 'logout-variant' : 'numeric'}
                      prefix={field !== 'quantity' ? '$' : undefined}
                    />
                  </MotiView>
                ))}
              </View>

              <AnimatedPressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onCalculate}
                style={[styles.calculateButton]}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text variant="bodyLarge" style={styles.buttonText}>
                    Calculate
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color={theme.colors.onPrimary}
                  />
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </Animated.View>
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
    height: 400,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
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
  icon: {
    transform: [{ rotate: '-8deg' }],
  },
  inputGroup: {
    gap: 20,
  },
  calculateButton: {
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CalculatorCard;