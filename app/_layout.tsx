import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/contexts/QueryProvider';
import './global.css';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <QueryProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="post/[uri]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/[handle]" options={{ headerShown: false }} />
          <Stack.Screen name="search/people" options={{ headerShown: false }} />
          <Stack.Screen name="search/feeds" options={{ headerShown: false }} />
          <Stack.Screen name="feed/[uri]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryProvider>
  );
}