import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { colors, shadows } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.actions}>
            <Button
              title={cancelLabel}
              variant="outline"
              onPress={onCancel}
              disabled={loading}
              style={[styles.button, { marginRight: spacing.sm }]}
            />
            <Button
              title={confirmLabel}
              variant={isDestructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(32, 53, 53, 0.5)', // ink with 50% opacity
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadows.card,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.slate,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    flex: 1,
  }
});
