import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { Booking } from '../types';

export const useMyBookings = () => {
  return useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings/me');
      return data.data as Booking[];
    },
  });
};

export const useBooking = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${id}`);
      return data.data as Booking;
    },
    enabled: !!id,
  });
};

interface CreateBookingParams {
  event_id: string;
  seats: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  notes?: string;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingData: CreateBookingParams) => {
      const { data } = await api.post('/bookings', bookingData);
      return data.data as Booking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/bookings/${id}/cancel`);
      return data.data as Booking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event', data.event_id] });
    },
  });
};
