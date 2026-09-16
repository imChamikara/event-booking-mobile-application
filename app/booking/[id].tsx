import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useBooking, useCancelBooking } from '../../hooks/useBookings';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';

export default function BookingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  
  const { data: booking, isLoading } = useBooking(id as string);
  const cancelBooking = useCancelBooking();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancel = async () => {
    setShowCancelConfirm(false);
    try {
      await cancelBooking.mutateAsync(id as string);
      showToast({ message: 'Booking cancelled successfully', type: 'success' });
    } catch (error) {
      showToast({ message: 'Failed to cancel booking', type: 'error' });
    }
  };

  if (isLoading || !booking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const { event } = booking;
  const isPast = new Date(event!.starts_at).getTime() < Date.now();
  const canCancel = booking.status === 'confirmed' && !isPast;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Image source={{ uri: event!.image_url }} style={styles.eventImage} contentFit="cover" />
            <View style={styles.ticketHeaderContent}>
              <Text style={styles.eventTitle} numberOfLines={2}>{event!.title}</Text>
              <Text style={styles.eventDate}>
                {format(new Date(event!.starts_at), 'MMM d, yyyy • h:mm a')}
              </Text>
            </View>
          </View>
          
          <View style={styles.divider}>
            <View style={styles.notchLeft} />
            <View style={styles.dashLine} />
            <View style={styles.notchRight} />
          </View>

          <View style={styles.qrSection}>
            <View style={[
              styles.qrContainer,
              booking.status === 'cancelled' && styles.qrCancelled
            ]}>
              <QRCode
                value={`eventhub://booking/${booking.reference}`}
                size={160}
                color={booking.status === 'cancelled' ? colors.slate : colors.ink}
                backgroundColor="transparent"
              />
              {booking.status === 'cancelled' && (
                <View style={styles.cancelledOverlay}>
                  <Text style={styles.cancelledText}>CANCELLED</Text>
                </View>
              )}
            </View>
            <Text style={styles.referenceText}>Ref: {booking.reference}</Text>
            <Badge 
              label={booking.status.toUpperCase()} 
              variant={booking.status === 'confirmed' ? 'success' : 'danger'} 
            />
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{booking.attendee_name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailValue}>{booking.attendee_email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tickets</Text>
              <Text style={styles.detailValue}>{booking.seats}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Paid</Text>
              <Text style={[styles.detailValue, { color: colors.primary }]}>
                LKR {booking.total_amount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.venueSection}>
          <Text style={styles.sectionTitle}>Venue</Text>
          <View style={styles.venueCard}>
            <Ionicons name="location" size={24} color={colors.primary} style={styles.venueIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.venueName}>{event!.venue}</Text>
              <Text style={styles.venueAddress}>{event!.address}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {canCancel && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.xl) }]}>
          <Button
            title="Cancel Booking"
            variant="danger"
            onPress={() => setShowCancelConfirm(true)}
            leftIcon={<Ionicons name="close-circle-outline" size={20} color={colors.white} />}
          />
        </View>
      )}

      <ConfirmDialog
        visible={showCancelConfirm}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone and refunds may take 5-7 business days."
        confirmLabel="Yes, Cancel Booking"
        isDestructive
        loading={cancelBooking.isPending}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  backBtn: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  ticketHeader: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: radii.sm,
    marginRight: spacing.md,
  },
  ticketHeaderContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginBottom: 4,
  },
  eventDate: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    position: 'relative',
  },
  notchLeft: {
    width: 15,
    height: 30,
    backgroundColor: colors.mist,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    position: 'absolute',
    left: 0,
  },
  notchRight: {
    width: 15,
    height: 30,
    backgroundColor: colors.mist,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    position: 'absolute',
    right: 0,
  },
  dashLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
  },
  qrSection: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  qrContainer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    ...shadows.card,
    marginBottom: spacing.md,
    position: 'relative',
  },
  qrCancelled: {
    opacity: 0.3,
  },
  cancelledOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  cancelledText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.danger,
    transform: [{ rotate: '-15deg' }],
    borderWidth: 3,
    borderColor: colors.danger,
    padding: spacing.xs,
    borderRadius: radii.sm,
  },
  referenceText: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  detailsSection: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  detailValue: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  venueSection: {
    marginBottom: spacing.xl,
  },
  venueCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.md,
    ...shadows.card,
  },
  venueIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  venueName: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginBottom: 4,
  },
  venueAddress: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  footer: {
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  }
});
