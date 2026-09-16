import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface SeatMeterProps {
  total: number;
  booked: number;
}

export const SeatMeter: React.FC<SeatMeterProps> = ({ total, booked }) => {
  const available = total - booked;
  const percentage = total > 0 ? (available / total) * 100 : 0;
  const isDanger = percentage < 10 && available > 0;
  const isSoldOut = available <= 0;

  const barColor = isSoldOut ? colors.slate : isDanger ? colors.danger : colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <Text style={[styles.text, { color: barColor }]}>
          {isSoldOut ? 'Sold Out' : `${available} of ${total} seats left`}
        </Text>
      </View>
      <View style={styles.barContainer}>
        <View 
          style={[
            styles.barFill, 
            { 
              width: `${Math.max(0, Math.min(100, percentage))}%`,
              backgroundColor: barColor 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  text: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
  },
  barContainer: {
    height: 8,
    backgroundColor: colors.mist,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: radii.pill,
  }
});
