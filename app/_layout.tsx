import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ToastProvider } from '../contexts/ToastContext';
import { initLocalDb } from '../db/local';
import { colors } from '../theme/colors';

// Keep splash screen visible while loading fonts and DB
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootLayoutNav() {
  const { state } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.white } }}>
      {!state.token ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="event/[id]" options={{ presentation: 'card', headerShown: false }} />
          <Stack.Screen name="booking/new" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="booking/[id]" options={{ presentation: 'card', headerShown: false }} />
          <Stack.Screen name="organizer/event-form" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="organizer/event-bookings" options={{ presentation: 'card', headerShown: false }} />
          <Stack.Screen name="settings/notifications" options={{ presentation: 'card', headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [dbInitialized, setDbInitialized] = React.useState(false);

  useEffect(() => {
    initLocalDb()
      .then(() => setDbInitialized(true))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dbInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, dbInitialized]);

  if ((!fontsLoaded && !fontError) || !dbInitialized) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
