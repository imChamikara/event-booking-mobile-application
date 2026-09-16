import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { colors, shadows } from '../../theme/colors';
import { spacing, radii } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useCreateEvent, useUpdateEvent, useEvent } from '../../hooks/useEvents';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Badge } from '../../components/Badge';

const eventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Must be YYYY-MM-DDThh:mm'),
  ends_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Must be YYYY-MM-DDThh:mm'),
  venue: z.string().min(3, 'Venue name is required'),
  address: z.string().min(5, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  total_seats: z.number().min(1, 'Must have at least 1 seat'),
  price: z.number().min(0, 'Price cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().url('Must be a valid URL'),
  status: z.enum(['draft', 'published', 'cancelled']),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditing = !!id;
  const { showToast } = useToast();
  
  const { data: event, isLoading: isLoadingEvent } = useEvent(id as string);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      starts_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
      ends_at: new Date(Date.now() + 86400000 + 7200000).toISOString().slice(0, 16), // Tomorrow + 2 hours
      venue: '',
      address: '',
      latitude: 6.9271, // Colombo default
      longitude: 79.8612,
      total_seats: 100,
      price: 0,
      category: 'Music',
      image_url: 'https://images.unsplash.com/photo-1540039155732-68ee23e15b51?auto=format&fit=crop&q=80&w=800',
      status: 'draft',
    }
  });

  const currentStatus = watch('status');

  useEffect(() => {
    if (isEditing && event) {
      reset({
        title: event.title,
        description: event.description,
        starts_at: event.starts_at.slice(0, 16),
        ends_at: event.ends_at.slice(0, 16),
        venue: event.venue,
        address: event.address,
        latitude: event.latitude,
        longitude: event.longitude,
        total_seats: event.total_seats,
        price: event.price,
        category: event.category,
        image_url: event.image_url,
        status: event.status as 'draft' | 'published' | 'cancelled',
      });
    }
  }, [isEditing, event, reset]);

  const onSubmit = async (data: EventFormData) => {
    try {
      if (isEditing) {
        await updateEvent.mutateAsync({ id, ...data });
        showToast({ message: 'Event updated successfully', type: 'success' });
      } else {
        await createEvent.mutateAsync(data);
        showToast({ message: 'Event created successfully', type: 'success' });
      }
      router.back();
    } catch (error: any) {
      showToast({ 
        message: error.response?.data?.error?.message || `Failed to ${isEditing ? 'update' : 'create'} event`, 
        type: 'error' 
      });
    }
  };

  if (isEditing && isLoadingEvent) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isSaving = createEvent.isPending || updateEvent.isPending;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Event' : 'New Event'}</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusRow}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.badgeContainer}>
            <Badge 
              label={currentStatus} 
              variant={currentStatus === 'published' ? 'success' : currentStatus === 'draft' ? 'default' : 'danger'} 
            />
          </View>
        </View>

        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Event Title"
              placeholder="e.g. Summer Music Festival"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Description"
              placeholder="Tell people what this event is about..."
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, alignItems: 'flex-start', paddingTop: spacing.sm }}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.description?.message}
            />
          )}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Category"
                  placeholder="e.g. Music"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.category?.message}
                />
              )}
            />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={styles.flex1}>
            <Controller
              control={control}
              name="image_url"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Image URL"
                  placeholder="https://..."
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.image_url?.message}
                />
              )}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Date & Time (YYYY-MM-DDThh:mm)</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Controller
              control={control}
              name="starts_at"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Starts At"
                  placeholder="2024-12-01T18:00"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.starts_at?.message}
                />
              )}
            />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={styles.flex1}>
            <Controller
              control={control}
              name="ends_at"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Ends At"
                  placeholder="2024-12-01T22:00"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.ends_at?.message}
                />
              )}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Location</Text>
        <Controller
          control={control}
          name="venue"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Venue Name"
              placeholder="e.g. Nelum Pokuna"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.venue?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Address"
              placeholder="Full address here"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.address?.message}
            />
          )}
        />

        <Text style={styles.sectionTitle}>Ticketing</Text>
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Controller
              control={control}
              name="price"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Price (LKR)"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={(val) => onChange(Number(val) || 0)}
                  value={value.toString()}
                  error={errors.price?.message}
                />
              )}
            />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={styles.flex1}>
            <Controller
              control={control}
              name="total_seats"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Total Capacity"
                  keyboardType="numeric"
                  onBlur={onBlur}
                  onChangeText={(val) => onChange(Number(val) || 0)}
                  value={value.toString()}
                  error={errors.total_seats?.message}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <View style={styles.statusButtons}>
              <Button
                title={value === 'published' ? 'Unpublish to Draft' : 'Save as Draft'}
                variant="outline"
                onPress={() => {
                  onChange('draft');
                  handleSubmit(onSubmit)();
                }}
                loading={isSaving}
                style={{ flex: 1, marginRight: spacing.sm }}
                disabled={value === 'cancelled'}
              />
              <Button
                title="Publish Event"
                onPress={() => {
                  onChange('published');
                  handleSubmit(onSubmit)();
                }}
                loading={isSaving}
                style={{ flex: 1 }}
                disabled={value === 'published' || value === 'cancelled'}
              />
            </View>
          )}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: typography.sizes.lg,
    color: colors.ink,
  },
  closeBtn: {
    position: 'absolute',
    right: spacing.md,
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: typography.sizes.md,
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badgeContainer: {
    marginLeft: spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  statusButtons: {
    flexDirection: 'row',
  }
});
