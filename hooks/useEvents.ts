import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Event } from '../types';

interface FetchEventsParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const useEvents = (params?: FetchEventsParams) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      console.log('Fetching events with params:', params);
      const { data } = await api.get('/events', { params });
      console.log('Fetched events count:', data.data.length);
      return data.data as Event[];
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data.data as Event;
    },
    enabled: !!id,
  });
};

export const useOrganizerEvents = () => {
  return useQuery({
    queryKey: ['organizer-events'],
    queryFn: async () => {
      console.log('Fetching organizer events');
      const { data } = await api.get('/organizers/me/events');
      console.log('Fetched organizer events count:', data.data.length);
      return data.data as Event[];
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventData: Partial<Event>) => {
      const { data } = await api.post('/events', eventData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...eventData }: Partial<Event> & { id: string }) => {
      const { data } = await api.patch(`/events/${id}`, eventData);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/events/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useEventBookings = (eventId: string) => {
  return useQuery({
    queryKey: ['event-bookings', eventId],
    queryFn: async () => {
      const { data } = await api.get(`/events/${eventId}/bookings`);
      return data.data;
    },
    enabled: !!eventId,
  });
};
