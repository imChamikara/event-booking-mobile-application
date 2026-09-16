import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data.data;
      await signIn({ token, user });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      showToast({
        message: error.response?.data?.error?.message || 'Failed to login',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to EventHub to continue</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  leftIcon="mail-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  leftIcon="lock-closed-outline"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <View style={styles.forgotPasswordContainer}>
              <Link href="/(auth)/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.slate,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  footerText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  linkText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  }
});
