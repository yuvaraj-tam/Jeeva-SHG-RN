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

  // Initialize automatic reminders when app starts
  useEffect(() => {
    ReminderService.initialize().catch(error => {
      console.error('Failed to initialize reminder service:', error);
    });

    // Cleanup on unmount
    return () => {
      ReminderService.stopAutoReminderService();
    };
  }, []);

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
      
      <View style={[styles.mainContent, sidebarVisible && styles.mainContentShifted]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => setSidebarVisible(!sidebarVisible)}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {getScreenTitle()}
          </Text>
          
          <View style={styles.headerRight}>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        
        <View style={styles.screenContainer}>
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
  screenContainer: {
    flex: 1,
  },
});
