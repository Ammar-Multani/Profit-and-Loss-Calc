import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MotiView } from 'moti';
import { Shadow } from 'react-native-shadow-2';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CalculatorInput from './CalculatorInput';

const CalculatorCard = ({ values, onChange, onCalculate }) => {
  const theme = useTheme();

  return (
    <Shadow distance={8} startColor="rgba(0, 0, 0, 0.05)" offset={[0, 4]}>
      <MotiView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
          },
        ]}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 400 }}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={{ color: theme.colors.onSurface }}>
            Trade Calculator
          </Text>
          <MaterialCommunityIcons
            name="calculator-variant"
            size={24}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.inputGroup}>
          <CalculatorInput
            label="Entry Price"
            value={values.entryPrice}
            onChangeText={(text) => onChange('entryPrice', text)}
            keyboardType="decimal-pad"
            leftIcon="login-variant"
            prefix="$"
          />
          <CalculatorInput
            label="Exit Price"
            value={values.exitPrice}
            onChangeText={(text) => onChange('exitPrice', text)}
            keyboardType="decimal-pad"
            leftIcon="logout-variant"
            prefix="$"
          />
          <CalculatorInput
            label="Quantity"
            value={values.quantity}
            onChangeText={(text) => onChange('quantity', text)}
            keyboardType="number-pad"
            leftIcon="numeric"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.calculateButton,
            {
              backgroundColor: pressed
                ? theme.colors.primaryContainer
                : theme.colors.primary,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={onCalculate}
        >
          <Text
            variant="bodyLarge"
            style={[styles.buttonText, { color: theme.colors.onPrimary }]}
          >
            Calculate
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={theme.colors.onPrimary}
          />
        </Pressable>
      </MotiView>
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
  inputGroup: {
    gap: 16,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  buttonText: {
    fontWeight: '600',
  },
});

export default CalculatorCard;