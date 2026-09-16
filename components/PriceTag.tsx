import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface PriceTagProps {
  price: number;
}

export const PriceTag: React.FC<PriceTagProps> = ({ price }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.price}>
        {price === 0 ? 'Free' : `LKR ${price.toLocaleString()}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  price: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.deep,
  }
});
