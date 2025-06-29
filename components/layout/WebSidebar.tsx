import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { 
  Chrome as Home, 
  Search, 
  SquarePlus as PlusSquare, 
  Heart, 
  User, 
  Rss,
  Settings,
  LogIn,
  LogOut
} from 'lucide-react-native';

const NAVIGATION_ITEMS = [
  { key: '/', label: 'Home', icon: Home },
  { key: '/search', label: 'Search', icon: Search },
  { key: '/create', label: 'Create', icon: PlusSquare, requiresAuth: true },
  { key: '/notifications', label: 'Notifications', icon: Heart, requiresAuth: true },
  { key: '/profile', label: 'Profile', icon: User, requiresAuth: true },
];

export function WebSidebar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !isAuthenticated) {
      router.push('/auth/');
      return;
    }
    router.push(path);
  };

  const handleLogin = () => {
    router.push('/auth/');
  };

  const handleLogout = () => {
    logout();
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/index';
    }
    return pathname.startsWith(path);
  };

  return (
    <View style={styles.sidebar}>
      {/* Logo/Brand */}
      <View style={styles.brand}>
        <Text style={styles.brandText}>SocialSky</Text>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {NAVIGATION_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = isActivePath(item.key);
          const shouldShow = !item.requiresAuth || isAuthenticated;

          if (!shouldShow) return null;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => handleNavigation(item.key, item.requiresAuth)}
            >
              <IconComponent 
                size={24} 
                color={isActive ? '#1d4ed8' : '#6b7280'} 
              />
              <Text style={[
                styles.navText,
                isActive && styles.activeNavText
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* User Section */}
      <View style={styles.userSection}>
        {isAuthenticated && user ? (
          <View style={styles.userInfo}>
            <TouchableOpacity 
              style={styles.userProfile}
              onPress={() => router.push('/profile')}
            >
              <Avatar
                uri={user.avatar}
                size="medium"
                fallbackText={user.displayName || user.handle}
              />
              <View style={styles.userDetails}>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.displayName || user.handle}
                </Text>
                <Text style={styles.userHandle} numberOfLines={1}>
                  @{user.handle}
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.authSection}>
            <Text style={styles.authPrompt}>
              Join the conversation
            </Text>
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="medium"
              style={styles.signInButton}
            />
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Powered by AT Protocol
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  brand: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  navigation: {
    flex: 1,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  activeNavItem: {
    backgroundColor: '#eff6ff',
  },
  navText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeNavText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  userSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userProfile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderRadius: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userHandle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
  },
  authSection: {
    gap: 12,
  },
  authPrompt: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  signInButton: {
    width: '100%',
  },
  footer: {
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});