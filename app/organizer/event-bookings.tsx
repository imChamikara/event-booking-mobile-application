import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import api from '../../services/api';
import { useEvent } from '../../hooks/useEvents';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { SearchBar } from '../../components/SearchBar';

export default function EventBookingsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [search, setSearch] = useState('');
  
  const { data: event, isLoading: isLoadingEvent } = useEvent(id as string);
  
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ['event-bookings', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}/bookings`);
      return data.data;
    },
    enabled: !!id,
  });

  const filteredBookings = bookings?.filter((b: any) => 
    b.attendee_name.toLowerCase().includes(search.toLowerCase()) ||
    b.reference.toLowerCase().includes(search.toLowerCase()) ||
    b.attendee_email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoadingEvent || isLoadingBookings) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderBooking = ({ item }: { item: any }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.attendeeName}>{item.attendee_name}</Text>
          <Text style={styles.attendeeEmail}>{item.attendee_email}</Text>
        </View>
        <Badge 
          label={item.status} 
          variant={item.status === 'confirmed' ? 'success' : 'danger'} 
        />
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Reference</Text>
          <Text style={styles.detailValue}>{item.reference}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tickets</Text>
          <Text style={styles.detailValue}>{item.seats}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={[styles.detailValue, { color: colors.primary }]}>
            LKR {item.total_amount.toLocaleString()}
          </Text>
        </View>
      </View>
      
      {item.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{item.notes}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>Attendees</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{event?.title}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar 
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, or reference..."
        />
        
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            Total Bookings: <Text style={styles.statsValue}>{bookings?.length || 0}</Text>
          </Text>
          <Text style={styles.statsText}>
            Seats Sold: <Text style={styles.statsValue}>{event?.booked_seats || 0}</Text>
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No attendees found"
            message={search ? "No matching bookings found." : "This event doesn't have any bookings yet."}
          />
        }
      />
    </SafeAreaView>
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
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  headerSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  searchContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statsText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  statsValue: {
    fontFamily: typography.fonts.bold,
    color: colors.ink,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  attendeeName: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  attendeeEmail: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.mist,
    padding: spacing.sm,
    borderRadius: radii.sm,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.slate,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  notesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
  },
  notesLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.slate,
  },
  notesText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.ink,
    marginTop: 2,
  }
});
