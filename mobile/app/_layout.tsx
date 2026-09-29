import '../global.css';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RoleProvider } from '@/context/role-context';
import { OfflineQueueProvider } from '@/context/offline-queue-context';
export default function RootLayout() { const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } })); return <SafeAreaProvider><QueryClientProvider client={queryClient}><RoleProvider><OfflineQueueProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></OfflineQueueProvider></RoleProvider></QueryClientProvider></SafeAreaProvider>; }
