import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';

interface QuantitySelectorProps {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  error?: string;
  enableHaptics?: boolean;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChangeText,
  label,
  error,
  enableHaptics = true,
  min = 0,
  max,
  step = 1,
  disabled = false,
}) => {
  const theme = useTheme();
  
  const handleIncrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.min(max !== undefined ? max : Infinity, currentValue + step);
    
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onChangeText(newValue.toString());
  };
  
  const handleDecrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(min, currentValue - step);
    
    if (enableHaptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onChangeText(newValue.toString());
  };
  
  return (
    <View style={styles.container}>
      <IconButton
        icon="minus"
        mode="contained"
        onPress={handleDecrement}
        disabled={disabled || parseFloat(value) <= min}
        style={styles.button}
      />
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        mode="outlined"
        error={!!error}
        disabled={disabled}
        style={styles.input}
      />
      <IconButton
        icon="plus"
        mode="contained"
        onPress={handleIncrement}
        disabled={disabled || (max !== undefined && parseFloat(value) >= max)}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    margin: 0,
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: 'transparent',
  },
});

export default QuantitySelector;