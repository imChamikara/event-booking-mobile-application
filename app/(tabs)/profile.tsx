import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import { colors } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { clearCache, getCacheSizeInfo } from '../../db/local';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Badge } from '../../components/Badge';

export default function ProfileScreen() {
  const { state, signOut } = useAuth();
  const { showToast } = useToast();
  const [cacheSize, setCacheSize] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearCacheConfirm, setShowClearCacheConfirm] = useState(false);

  useEffect(() => {
    getCacheSizeInfo().then(setCacheSize).catch(console.error);
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await clearCache();
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleClearCache = async () => {
    setShowClearCacheConfirm(false);
    await clearCache();
    setCacheSize(0);
    showToast({ message: 'Offline cache cleared successfully', type: 'success' });
  };

  const MenuItem = ({ icon, title, value, onPress, isDestructive = false }: any) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.menuIcon, isDestructive && styles.menuIconDestructive]}>
        <Ionicons name={icon} size={20} color={isDestructive ? colors.danger : colors.primary} />
      </View>
      <Text style={[styles.menuTitle, isDestructive && styles.menuTitleDestructive]}>
        {title}
      </Text>
      {value !== undefined ? (
        <Text style={styles.menuValue}>{value}</Text>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color={colors.slate} />
      ) : null}
    </TouchableOpacity>
  );

  const user = state.user;
  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/settings/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image
            source={{ uri: user.avatar_url || 'https://ui-avatars.com/api/?name=' + user.name + '&size=128' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Badge label={user.role.toUpperCase()} variant={user.role === 'organizer' ? 'primary' : 'default'} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="person-outline" 
              title="Edit Profile" 
              // onPress={() => router.push('/profile/edit')} // Future enhancement
            />
            <View style={styles.divider} />
            <MenuItem 
              icon="lock-closed-outline" 
              title="Change Password" 
              // onPress={() => router.push('/profile/password')} // Future enhancement
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="notifications-outline" 
              title="Notification Settings" 
              onPress={() => router.push('/settings/notifications')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.card}>
            <MenuItem 
              icon="server-outline" 
              title="Offline Cache Size" 
              value={`${cacheSize} items`}
            />
            <View style={styles.divider} />
            <MenuItem 
              icon="trash-outline" 
              title="Clear Cache" 
              onPress={() => setShowClearCacheConfirm(true)}
            />
          </View>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.card}>
            <MenuItem 
              icon="log-out-outline" 
              title="Log Out" 
              onPress={() => setShowLogoutConfirm(true)}
              isDestructive
            />
          </View>
          <Text style={styles.version}>EventHub Version 1.0.0</Text>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out? Your offline data will be cleared."
        confirmLabel="Log Out"
        isDestructive
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmDialog
        visible={showClearCacheConfirm}
        title="Clear Cache"
        message="This will delete all saved offline events. Your favourites will be kept, but their details will need to be downloaded again."
        confirmLabel="Clear Data"
        isDestructive
        onConfirm={handleClearCache}
        onCancel={() => setShowClearCacheConfirm(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pageTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.xl,
    color: colors.ink,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.white,
    marginBottom: spacing.md,
  },
  name: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    marginBottom: 4,
  },
  email: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.slate,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  lastSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.slate,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuIconDestructive: {
    backgroundColor: '#fff0f2',
  },
  menuTitle: {
    flex: 1,
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.ink,
  },
  menuTitleDestructive: {
    color: colors.danger,
  },
  menuValue: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.sm,
    color: colors.slate,
  },
  divider: {
    height: 1,
    backgroundColor: colors.mist,
    marginLeft: 68,
  },
  version: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.slate,
    textAlign: 'center',
    marginTop: spacing.xl,
  }
});
