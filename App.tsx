import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Sidebar } from './src/components/ui/Sidebar';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LoansScreen from './src/screens/LoansScreen';
import BorrowersScreen from './src/screens/BorrowersScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import LoanDetailsScreen from './src/screens/LoanDetailsScreen';
import { theme } from './src/theme';
import { ReminderService } from './src/services/reminderService';
import { iframeManager, isInIframe, optimizeFormInputs } from './src/utils/iframeDetection';

interface User {
  email: string;
  uid: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('dashboard'); // Changed from 'home' to 'dashboard'
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loanDetailsId, setLoanDetailsId] = useState<string | null>(null);
  const [isIframeEnv, setIsIframeEnv] = useState(false);

  // Initialize iframe detection and automatic reminders when app starts
  useEffect(() => {
    // Detect iframe environment
    const iframeEnv = isInIframe();
    setIsIframeEnv(iframeEnv);

    if (iframeEnv) {
      console.log('App running in iframe environment');
      // Add mobile menu overlay for iframe mode
      if (Platform.OS === 'web') {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.addEventListener('click', () => {
          setSidebarVisible(false);
        });
        document.body.appendChild(overlay);
      }
    }

    // Initialize automatic reminders
    ReminderService.initialize().catch(error => {
      console.error('Failed to initialize reminder service:', error);
    });

    // Optimize form inputs for iframe
    setTimeout(() => {
      optimizeFormInputs();
    }, 1000);

    // Cleanup on unmount
    return () => {
      ReminderService.stopAutoReminderService();
    };
  }, []);

  // Handle sidebar visibility changes for iframe mode
  useEffect(() => {
    if (Platform.OS === 'web' && isIframeEnv) {
      const overlay = document.querySelector('.mobile-menu-overlay');
      const sidebar = document.querySelector('.sidebar');
      
      if (overlay && sidebar) {
        if (sidebarVisible) {
          overlay.classList.add('active');
          sidebar.classList.add('mobile-open');
        } else {
          overlay.classList.remove('active');
          sidebar.classList.remove('mobile-open');
        }
      }
    }
  }, [sidebarVisible, isIframeEnv]);

  const handleLogin = (credentials: any) => {
    console.log('Login attempted with:', credentials);
    // Mock login - in real app, validate credentials
    setUser({ email: credentials.username, uid: 'user123' });
    setIsLoggedIn(true);
    setCurrentScreen('dashboard'); // Set to dashboard after login
  };

  const handleLogout = () => {
    console.log('Logout called');
    setUser(null);
    setIsLoggedIn(false);
    setCurrentScreen('dashboard'); // Reset to dashboard instead of home
    setLoanDetailsId(null);
  };

  const handleScreenChange = (screen: string, params?: any) => {
    console.log('Navigating to screen:', screen, 'with params:', params);
    setCurrentScreen(screen);
    if (params?.loanId) {
      setLoanDetailsId(params.loanId);
    } else {
      setLoanDetailsId(null);
    }

    // Auto-close sidebar on mobile in iframe mode after navigation
    if (isIframeEnv && Platform.OS === 'web') {
      const isMobile = window.innerWidth < 768;
      if (isMobile && sidebarVisible) {
        setSidebarVisible(false);
      }
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'loans':
        return <LoansScreen />;
      case 'borrowers':
        return <BorrowersScreen />;
      case 'payments':
        return <PaymentsScreen onNavigate={handleScreenChange} />;
      case 'userinfo':
        return <UserInfoScreen />;
      case 'reports':
        return <ReportsScreen />;
      case 'reminders':
        return <RemindersScreen />;
      case 'loanDetails':
        return <LoanDetailsScreen route={{ params: { loanId: loanDetailsId || '' } }} navigation={{ goBack: () => handleScreenChange('payments') }} />;
      default:
        return <DashboardScreen />; // Default to dashboard instead of home
    }
  };

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Dashboard';
      case 'loans':
        return 'Loans';
      case 'borrowers':
        return 'Borrowers';
      case 'payments':
        return 'Payments';
      case 'userinfo':
        return 'User Info';
      case 'reports':
        return 'Reports';
      case 'reminders':
        return 'Reminders';
      case 'loanDetails':
        return 'Loan Details';
      default:
        return 'Dashboard';
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <LoginScreen onLogin={handleLogin} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <Sidebar
        isVisible={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
        currentScreen={currentScreen}
        onNavigate={handleScreenChange}
        onLogout={handleLogout}
      />
      
      <View style={[
        styles.mainContent, 
        sidebarVisible && styles.mainContentShifted,
        isIframeEnv && styles.mainContentIframe
      ]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSidebarVisible(!sidebarVisible)}
            style={[styles.menuButton, isIframeEnv && styles.menuButtonIframe]}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {getScreenTitle()}
          </Text>
          
          <View style={styles.headerRight}>
            <Text style={[styles.userEmail, isIframeEnv && styles.userEmailIframe]}>
              {user?.email}
            </Text>
          </View>
        </View>
        
        <View style={[styles.screenContainer, isIframeEnv && styles.screenContainerIframe]}>
          {renderScreen()}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContent: {
    flex: 1,
    marginLeft: 0,
  },
  mainContentShifted: {
    marginLeft: Platform.OS === 'web' ? 280 : 0,
  },
  mainContentIframe: {
    // Iframe-specific styles
    ...(Platform.OS === 'web' && { minHeight: '100vh' as any }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    minHeight: 60,
  },
  menuButton: {
    padding: theme.spacing.sm,
  },
  menuButtonIframe: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: theme.colors.text,
  },
  headerTitle: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  userEmailIframe: {
    fontSize: Platform.OS === 'web' ? 14 : theme.font.size,
  },
  screenContainer: {
    flex: 1,
  },
  screenContainerIframe: {
    paddingHorizontal: Platform.OS === 'web' ? 10 : theme.spacing.md,
  },
});
