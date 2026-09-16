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
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { SafeAreaView } from 'react-native-safe-area-context';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^(\+94|0)[0-9]{9}$/, 'Invalid phone number format (e.g. 0771234567)'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'Password must contain at least one letter and one number'),
  confirmPassword: z.string(),
  role: z.enum(['attendee', 'organizer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'attendee',
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data.data;
      await signIn({ token, user });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      showToast({
        message: error.response?.data?.error?.message || 'Failed to register',
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join EventHub today</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>I am an</Text>
            <View style={styles.rolePicker}>
              <TouchableOpacity 
                style={[styles.roleOption, selectedRole === 'attendee' && styles.roleSelected]}
                onPress={() => setValue('role', 'attendee')}
              >
                <Text style={[styles.roleText, selectedRole === 'attendee' && styles.roleTextSelected]}>Attendee</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleOption, selectedRole === 'organizer' && styles.roleSelected]}
                onPress={() => setValue('role', 'organizer')}
              >
                <Text style={[styles.roleText, selectedRole === 'organizer' && styles.roleTextSelected]}>Organizer</Text>
              </TouchableOpacity>
            </View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  leftIcon="person-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="john@example.com"
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
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="0771234567"
                  leftIcon="call-outline"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.phone?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="Create a password"
                  leftIcon="lock-closed-outline"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  leftIcon="lock-closed-outline"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <Button
              title="Sign Up"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.submitBtn}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
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
  },
  header: {
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
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
    marginBottom: spacing.xl,
  },
  label: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  rolePicker: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.mist,
    borderRadius: radii.sm,
    padding: 4,
  },
  roleOption: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  roleSelected: {
    backgroundColor: colors.primary,
  },
  roleText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  roleTextSelected: {
    color: colors.white,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing.xl,
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
