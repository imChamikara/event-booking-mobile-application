import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { EventCard } from '../../components/EventCard';
import { EmptyState } from '../../components/EmptyState';
import { getFavourites, getCachedEvent } from '../../db/local';

export default function FavouritesScreen() {
  const [favourites, setFavourites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavourites = async () => {
    setIsLoading(true);
    try {
      const favIds = await getFavourites();
      const events = [];
      for (const id of favIds) {
        const ev = await getCachedEvent(id);
        if (ev) events.push(ev);
      }
      setFavourites(events);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, [])
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
    return (
      <EmptyState
        icon="heart-outline"
        title="No saved events"
        message="Events you favourite will appear here even when you are offline."
        actionLabel="Explore Events"
        onAction={() => router.push('/(tabs)/home')}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Events</Text>
      </View>
      
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={() => router.push(`/event/${item.id}`)} 
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
  },
  listContent: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  }
});
