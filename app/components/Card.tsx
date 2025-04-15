import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Animated } from 'react-native';
import { Shadow } from 'react-native-shadow-2';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  glassmorphism?: boolean;
  animated?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'sm',
  glassmorphism = false,
  animated = false,
}) => {
  const { colors, isDarkMode, roundness, elevation: elevationValues } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (animated) {
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
    }
  }, [animated, fadeAnim, scaleAnim]);

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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {cardContent}
        </Animated.View>
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
