import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={colors.mist} />
          </View>
          
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.message}>
            This is a demo application. Password recovery is not implemented. 
            Please try registering a new account or logging in with the seeded demo credentials.
          </Text>
          <Text style={styles.demoCreds}>
            Demo Organizer: org1@test.com / password123{'\n'}
            Demo Attendee: att1@test.com / password123
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.xxl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.mist,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.slate,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  demoCreds: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    textAlign: 'center',
    lineHeight: 22,
    backgroundColor: colors.mist,
    padding: spacing.lg,
    borderRadius: 8,
  }
});
