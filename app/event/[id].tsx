import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useEvent } from '../../hooks/useEvents';
import { getCachedEvent, addFavourite, removeFavourite, getFavourites } from '../../db/local';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { SeatMeter } from '../../components/SeatMeter';
import { useToast } from '../../contexts/ToastContext';
import { Event } from '../../types';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  
  const { data: serverEvent, isLoading, isError } = useEvent(id as string);
  const [offlineEvent, setOfflineEvent] = useState<Event | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    if (isError) {
      getCachedEvent(id as string).then(setOfflineEvent).catch(console.error);
    }
  }, [isError, id]);

  useEffect(() => {
    getFavourites().then(favs => {
      setIsFavourite(favs.includes(id as string));
    });
  }, [id]);

  const event = isError ? offlineEvent : serverEvent;

  const toggleFavourite = async () => {
    try {
      if (isFavourite) {
        await removeFavourite(id as string);
        setIsFavourite(false);
        showToast({ message: 'Removed from saved events' });
      } else {
        await addFavourite(id as string);
        setIsFavourite(true);
        showToast({ message: 'Added to saved events', type: 'success' });
      }
    } catch (e) {
      showToast({ message: 'Failed to update saved events', type: 'error' });
    }
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Check out ${event.title} on EventHub!`,
        url: `eventhub://event/${event.id}`
      });
    } catch (error) {}
  };

  const openInMaps = () => {
    if (!event) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
    Linking.openURL(url);
  };

  if (isLoading && !offlineEvent) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Event not found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  const availableSeats = event.total_seats - event.booked_seats;
  const isSoldOut = availableSeats <= 0;
  const isPast = new Date(event.starts_at).getTime() < Date.now();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Parallax Hero */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: event.image_url }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          />
          
          {/* Floating Header */}
          <View style={[styles.floatingHeader, { paddingTop: Math.max(insets.top, spacing.md) }]}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </TouchableOpacity>
            
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color={colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { marginLeft: spacing.sm }]} onPress={toggleFavourite}>
                <Ionicons name={isFavourite ? "heart" : "heart-outline"} size={24} color={isFavourite ? colors.danger : colors.ink} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{event.title}</Text>
          </View>
          
          <View style={styles.badgeRow}>
            <Badge label={event.category} />
            {isPast && <Badge label="Past Event" variant="default" />}
            {event.status === 'cancelled' && <Badge label="Cancelled" variant="danger" />}
          </View>

          <View style={styles.organizerRow}>
            <View style={styles.organizerAvatar}>
              <Ionicons name="business" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.organizerLabel}>Organized by</Text>
              <Text style={styles.organizerName}>{event.organizer_name || 'EventHub Organizer'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.infoText}>{format(new Date(event.starts_at), 'EEEE, MMMM d, yyyy')}</Text>
                <Text style={styles.infoSubText}>
                  {format(new Date(event.starts_at), 'h:mm a')} - {format(new Date(event.ends_at), 'h:mm a')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoText}>{event.venue}</Text>
                <Text style={styles.infoSubText}>{event.address}</Text>
              </View>
            </View>
            
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: event.latitude,
                  longitude: event.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
              >
                <Marker coordinate={{ latitude: event.latitude, longitude: event.longitude }} />
              </MapView>
              <TouchableOpacity style={styles.mapOverlay} onPress={openInMaps}>
                <View style={styles.mapBtn}>
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                  <Text style={styles.mapBtnText}>Open in Maps</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <SeatMeter total={event.total_seats} booked={event.booked_seats} />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceValue}>
            {event.price === 0 ? 'Free' : `LKR ${event.price.toLocaleString()}`}
          </Text>
        </View>
        
        <Button
          title={isSoldOut ? 'Sold Out' : isPast ? 'Event Ended' : event.status === 'cancelled' ? 'Cancelled' : 'Book Now'}
          disabled={isSoldOut || isPast || event.status === 'cancelled' || isError}
          onPress={() => router.push(`/booking/new?eventId=${event.id}`)}
          style={styles.bookBtn}
        />
      </View>
    </View>
  );
}

// Needed for the gradient
import { LinearGradient } from 'expo-linear-gradient';

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
  errorText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.slate,
  },
  heroContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  content: {
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  },
  titleRow: {
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.mist,
    marginBottom: spacing.lg,
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  organizerLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.xs,
    color: colors.slate,
  },
  organizerName: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.ink,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  infoText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginBottom: 2,
  },
  infoSubText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  mapContainer: {
    height: 150,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    ...shadows.card,
  },
  mapBtnText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  description: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.slate,
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.card,
    elevation: 20,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  priceValue: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  bookBtn: {
    flex: 1.5,
  }
});
