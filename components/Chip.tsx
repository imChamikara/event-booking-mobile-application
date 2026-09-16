import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, selected = false, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.chip, selected ? styles.selected : styles.unselected]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselected: {
    backgroundColor: colors.mist,
    borderColor: 'transparent',
  },
  text: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
  },
  textSelected: {
    color: colors.white,
  },
  textUnselected: {
    color: colors.ink,
  },
});
