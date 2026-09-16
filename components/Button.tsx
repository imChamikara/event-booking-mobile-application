import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacityProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    if (disabled || loading) return colors.disabled;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.mist;
      case 'outline': return 'transparent';
      case 'danger': return colors.danger;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return colors.slate;
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.white;
      case 'secondary':
      case 'outline':
        return colors.ink;
      default:
        return colors.white;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return spacing.sm;
      case 'lg': return spacing.lg;
      case 'md':
      default: return spacing.md;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          paddingVertical: getPadding(),
          paddingHorizontal: spacing.xl,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: disabled ? colors.disabled : colors.primary,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: size === 'sm' ? typography.sizes.sm : typography.sizes.md,
                marginLeft: leftIcon ? spacing.sm : 0,
                marginRight: rightIcon ? spacing.sm : 0,
              },
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    minHeight: 44, // Accessible touch target
  },
  text: {
    fontFamily: typography.fonts.semiBold,
    textAlign: 'center',
  },
});
