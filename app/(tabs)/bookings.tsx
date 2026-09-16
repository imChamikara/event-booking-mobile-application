import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useMyBookings } from '../../hooks/useBookings';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { Badge } from '../../components/Badge';

export default function BookingsScreen() {
  const [segment, setSegment] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const { data: bookings, isLoading, refetch, isFetching } = useMyBookings();

  const filteredBookings = bookings?.filter((b) => {
    if (b.status === 'cancelled') return segment === 'cancelled';
    
    const isPast = new Date(b.event!.starts_at).getTime() < Date.now();
    if (segment === 'past') return isPast;
    if (segment === 'upcoming') return !isPast;
    return false;
  }) || [];

  const renderBookingCard = ({ item }: { item: any }) => {
    const isPast = new Date(item.event.starts_at).getTime() < Date.now();
    
    let badgeVariant: 'primary' | 'success' | 'warning' | 'danger' | 'default' = 'primary';
    if (item.status === 'cancelled') badgeVariant = 'danger';
    else if (item.status === 'completed' || isPast) badgeVariant = 'default';
    else badgeVariant = 'success';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push(`/booking/${item.id}`)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: item.event.image_url }} 
          style={styles.image} 
          contentFit="cover"
        />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.title} numberOfLines={1}>{item.event.title}</Text>
            <Badge label={item.status === 'confirmed' && isPast ? 'completed' : item.status} variant={badgeVariant} />
          </View>
          
          <Text style={styles.reference}>Ref: {item.reference}</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.slate} />
            <Text style={styles.detailText}>{format(new Date(item.event.starts_at), 'MMM d, yyyy • h:mm a')}</Text>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.seatsText}>{item.seats} {item.seats === 1 ? 'ticket' : 'tickets'}</Text>
            <Text style={styles.price}>LKR {item.total_amount.toLocaleString()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton height={100} style={styles.skeletonImg} />
              <View style={styles.skeletonContent}>
                <Skeleton height={20} width="80%" style={{ marginBottom: 8 }} />
                <Skeleton height={14} width="50%" style={{ marginBottom: 12 }} />
                <Skeleton height={24} width="30%" />
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <EmptyState
        icon="ticket-outline"
        title="No bookings found"
        message={`You have no ${segment} bookings.`}
        actionLabel="Explore Events"
        onAction={() => router.push('/(tabs)/home')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Bookings</Text>
      </View>
      
      <View style={styles.segmentControl}>
        <TouchableOpacity 
          style={[styles.segmentBtn, segment === 'upcoming' && styles.segmentBtnActive]}
          onPress={() => setSegment('upcoming')}
        >
          <Text style={[styles.segmentText, segment === 'upcoming' && styles.segmentTextActive]}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentBtn, segment === 'past' && styles.segmentBtnActive]}
          onPress={() => setSegment('past')}
        >
          <Text style={[styles.segmentText, segment === 'past' && styles.segmentTextActive]}>Past</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.segmentBtn, segment === 'cancelled' && styles.segmentBtnActive]}
          onPress={() => setSegment('cancelled')}
        >
          <Text style={[styles.segmentText, segment === 'cancelled' && styles.segmentTextActive]}>Cancelled</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pageTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
  },
  segmentControl: {
    flexDirection: 'row',
    backgroundColor: colors.mist,
    marginHorizontal: spacing.lg,
    borderRadius: radii.pill,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  segmentText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  segmentTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    width: 100,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginRight: spacing.xs,
  },
  reference: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.slate,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  detailText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.slate,
    marginLeft: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatsText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  price: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.sm,
    color: colors.deep,
  },
  skeletonContainer: {
    gap: spacing.md,
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  skeletonImg: {
    width: 100,
    borderRadius: 0,
  },
  skeletonContent: {
    flex: 1,
    padding: spacing.md,
  }
});
