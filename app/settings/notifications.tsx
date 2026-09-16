import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getPreference, setPreference } from '../../db/local';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/Button';

export default function NotificationSettingsScreen() {
  const { showToast } = useToast();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [settings, setSettings] = useState({
    booking_reminders: true,
    event_updates: true,
    promotions: false,
    new_events: true,
  });

  useEffect(() => {
    checkPermissions();
    loadSettings();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionsGranted(status === 'granted');
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionsGranted(status === 'granted');
    if (status === 'granted') {
      showToast({ message: 'Notifications enabled', type: 'success' });
    } else {
      showToast({ message: 'Notification permission denied', type: 'error' });
    }
  };

  const loadSettings = async () => {
    try {
      const keys = Object.keys(settings) as Array<keyof typeof settings>;
      const loaded: any = { ...settings };
      for (const key of keys) {
        const val = await getPreference(`notif_${key}`);
        if (val !== null) loaded[key] = val;
      }
      setSettings(loaded);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleSetting = async (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await setPreference(`notif_${key}`, value);
    } catch (e) {
      showToast({ message: 'Failed to save setting', type: 'error' });
      // Revert
      setSettings(settings);
    }
  };

  const renderSettingRow = (key: keyof typeof settings, title: string, description: string) => (
    <View style={styles.settingRow}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: colors.mist, true: colors.primary }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.mist}
        onValueChange={(val) => toggleSetting(key, String(val) as any)}
        value={settings[key]}
        disabled={!permissionsGranted}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {!permissionsGranted ? (
          <View style={styles.permissionCard}>
            <View style={styles.permissionIcon}>
              <Ionicons name="notifications-off-outline" size={32} color={colors.danger} />
            </View>
            <Text style={styles.permissionTitle}>Push Notifications Disabled</Text>
            <Text style={styles.permissionText}>
              Enable push notifications to receive updates about your bookings and upcoming events.
            </Text>
            <Button title="Enable Notifications" onPress={requestPermissions} />
          </View>
        ) : (
          <View style={styles.permissionCardSuccess}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: spacing.sm }} />
            <Text style={styles.permissionTextSuccess}>Push Notifications Enabled</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        
        <View style={styles.card}>
          {renderSettingRow(
            'booking_reminders', 
            'Booking Reminders', 
            'Get notified 24 hours before your upcoming events'
          )}
          <View style={styles.divider} />
          {renderSettingRow(
            'event_updates', 
            'Event Updates', 
            'Get notified about time changes, venue changes, or cancellations'
          )}
          <View style={styles.divider} />
          {renderSettingRow(
            'new_events', 
            'New Events', 
            'Get notified when new events are added to your favourite categories'
          )}
          <View style={styles.divider} />
          {renderSettingRow(
            'promotions', 
            'Promotional Offers', 
            'Receive special discounts and early bird offers'
          )}
        </View>

        <View style={styles.testNotifContainer}>
          <Button 
            title="Test Notification" 
            variant="outline"
            onPress={async () => {
              if (permissionsGranted) {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: "Test Notification",
                    body: "This is a test notification from EventHub!",
                  },
                  trigger: null,
                });
                showToast({ message: 'Test notification sent', type: 'success' });
              } else {
                showToast({ message: 'Notifications are disabled', type: 'error' });
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist,
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
  content: {
    padding: spacing.lg,
  },
  permissionCard: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: radii.md,
    ...shadows.card,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff0f2', // light red
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  permissionTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  permissionText: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.md,
    color: colors.slate,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  permissionCardSuccess: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radii.md,
    ...shadows.card,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  permissionTextSuccess: {
    fontFamily: typography.fonts.medium,
    fontSize: typography.sizes.md,
    color: colors.success,
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
    ...shadows.card,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: spacing.lg,
  },
  settingTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: typography.sizes.xs,
    color: colors.slate,
  },
  divider: {
    height: 1,
    backgroundColor: colors.mist,
    marginLeft: spacing.md,
  },
  testNotifContainer: {
    marginTop: spacing.xl,
  }
});
