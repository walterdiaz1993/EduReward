import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../config/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  containerStyle?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  containerStyle,
  disabled,
  ...props
}) => {
  const isPrimary = variant === 'primary';
  const buttonStyle: ViewStyle[] = [
    styles.button,
    isPrimary ? styles.primaryButton : styles.secondaryButton,
    disabled || isLoading ? styles.disabledButton : {},
    containerStyle || {},
  ];

  const textStyle: TextStyle[] = [
    styles.text,
    isPrimary ? styles.primaryText : styles.secondaryText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isLoading }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? theme.colors.white : theme.colors.primary}
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.transparent,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  text: {
    ...theme.typography.button,
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
});
export default Button;
