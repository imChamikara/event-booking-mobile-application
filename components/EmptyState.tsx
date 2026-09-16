import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = 'search-outline', 
  title, 
  message, 
  actionLabel, 
  onAction 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={colors.mist} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {!!message && (
        <Text style={styles.message}>{message}</Text>
      )}
      
      {!!actionLabel && onAction && (
        <Button 
          title={actionLabel} 
          onPress={onAction} 
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.mist,
  },
  title: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.slate,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionButton: {
    minWidth: 160,
  }
});
