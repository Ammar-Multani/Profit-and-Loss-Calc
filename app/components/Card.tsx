import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  glassmorphism?: boolean;
  animated?: boolean;
  fromOpacity?: number;
  fromScale?: number;
  delay?: number;
  duration?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'sm',
  glassmorphism = false,
  animated = false,
  fromOpacity = 0,
  fromScale = 0.95,
  delay = 0,
  duration = 500,
}) => {
  const { colors, isDarkMode, roundness, elevation: elevationValues } = useTheme();

  const elevationValue = elevationValues[elevation];
  
  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: glassmorphism 
            ? 'transparent'
            : isDarkMode 
              ? colors.surfaceElevated 
              : colors.surface,
          borderRadius: roundness.lg,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {glassmorphism && (
        <BlurView
          intensity={isDarkMode ? 20 : 50}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (animated) {
    return (
      <Shadow
        distance={elevationValue * 2}
        startColor={`${colors.shadow}10`}
        endColor={`${colors.shadow}00`}
        offset={[0, elevationValue]}
        style={styles.shadow}
      >
        <MotiView
          from={{
            opacity: fromOpacity,
            scale: fromScale,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: 'timing',
            duration: duration,
            delay: delay,
          }}
        >
          {cardContent}
        </MotiView>
      </Shadow>
    );
  }

  return (
    <Shadow
      distance={elevationValue * 2}
      startColor={`${colors.shadow}10`}
      endColor={`${colors.shadow}00`}
      offset={[0, elevationValue]}
      style={styles.shadow}
    >
      {cardContent}
    </Shadow>
  );
};

const styles = StyleSheet.create({
  shadow: {
    width: '100%',
  },
  card: {
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
});

export default Card;