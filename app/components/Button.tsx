import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outlined' | 'text';
  color?: 'primary' | 'success' | 'error' | 'warning' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  animated?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  color = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  animated = true,
}) => {
  const { colors, roundness, spacing } = useTheme();

  // Size configurations
  const sizeStyles = {
    sm: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      fontSize: 14,
    },
    md: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      fontSize: 16,
    },
    lg: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontSize: 18,
    },
  };

  // Get gradient colors based on button color
  const getGradientColors = () => {
    return colors.gradient[color];
  };

  // Get text color based on variant and color
  const getTextColor = () => {
    if (variant === 'filled') {
      return color === 'neutral' ? colors.text : '#FFFFFF';
    }
    return colors[color];
  };

  // Get border color based on variant and color
  const getBorderColor = () => {
    if (variant === 'outlined') {
      return colors[color];
    }
    return 'transparent';
  };

  // Render button content
  const renderContent = () => {
    return (
      <>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={getTextColor()} 
            style={styles.loader} 
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && icon}
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: sizeStyles[size].fontSize,
                  marginLeft: icon && iconPosition === 'left' ? spacing.sm : 0,
                  marginRight: icon && iconPosition === 'right' ? spacing.sm : 0,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && icon}
          </>
        )}
      </>
    );
  };

  // Render button with appropriate styling
  const renderButton = () => {
    const buttonStyles = [
      styles.button,
      {
        paddingVertical: sizeStyles[size].paddingVertical,
        paddingHorizontal: sizeStyles[size].paddingHorizontal,
        borderRadius: roundness.md,
        borderWidth: variant === 'outlined' ? 1 : 0,
        borderColor: getBorderColor(),
        backgroundColor: 
          variant === 'filled' 
            ? (color === 'neutral' ? colors.surfaceVariant : colors[color]) 
            : 'transparent',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : undefined,
      },
      style,
    ];

    if (variant === 'filled' && color !== 'neutral') {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled || loading}
          style={styles.gradientContainer}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={buttonStyles}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={buttonStyles}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  };

  if (animated) {
    return (
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: disabled ? 1 : 1 }}
        transition={{ type: 'timing', duration: 100 }}
        style={fullWidth ? styles.fullWidth : undefined}
      >
        {renderButton()}
      </MotiView>
    );
  }

  return renderButton();
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  loader: {
    marginHorizontal: 8,
  },
});

export default Button;