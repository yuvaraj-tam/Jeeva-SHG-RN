import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { theme } from '../../theme';

interface SidebarProps {
  isVisible: boolean;
  onToggle: () => void;
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onLogout: () => void; // NEW: Add logout prop
}

export const Sidebar = ({ isVisible, onToggle, currentScreen, onNavigate, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'loans', label: 'Loans', icon: '💰' },
    { id: 'borrowers', label: 'Borrowers', icon: '👥' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'userinfo', label: 'User Info', icon: '👤' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'reminders', label: 'Reminders', icon: '🔔' },
  ];

  const handleLogout = () => {
    onLogout();
    onToggle(); // Close sidebar after logout
  };

  return (
    <>
      {isVisible && (
        <View style={styles.overlay} onTouchEnd={onToggle} />
      )}
      <View style={[styles.sidebar, isVisible && styles.sidebarVisible]}>
        <View style={styles.header}>
          <Text style={styles.title}>Jeeva SHG</Text>
          <TouchableOpacity onPress={onToggle} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                currentScreen === item.id && styles.activeMenuItem
              ]}
              onPress={() => {
                console.log('Sidebar navigation:', item.id);
                onNavigate(item.id);
                onToggle();
              }}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[
                styles.menuLabel,
                currentScreen === item.id && styles.activeMenuLabel
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Self-Help Group Management</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 998,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: -280,
    width: 280,
    height: '100%',
    backgroundColor: theme.colors.sidebar,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  sidebarVisible: {
    left: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
  },
  activeMenuItem: {
    backgroundColor: theme.colors.sidebarActive,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    fontSize: theme.font.size,
    color: theme.colors.sidebarText,
    fontFamily: theme.font.family,
  },
  activeMenuLabel: {
    color: theme.colors.sidebarActiveText,
    fontWeight: '500',
  },
  logoutContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.sm,
    backgroundColor: '#fee2e2', // Light red background
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  logoutLabel: {
    fontSize: theme.font.size,
    color: '#dc2626', // Red text
    fontWeight: '500',
    fontFamily: theme.font.family,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.surface,
  },
  footerText: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.font.family,
  },
}); 