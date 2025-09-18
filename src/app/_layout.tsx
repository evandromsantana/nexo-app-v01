import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { SplashScreen } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't redirect until auth state is loaded

    const inTabsGroup = segments[0] === '(tabs)';

    if (user && !inTabsGroup) {
      // Redirect authenticated users to the main app
      router.replace('/(tabs)');
    } else if (!user && inTabsGroup) {
      // Redirect unauthenticated users to the login screen
      router.replace('/login');
    }
    
    // Hide the splash screen now that we are done routing
    SplashScreen.hideAsync();

  }, [user, isLoading, segments, router]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InitialLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}
