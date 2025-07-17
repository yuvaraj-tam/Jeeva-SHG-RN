import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AuthService } from '../services/authService';
import { User } from 'firebase/auth';
import { format, parseISO, addMonths, isThisMonth, compareAsc } from 'date-fns';
import { Payment, Loan, LoanUser } from '../types';
import { theme } from '../theme';
import { PaymentService } from '../services/paymentService';
import { LoanService } from '../services/loanService';
import { BorrowerService } from '../services/borrowerService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PaymentsScreenProps {
  onNavigate?: (screen: string, params?: any) => void;
}

export default function PaymentsScreen({ onNavigate }: PaymentsScreenProps) {
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowers, setBorrowers] = useState<LoanUser[]>([]);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    
    // Subscribe to Firestore data
    const unsubscribePayments = PaymentService.subscribeToPayments(setPayments);
    const unsubscribeLoans = LoanService.subscribeToLoans(setLoans);
    const unsubscribeBorrowers = BorrowerService.subscribeToBorrowers(setBorrowers);
    
    return () => {
      unsubscribePayments();
      unsubscribeLoans();
      unsubscribeBorrowers();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      // Since we're not using React Navigation, just show an alert
      Alert.alert('Logged Out', 'You have been logged out successfully.');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const handleGeneratePayments = async (loan: Loan) => {
    try {
      const totalEmis = loan.totalEmis || 12;
      const emiAmount = loan.emiAmount || 0;
      const startDate = loan.startDate ? parseISO(loan.startDate) : new Date();
      
      // Get current date info
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
      const currentYear = now.getFullYear();
      
      // Calculate next month
      let nextMonth = currentMonth + 1;
      let nextYear = currentYear;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear = currentYear + 1;
      }
      
      // Find which EMI numbers correspond to current and next month
      let currentMonthEmi = -1;
      let nextMonthEmi = -1;
      
      // Calculate EMI numbers for current and next month
      for (let i = 1; i <= totalEmis; i++) {
        const dueDate = addMonths(startDate, i - 1);
        const dueMonth = dueDate.getMonth() + 1;
        const dueYear = dueDate.getFullYear();
        
        if (dueMonth === currentMonth && dueYear === currentYear) {
          currentMonthEmi = i;
        } else if (dueMonth === nextMonth && dueYear === nextYear) {
          nextMonthEmi = i;
        }
      }
      
      // Generate payments only for current month and next month
      const emisToGenerate: number[] = [];
      if (currentMonthEmi !== -1) emisToGenerate.push(currentMonthEmi);
      if (nextMonthEmi !== -1) emisToGenerate.push(nextMonthEmi);
      
      if (emisToGenerate.length === 0) {
        Alert.alert('No Payments to Generate', 'No payments are due for current month or next month.');
        return;
      }
      
      // Check if payments already exist for these months
      const existingPayments = payments.filter(p => p.loanId === loan.id);
      const existingMonths = new Set();
      existingPayments.forEach(p => {
        existingMonths.add(`${p.month}-${p.year}`);
      });
      
      const monthsToGenerate: { emiNum: number; dueDate: Date }[] = [];
      emisToGenerate.forEach(emiNum => {
        const dueDate = addMonths(startDate, emiNum - 1);
        const monthKey = `${dueDate.getMonth() + 1}-${dueDate.getFullYear()}`;
        if (!existingMonths.has(monthKey)) {
          monthsToGenerate.push({ emiNum, dueDate });
        }
      });
      
      if (monthsToGenerate.length === 0) {
        Alert.alert('Payments Already Exist', 'Payments for current month and next month already exist for this loan.');
        return;
      }
      
      // Generate payments for current and next month only
      for (const { emiNum, dueDate } of monthsToGenerate) {
        for (const borrowerId of loan.borrowerIds || []) {
          const amount = loan.emiAmounts && loan.emiAmounts[borrowerId] !== undefined ? loan.emiAmounts[borrowerId] : emiAmount;
          await PaymentService.addPayment({
            loanId: loan.id,
            borrowerId,
            amount,
            dueDate: dueDate.toISOString(),
            isPaid: false,
            reminderSent: false,
            month: dueDate.getMonth() + 1,
            year: dueDate.getFullYear(),
            emiNumber: emiNum,
          });
        }
      }
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const generatedMonths = monthsToGenerate.map(({ dueDate }) => 
        `${monthNames[dueDate.getMonth()]} ${dueDate.getFullYear()}`
      ).join(' and ');
      
      Alert.alert('Success', `Generated payments for ${generatedMonths} for all borrowers!`);
    } catch (error) {
      console.error('Error generating payments:', error);
      Alert.alert('Error', 'Failed to generate payments. Please try again.');
    }
  };

  const handleViewLoanPayments = (loanId: string) => {
    // Filter payments to show only this loan's payments
    const loanPayments = payments.filter(p => p.loanId === loanId);
    if (loanPayments.length === 0) {
      Alert.alert('No Payments', 'No payments found for this loan. Generate payments first.');
    } else {
      // Navigate to loan details page
      onNavigate?.('loanDetails', { loanId });
    }
  };

  const webMinHeight = Platform.OS === 'web' ? { minHeight: typeof window !== 'undefined' ? window.innerHeight : 800 } : {};

  return (
    <ScrollView
      style={[styles.container, webMinHeight]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Payments</Text>
          {user && (
            <Text style={styles.userInfo}>Welcome, {user.email}</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <Button variant="outline" onPress={handleLogout} style={styles.logoutButton}>
            Logout
          </Button>
        </View>
      </View>

      {/* Generate Payments from Loans */}
      <Card style={styles.loansCard}>
        <CardHeader>
          <CardTitle>Generate Payments from Loans</CardTitle>
          <CardDescription>
            Create payment schedules for active loans
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loans.filter(loan => loan.status === 'active').length === 0 ? (
            <Text style={styles.emptyText}>No active loans found. Create loans first.</Text>
          ) : (
            <View style={styles.loansGrid}>
              {loans
                .filter(loan => loan.status === 'active')
                .sort((loanA, loanB) => {
                  // Sort by current month due date
                  const paymentsA = payments.filter(p => p.loanId === loanA.id && isThisMonth(parseISO(p.dueDate)));
                  const paymentsB = payments.filter(p => p.loanId === loanB.id && isThisMonth(parseISO(p.dueDate)));
                  
                  if (paymentsA.length === 0 && paymentsB.length === 0) return 0;
                  if (paymentsA.length === 0) return 1;
                  if (paymentsB.length === 0) return -1;
                  
                  const earliestA = paymentsA.reduce((earliest, p) => 
                    compareAsc(parseISO(p.dueDate), parseISO(earliest.dueDate)) < 0 ? p : earliest
                  );
                  const earliestB = paymentsB.reduce((earliest, p) => 
                    compareAsc(parseISO(p.dueDate), parseISO(earliest.dueDate)) < 0 ? p : earliest
                  );
                  
                  return compareAsc(parseISO(earliestA.dueDate), parseISO(earliestB.dueDate));
                })
                .map(loan => {
                const existingPayments = payments.filter(p => p.loanId === loan.id);
                
                // Calculate current month payment status by borrower
                const thisMonthPayments = existingPayments.filter(p => isThisMonth(parseISO(p.dueDate)));
                const thisMonthPaidCount = thisMonthPayments.filter(p => p.isPaid).length;
                const totalBorrowersThisMonth = thisMonthPayments.length;
                
                // Fallback to total calculation if no current month payments
                const paidPayments = existingPayments.filter(p => p.isPaid).length;
                const totalPayments = loan.totalEmis || 12;
                
                return (
                  <View key={loan.id} style={styles.loanItem}>
                    <View style={styles.loanHeader}>
                      <View>
                        <Text 
                          style={styles.loanName}
                          onPress={() => onNavigate?.('loanDetails', { loanId: loan.id })}
                        >
                          {loan.loanName || 'Loan'}
                        </Text>
                        <Text style={styles.loanId}>ID: {loan.loanNumber || loan.id}</Text>
                      </View>
                      <Badge variant="outline">
                        {totalBorrowersThisMonth > 0 
                          ? `${thisMonthPaidCount}/${totalBorrowersThisMonth} Paid`
                          : `${paidPayments}/${totalPayments} Paid`
                        }
                      </Badge>
                    </View>
                    <View style={styles.loanDetails}>
                      <Text style={styles.amount}>EMI: ₹{loan.emiAmount?.toLocaleString()}</Text>
                      <Text style={styles.amount}>Total: ₹{loan.totalAmount?.toLocaleString()}</Text>
                      <Text style={styles.dueDate}>
                        Start: {loan.startDate ? format(parseISO(loan.startDate), 'dd MMM yyyy') : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.loanActions}>
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => handleGeneratePayments(loan)}
                      >
                        Generate Payments
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => handleViewLoanPayments(loan.id)}
                      >
                        View Payments
                      </Button>
                    </View>
                  </View>
                );
                })}
              </View>
            )}
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    minHeight: Platform.OS === 'ios' ? 100 : 80,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  logoutButton: {
    minWidth: 100,
  },
  title: {
    fontSize: theme.font.sizeTitle,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  userInfo: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    fontFamily: theme.font.family,
  },
  loansCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  loansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  loanItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loanName: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.font.family,
    textDecorationLine: 'underline',
  },
  loanId: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  loanDetails: {
    marginBottom: theme.spacing.md,
  },
  amount: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.font.family,
  },
  dueDate: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  loanActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size,
    fontStyle: 'italic',
    padding: theme.spacing.lg,
    fontFamily: theme.font.family,
  },
}); 