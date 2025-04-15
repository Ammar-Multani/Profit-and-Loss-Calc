import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';

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

  return (
    <View style={styles.container}>
      <Text
        variant="bodyMedium"
        style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <MotiView
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surfaceVariant,
            borderColor: isFocused ? theme.colors.primary : 'transparent',
          },
        ]}
        animate={{
          borderWidth: isFocused ? 2 : 0,
          scale: isFocused ? 1.02 : 1,
        }}
        transition={{ type: 'timing', duration: 200 }}
      >
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
              style={[styles.prefix, { color: theme.colors.onSurfaceVariant }]}
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
      </MotiView>
      {error && (
        <Text
          variant="bodySmall"
          style={[styles.error, { color: theme.colors.error }]}
        >
          {error}
        </Text>
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
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