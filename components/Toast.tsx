import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ToastType } from '../contexts/ToastContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, visible, onHide, duration = 3000 }) => {
  const insets = useSafeAreaInsets();
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: insets.top + spacing.md,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      if (visible) onHide();
    });
  };

  if (!visible && opacity.toString() === '0') return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'info': default: return 'information-circle';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return colors.success;
      case 'error': return colors.danger;
      case 'info': default: return colors.primary;
    }
  };

  return (
    <Animated.View style={[
      styles.container, 
      { 
        transform: [{ translateY }],
        opacity 
      }
    ]}>
      <View style={[styles.content, { borderLeftColor: getColor() }]}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
    ...shadows.card,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.sm,
    borderLeftWidth: 4,
  },
  text: {
    flex: 1,
    marginLeft: spacing.md,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  }
});
