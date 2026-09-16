import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Event } from '../types';
import { colors, shadows } from '../theme/colors';
import { spacing, radii } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Badge } from './Badge';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  isGrid?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, isGrid = false }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, isGrid && styles.containerGrid]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: event.image_url }} 
        style={[styles.image, isGrid && styles.imageGrid]} 
        contentFit="cover"
        transition={300}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={isGrid ? 1 : 2}>
            {event.title}
          </Text>
          {!isGrid && (
            <Badge label={event.category} />
          )}
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.slate} />
            <Text style={styles.detailText}>
              {format(new Date(event.starts_at), 'MMM d, yyyy • h:mm a')}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={colors.slate} />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.price}>
            {event.price === 0 ? 'Free' : `LKR ${event.price.toLocaleString()}`}
          </Text>
          
          <View style={styles.seatsBadge}>
            <Ionicons name="people-outline" size={14} color={colors.primary} />
            <Text style={styles.seatsText}>
              {event.total_seats - event.booked_seats} left
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  containerGrid: {
    flex: 1,
    marginHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imageGrid: {
    height: 120,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    marginRight: spacing.sm,
  },
  details: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
    marginLeft: spacing.xs,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.mist,
    paddingTop: spacing.md,
  },
  price: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.md,
    color: colors.deep,
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mist,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  seatsText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.primary,
    marginLeft: 4,
  },
});
