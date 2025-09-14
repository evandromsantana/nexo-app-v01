import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { SplashScreen } from 'expo-router';

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
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}