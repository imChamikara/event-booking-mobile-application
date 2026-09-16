import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { typography } from '../../theme/typography';

export default function TabLayout() {
  const { state } = useAuth();
  const isOrganizer = state.user?.role === 'organizer';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.slate,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          elevation: 8,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.fonts.medium,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'ticket' : 'ticket-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="organizer"
        options={{
          title: 'Manage',
          href: isOrganizer ? '/(tabs)/organizer' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
