import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { EventCard } from '../../components/EventCard';
import { SearchBar } from '../../components/SearchBar';
import { CategoryFilter } from '../../components/CategoryFilter';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { cacheEvents, getCachedEvents, getPreference, setPreference } from '../../db/local';

const CATEGORIES = ['Music', 'Sports', 'Tech', 'Food', 'Arts', 'Business', 'Wellness', 'Education'];

export default function HomeScreen() {
  const { state } = useAuth();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isGrid, setIsGrid] = useState(false);
  const [offlineEvents, setOfflineEvents] = useState<any[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load preferences
  useEffect(() => {
    getPreference('view_mode').then((val) => {
      if (val === 'grid') setIsGrid(true);
    });
    getPreference('default_category').then((val) => {
      if (val && !category) setCategory(val);
    });
  }, []);

  const { data: events, isLoading, isError, refetch, isFetching } = useEvents({
    search: debouncedSearch,
    category,
    limit: 50, // Simplified infinite scroll for demo
  });

  // Offline hydration
  useEffect(() => {
    if (events && events.length > 0) {
      cacheEvents(events).catch(console.error);
    } else if (isError) {
      getCachedEvents().then(setOfflineEvents).catch(console.error);
    }
  }, [events, isError]);

  const toggleViewMode = () => {
    const newMode = !isGrid;
    setIsGrid(newMode);
    setPreference('view_mode', newMode ? 'grid' : 'list').catch(console.error);
  };

  const handleCategorySelect = (cat: string) => {
    setCategory(cat);
    setPreference('default_category', cat).catch(console.error);
  };

  const displayEvents = isError ? offlineEvents : events;
  const isOffline = isError && offlineEvents.length > 0;

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[colors.primary, colors.deep]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {state.user?.name.split(' ')[0]}</Text>
              <Text style={styles.tagline}>Find your next experience</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
              <Image
                source={state.user?.avatar_url || 'https://ui-avatars.com/api/?name=' + state.user?.name}
                style={styles.avatar}
                contentFit="cover"
              />
            </TouchableOpacity>
          </View>

          <SearchBar 
            value={search}
            onChangeText={setSearch}
            placeholder="Search events, venues..."
          />
        </SafeAreaView>
      </LinearGradient>
      
      <View style={styles.filterSection}>
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={category}
          onSelect={handleCategorySelect}
        />
        
        <View style={styles.viewToggleContainer}>
          <Text style={styles.resultsCount}>
            {displayEvents?.length || 0} Events
          </Text>
          <TouchableOpacity onPress={toggleViewMode} style={styles.viewToggleBtn}>
            <Ionicons name={isGrid ? 'list' : 'grid'} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={16} color={colors.deep} />
          <Text style={styles.offlineText}>Offline — showing saved events</Text>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton height={180} style={styles.skeletonImg} />
              <Skeleton height={24} width="70%" style={styles.skeletonText} />
              <Skeleton height={16} width="40%" style={styles.skeletonText} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <EmptyState
        title={category || search ? "No events found" : "No active events"}
        message={category || search ? "Try adjusting your filters or search term." : "Check back later for new events!"}
        actionLabel={category || search ? "Clear Filters" : "Refresh"}
        onAction={() => { setSearch(''); setCategory(''); refetch(); }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={displayEvents || []}
        key={isGrid ? 'grid' : 'list'}
        numColumns={isGrid ? 2 : 1}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            isGrid={isGrid}
            onPress={() => router.push(`/event/${item.id}`)} 
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  headerContainer: {
    marginBottom: spacing.md,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  safeHeader: {
    paddingTop: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.xl,
    color: colors.white,
  },
  tagline: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.mist,
    opacity: 0.9,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.white,
  },
  filterSection: {
    paddingTop: spacing.sm,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  resultsCount: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  viewToggleBtn: {
    padding: spacing.xs,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mist,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
    borderRadius: 8,
  },
  offlineText: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.sm,
    color: colors.deep,
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
  },
  skeletonCard: {
    marginBottom: spacing.lg,
  },
  skeletonImg: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginBottom: spacing.sm,
  },
  skeletonText: {
    marginBottom: spacing.xs,
    marginLeft: spacing.sm,
  }
});
