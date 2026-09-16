import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, shadows } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  }
});
