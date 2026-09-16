import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useEvent } from '../../hooks/useEvents';
import { useCreateBooking } from '../../hooks/useBookings';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StepIndicator } from '../../components/StepIndicator';

const bookingSchema = z.object({
  attendee_name: z.string().min(2, 'Name is required'),
  attendee_email: z.string().email('Invalid email address'),
  attendee_phone: z.string().min(10, 'Valid phone number is required'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function NewBookingScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { state } = useAuth();
  const { showToast } = useToast();
  
  const { data: event, isLoading: isLoadingEvent } = useEvent(eventId as string);
  const createBooking = useCreateBooking();

  const [step, setStep] = useState(1);
  const [seats, setSeats] = useState(1);

  const { control, handleSubmit, formState: { errors } } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      attendee_name: state.user?.name || '',
      attendee_email: state.user?.email || '',
      attendee_phone: '',
      notes: '',
    }
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      const response = await createBooking.mutateAsync({
        event_id: eventId as string,
        seats,
        ...data,
      });
      
      showToast({ message: 'Booking confirmed!', type: 'success' });
      router.replace(`/booking/${response.id}`);
    } catch (error: any) {
      showToast({ 
        message: error.response?.data?.error?.message || 'Failed to create booking', 
        type: 'error' 
      });
    }
  };

  if (isLoadingEvent || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const availableSeats = event.total_seats - event.booked_seats;
  const maxSeats = Math.min(10, availableSeats);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Checkout</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <StepIndicator currentStep={step} totalSteps={2} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 ? (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Select Tickets</Text>
            
            <View style={styles.ticketSelector}>
              <View>
                <Text style={styles.ticketType}>General Admission</Text>
                <Text style={styles.ticketPrice}>
                  {event.price === 0 ? 'Free' : `LKR ${event.price.toLocaleString()}`}
                </Text>
              </View>
              
              <View style={styles.counter}>
                <TouchableOpacity 
                  style={[styles.counterBtn, seats <= 1 && styles.counterBtnDisabled]}
                  onPress={() => setSeats(Math.max(1, seats - 1))}
                  disabled={seats <= 1}
                >
                  <Ionicons name="remove" size={20} color={seats <= 1 ? colors.slate : colors.ink} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{seats}</Text>
                <TouchableOpacity 
                  style={[styles.counterBtn, seats >= maxSeats && styles.counterBtnDisabled]}
                  onPress={() => setSeats(Math.min(maxSeats, seats + 1))}
                  disabled={seats >= maxSeats}
                >
                  <Ionicons name="add" size={20} color={seats >= maxSeats ? colors.slate : colors.ink} />
                </TouchableOpacity>
              </View>
            </View>
            
            {availableSeats < 10 && (
              <Text style={styles.warningText}>
                Only {availableSeats} {availableSeats === 1 ? 'seat' : 'seats'} remaining!
              </Text>
            )}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{seats} x Ticket</Text>
                <Text style={styles.summaryValue}>LKR {(seats * event.price).toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes & Fees</Text>
                <Text style={styles.summaryValue}>LKR 0</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>LKR {(seats * event.price).toLocaleString()}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text style={styles.sectionTitle}>Attendee Information</Text>
            
            <Controller
              control={control}
              name="attendee_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  leftIcon="person-outline"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.attendee_name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="attendee_email"
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
                  error={errors.attendee_email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="attendee_phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Phone Number"
                  placeholder="0771234567"
                  leftIcon="call-outline"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.attendee_phone?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Special Requests (Optional)"
                  placeholder="Dietary requirements, accessibility needs..."
                  leftIcon="document-text-outline"
                  multiline
                  numberOfLines={3}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  style={{ minHeight: 80, alignItems: 'flex-start', paddingTop: spacing.sm }}
                />
              )}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step === 1 ? (
          <Button
            title="Continue to Details"
            onPress={() => setStep(2)}
          />
        ) : (
          <View style={styles.footerButtons}>
            <Button
              title="Back"
              variant="secondary"
              onPress={() => setStep(1)}
              style={styles.backBtn}
            />
            <Button
              title={`Pay LKR ${(seats * event.price).toLocaleString()}`}
              onPress={handleSubmit(onSubmit)}
              loading={createBooking.isPending}
              style={styles.payBtn}
            />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  ticketSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    marginBottom: spacing.sm,
  },
  ticketType: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginBottom: 4,
  },
  ticketPrice: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnDisabled: {
    opacity: 0.5,
  },
  counterValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginHorizontal: spacing.md,
    minWidth: 20,
    textAlign: 'center',
  },
  warningText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.danger,
    marginBottom: spacing.xl,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radii.md,
    ...shadows.card,
    marginTop: spacing.xl,
  },
  summaryTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  summaryValue: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.mist,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    marginBottom: 0,
  },
  totalLabel: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  totalValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.primary,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  backBtn: {
    flex: 1,
  },
  payBtn: {
    flex: 2,
  }
});
