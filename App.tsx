import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './src/services/firebase';
import { theme } from './src/theme';
import { Sidebar } from './src/components/ui/Sidebar';
import DashboardScreen from './src/screens/DashboardScreen';
import BorrowersScreen from './src/screens/BorrowersScreen';
import LoansScreen from './src/screens/LoansScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import LoanDetailsScreen from './src/screens/LoanDetailsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import RemindersScreen from './src/screens/RemindersScreen';
import UserInfoScreen from './src/screens/UserInfoScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [screenParams, setScreenParams] = useState<any>({});
  const [isIframeEnv, setIsIframeEnv] = useState(false);

  // Detect iframe environment and apply fixes
  useEffect(() => {
    const detectIframe = () => {
      try {
        // Check if we're in an iframe
        const inIframe = window !== window.parent;
        setIsIframeEnv(inIframe);
        
        if (inIframe) {
          console.log('Detected iframe environment, applying aggressive scrolling fixes...');
          
          // Aggressive scrolling fix for iframe
          const applyAggressiveIframeScrollingFixes = () => {
            // Remove any existing overflow restrictions
            const elements = document.querySelectorAll('*');
            elements.forEach((element) => {
              const el = element as HTMLElement;
              if (el.style) {
                // Force scrolling on all elements
                el.style.overflowY = 'auto';
                el.style.overflowX = 'hidden';
                (el.style as any).webkitOverflowScrolling = 'touch';
                
                // Remove any height restrictions that might prevent scrolling
                if (el.style.height === '100vh' || el.style.height === '100%') {
                  el.style.height = 'auto';
                  el.style.minHeight = '100vh';
                }
                
                // Force flex containers to be scrollable
                if (el.style.display === 'flex' && el.style.flex === '1') {
                  el.style.overflowY = 'auto';
                  el.style.height = 'auto';
                  el.style.minHeight = '100vh';
                }
              }
            });
            
            // Specifically target React Native Web elements
            const rnElements = document.querySelectorAll('[data-rn-root], [class*="ScrollView"], [class*="View"]');
            rnElements.forEach((element) => {
              const el = element as HTMLElement;
              el.style.overflowY = 'auto';
              el.style.overflowX = 'hidden';
              el.style.height = 'auto';
              el.style.minHeight = '100vh';
              (el.style as any).webkitOverflowScrolling = 'touch';
            });
            
            // Force body and html to be scrollable
            document.body.style.overflowY = 'auto';
            document.body.style.overflowX = 'hidden';
            document.body.style.height = 'auto';
            document.body.style.minHeight = '100vh';
            (document.body.style as any).webkitOverflowScrolling = 'touch';
            
            document.documentElement.style.overflowY = 'auto';
            document.documentElement.style.overflowX = 'hidden';
            document.documentElement.style.height = 'auto';
            document.documentElement.style.minHeight = '100vh';
            (document.documentElement.style as any).webkitOverflowScrolling = 'touch';
            
            // Target the root element specifically
            const root = document.getElementById('root');
            if (root) {
              root.style.overflowY = 'auto';
              root.style.overflowX = 'hidden';
              root.style.height = 'auto';
              root.style.minHeight = '100vh';
              (root.style as any).webkitOverflowScrolling = 'touch';
            }
            
            console.log('Aggressive iframe scrolling fixes applied');
          };
          
          // Apply fixes immediately
          applyAggressiveIframeScrollingFixes();
          
          // Apply fixes multiple times to ensure they stick
          setTimeout(applyAggressiveIframeScrollingFixes, 100);
          setTimeout(applyAggressiveIframeScrollingFixes, 500);
          setTimeout(applyAggressiveIframeScrollingFixes, 1000);
          setTimeout(applyAggressiveIframeScrollingFixes, 2000);
          setTimeout(applyAggressiveIframeScrollingFixes, 5000);
          
          // Add a global style that forces scrolling
          const globalStyle = document.createElement('style');
          globalStyle.id = 'iframe-scrolling-force';
          globalStyle.textContent = `
            * {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            html, body {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              height: auto !important;
              min-height: 100vh !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            #root {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              height: auto !important;
              min-height: 100vh !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            [data-rn-root] {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              height: auto !important;
              min-height: 100vh !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            [class*="ScrollView"] {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              height: auto !important;
              min-height: 100vh !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            [class*="View"] {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              height: auto !important;
              min-height: 100vh !important;
              -webkit-overflow-scrolling: touch !important;
            }
            
            div {
              overflow-y: auto !important;
              overflow-x: hidden !important;
              -webkit-overflow-scrolling: touch !important;
            }
          `;
          document.head.appendChild(globalStyle);
          
          // Listen for DOM changes and reapply fixes
          const observer = new MutationObserver(() => {
            applyAggressiveIframeScrollingFixes();
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });
          
          // Also listen for scroll events to ensure scrolling works
          window.addEventListener('scroll', () => {
            console.log('Scroll event detected, scrolling is working');
          }, { passive: true });
          
          // Force a scroll to test if it works
          setTimeout(() => {
            window.scrollTo(0, 1);
            window.scrollTo(0, 0);
          }, 1000);
        }
      } catch (error) {
        console.log('Error detecting iframe:', error);
      }
    };
    
    detectIframe();
  }, []);

  // Firebase Authentication State Listener
  useEffect(() => {
    console.log('Setting up Firebase auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any | null) => {
      console.log('Auth state changed:', firebaseUser ? 'User logged in' : 'User logged out');
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email || '',
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
    console.log('Login handled by Firebase auth - state will update via onAuthStateChanged');
    // Authentication is now handled by Firebase in LoginScreen
    // The onAuthStateChanged listener will update the app state
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    console.log('Logout called - signing out from Firebase');
    try {
      await auth.signOut();
      // State will be updated by onAuthStateChanged listener
      setCurrentScreen('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleScreenChange = (screen: string, params?: any) => {
    console.log('Navigating to screen:', screen, 'with params:', params);
    setCurrentScreen(screen);
    if (params?.loanId) {
      setScreenParams({ loanId: params.loanId });
    } else {
      setScreenParams({});
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
        return <LoanDetailsScreen route={{ params: { loanId: screenParams.loanId || '' } }} navigation={{ goBack: () => handleScreenChange('payments') }} />;
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

  // Show loading screen while determining auth state
  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!user) {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.font.sizeHeading,
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  screenContainer: {
    flex: 1,
  },
  screenContainerIframe: {
    paddingHorizontal: Platform.OS === 'web' ? 10 : theme.spacing.md,
  },
});
