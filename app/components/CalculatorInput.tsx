import React from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface CalculatorInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  prefix?: string;
  suffix?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  error?: string;
  info?: string;
  style?: object;
  testID?: string;
  icon?: string;
  disabled?: boolean;
  maxLength?: number;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  reference?: React.RefObject<RNTextInput>;
}

const CalculatorInput: React.FC<CalculatorInputProps> = ({
  label,
  value,
  onChangeText,
  prefix,
  suffix,
  keyboardType = 'decimal-pad',
  error,
  info,
  style,
  testID,
  icon,
  disabled = false,
  maxLength,
  onBlur,
  onFocus,
  placeholder,
  autoFocus = false,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  reference
}) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <TextInput
        ref={reference}
        label={label}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        mode="outlined"
        error={!!error}
        disabled={disabled}
        maxLength={maxLength}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        testID={testID}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        right={suffix ? <TextInput.Affix text={suffix} /> : undefined}
        left={prefix ? <TextInput.Affix text={prefix} /> : undefined}
        style={[styles.input, { backgroundColor: 'transparent' }]}
        theme={{ colors: { primary: colors.primary } }}
        textColor={colors.text}
        placeholderTextColor={colors.placeholder}
      />
      {(error || info) && (
        <HelperText
          type={error ? 'error' : 'info'}
          visible={!!(error || info)}
          style={[styles.helperText, { color: error ? colors.error : colors.textSecondary }]}
        >
          {error || info}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  helperText: {
    marginTop: -4,
    marginBottom: 4,
  },
});

export default CalculatorInput;
