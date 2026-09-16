import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useOrganizerEvents, useDeleteEvent } from '../../hooks/useEvents';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { Badge } from '../../components/Badge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { Event } from '../../types';

export default function OrganizerDashboard() {
  const { data: events, isLoading, refetch, isFetching } = useOrganizerEvents();
  const deleteMutation = useDeleteEvent();
  const { showToast } = useToast();
  
  const [eventToDelete, setEventToDelete] = React.useState<Event | null>(null);

  const stats = React.useMemo(() => {
    if (!events) return { total: 0, active: 0, revenue: 0, seatsSold: 0 };
    return events.reduce((acc, ev) => {
      acc.total += 1;
      if (ev.status === 'published') acc.active += 1;
      if (ev.status !== 'cancelled') {
        acc.revenue += ev.price * ev.booked_seats;
        acc.seatsSold += ev.booked_seats;
      }
      return acc;
    }, { total: 0, active: 0, revenue: 0, seatsSold: 0 });
  }, [events]);

  const handleDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(eventToDelete.id);
      showToast({ message: 'Event cancelled successfully', type: 'success' });
    } catch (error) {
      showToast({ message: 'Failed to cancel event', type: 'error' });
    } finally {
      setEventToDelete(null);
    }
  };

  const renderStatCard = (title: string, value: string | number, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderEventItem = ({ item }: { item: Event }) => {
    return (
      <View style={styles.eventItem}>
        <View style={styles.eventItemHeader}>
          <Text style={styles.eventItemTitle} numberOfLines={1}>{item.title}</Text>
          <Badge 
            label={item.status} 
            variant={item.status === 'published' ? 'success' : item.status === 'draft' ? 'default' : 'danger'} 
          />
        </View>
        
        <Text style={styles.eventItemDate}>
          {format(new Date(item.starts_at), 'MMM d, yyyy • h:mm a')}
        </Text>
        
        <View style={styles.eventItemStats}>
          <Text style={styles.eventItemStatText}>{item.booked_seats} / {item.total_seats} booked</Text>
          <Text style={styles.eventItemStatText}>LKR {(item.price * item.booked_seats).toLocaleString()}</Text>
        </View>
        
        <View style={styles.eventItemActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/organizer/event-bookings?id=${item.id}`)}
          >
            <Ionicons name="people-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Attendees</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/organizer/event-form?id=${item.id}`)}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          
          {item.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => setEventToDelete(item)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.pageTitle}>Dashboard</Text>
      
      <View style={styles.statsGrid}>
        {renderStatCard('Active Events', stats.active, 'calendar')}
        {renderStatCard('Tickets Sold', stats.seatsSold, 'ticket')}
        {renderStatCard('Revenue', `LKR ${(stats.revenue / 1000).toFixed(1)}k`, 'cash')}
        {renderStatCard('Total Events', stats.total, 'list')}
      </View>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Events</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: spacing.lg }}>
              <Skeleton height={150} style={{ marginBottom: spacing.md }} />
              <Skeleton height={150} />
            </View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No events yet"
              message="Create your first event to start selling tickets."
            />
          )
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/organizer/event-form')}
      >
        <Ionicons name="add" size={24} color={colors.white} />
      </TouchableOpacity>

      <ConfirmDialog
        visible={!!eventToDelete}
        title="Cancel Event"
        message={
          eventToDelete?.booked_seats && eventToDelete.booked_seats > 0
            ? `Warning: This event has ${eventToDelete.booked_seats} bookings. Cancelling will notify all attendees and cannot be undone.`
            : "Are you sure you want to cancel this event? This action cannot be undone."
        }
        confirmLabel="Yes, Cancel Event"
        isDestructive
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setEventToDelete(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist, // slightly off-white for dashboard
  },
  listContent: {
    paddingBottom: 80,
  },
  header: {
    padding: spacing.lg,
  },
  pageTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.md,
    ...shadows.card,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  statTitle: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.slate,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  eventItem: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    padding: spacing.md,
    ...shadows.card,
  },
  eventItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  eventItemTitle: {
    flex: 1,
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginRight: spacing.sm,
  },
  eventItemDate: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  eventItemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.mist,
    padding: spacing.sm,
    borderRadius: radii.sm,
    marginBottom: spacing.md,
  },
  eventItemStatText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.deep,
  },
  eventItemActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.mist,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
  },
  actionBtnDanger: {
    flex: 0,
    width: 44,
    borderColor: '#ffcdd2',
    backgroundColor: '#fff0f2',
  },
  actionText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
    elevation: 6,
  }
});
