import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default' }) => {
  const getColors = () => {
    switch (variant) {
      case 'primary': return { bg: colors.primary, text: colors.white };
      case 'success': return { bg: colors.success, text: colors.white };
      case 'danger': return { bg: colors.danger, text: colors.white };
      case 'warning': return { bg: '#FFB300', text: colors.ink }; // A warning color just in case
      case 'default':
      default: return { bg: colors.mist, text: colors.deep };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.xs,
  },
});
