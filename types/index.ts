export type Role = 'attendee' | 'organizer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  role: Role;
  created_at: string;
}

export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  starts_at: string;
  ends_at: string;
  venue: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  total_seats: number;
  booked_seats: number;
  status: EventStatus;
  created_at: string;
  // joined fields
  organizer_name?: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  event_id: string;
  user_id: string;
  reference: string;
  seats: number;
  total_amount: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  cancelled_at: string | null;
  
  // joined fields
  event?: Event;
}

export type NotificationType = 'booking_confirmed' | 'booking_cancelled' | 'event_reminder' | 'event_updated';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  read: number;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}
