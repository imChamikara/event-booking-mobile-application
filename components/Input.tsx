import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(({
  label,
  error,
  leftIcon,
  isPassword,
  style,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputFocused,
        !!error && styles.inputError,
        style
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? colors.primary : colors.slate} 
            style={styles.leftIcon} 
          />
        )}
        
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.slate}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIcon}
          >
            <Ionicons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={20} 
              color={colors.slate} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {!!error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  leftIcon: {
    marginLeft: spacing.md,
  },
  rightIcon: {
    padding: spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.ink,
    minHeight: 48,
  },
  errorText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
