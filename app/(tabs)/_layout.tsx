import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { Chrome as Home, Search, SquarePlus as PlusSquare, Heart, User, Rss } from 'lucide-react-native';
import { WebSidebar } from '@/components/layout/WebSidebar';

export default function TabLayout() {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    return (
      <View style={styles.webContainer}>
        <WebSidebar />
        <View style={styles.webContent}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' }, // Hide tab bar on web
            }}
          >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="search" />
            <Tabs.Screen name="create" />
            <Tabs.Screen name="notifications" />
            <Tabs.Screen name="profile" />
          </Tabs>
        </View>
      </View>
    );
  }

  // Mobile layout (unchanged)
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingTop: 4,
        },
        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ size, color }) => (
            <PlusSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  webContent: {
    flex: 1,
    marginLeft: 280, // Width of sidebar
  },
});