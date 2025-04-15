import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedView = Animated.createAnimatedComponent(View);

const CalculatorInput = ({
  label,
  value,
  onChangeText,
  keyboardType,
  leftIcon,
  prefix,
  error,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      isFocused ? 1 : 0,
      [0, 1],
      [theme.colors.surfaceVariant, theme.colors.primaryContainer + '30']
    ),
    transform: [{ scale: withTiming(isFocused ? 1.02 : 1) }],
  }));

  return (
    <View style={styles.container}>
      <MotiView
        animate={{ translateX: isFocused ? 8 : 0 }}
        transition={{ type: 'timing', duration: 200 }}
      >
        <Text
          variant="bodyMedium"
          style={[
            styles.label,
            {
              color: isFocused
                ? theme.colors.primary
                : theme.colors.onSurfaceVariant,
            },
          ]}
        >
          {label}
        </Text>
      </MotiView>

      <AnimatedView style={[styles.inputContainer, containerStyle]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0.05)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <MaterialCommunityIcons
          name={leftIcon}
          size={20}
          color={
            isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant
          }
          style={styles.icon}
        />

        <View style={styles.inputWrapper}>
          {prefix && (
            <Text
              variant="bodyLarge"
              style={[
                styles.prefix,
                {
                  color: isFocused
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {prefix}
            </Text>
          )}
          <TextInput
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            style={[
              styles.input,
              {
                color: theme.colors.onSurface,
                fontFamily: theme.fonts.bodyLarge.fontFamily,
              },
            ]}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </View>
      </AnimatedView>

      {error && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Text
            variant="bodySmall"
            style={[styles.error, { color: theme.colors.error }]}
          >
            {error}
          </Text>
        </MotiView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    marginLeft: 4,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  icon: {
    marginRight: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    marginRight: 4,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  error: {
    marginLeft: 4,
  },
});

export default CalculatorInput;