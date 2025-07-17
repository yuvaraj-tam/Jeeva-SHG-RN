import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { format, parseISO, isThisMonth, isPast, isWithinInterval, addMonths, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from 'date-fns';
import { theme } from '../theme';
import { Loan, Payment, LoanUser } from '../types';
import { LoanService } from '../services/loanService';
import { PaymentService } from '../services/paymentService';
import { BorrowerService } from '../services/borrowerService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DashboardScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [borrowers, setBorrowers] = useState<LoanUser[]>([]);
  const [activeTab, setActiveTab] = useState<'thisMonth' | 'past3Months'>('thisMonth');

  useEffect(() => {
    const unsubLoans = LoanService.subscribeToLoans(setLoans);
    const unsubPayments = PaymentService.subscribeToPayments(setPayments);
    const unsubBorrowers = BorrowerService.subscribeToBorrowers(setBorrowers);
    return () => {
      unsubLoans();
      unsubPayments();
      unsubBorrowers();
    };
  }, []);

  // Helper: Get borrower name by ID
  const getBorrowerName = (id: string) => {
    const borrower = borrowers.find(b => b.id === id);
    return borrower ? borrower.name : 'Unknown';
  };

  // Helper: Get this month's payment for a loan
  const getThisMonthPayment = (loanId: string) => {
    const now = new Date();
    return payments.find(p => p.loanId === loanId && isThisMonth(parseISO(p.dueDate)));
  };

  // Dashboard stats
  const totalActiveLoans = loans.filter(l => l.status === 'active').length;
  const totalBorrowers = borrowers.length;
  const monthlyCollection = payments.filter(p => isThisMonth(parseISO(p.dueDate))).reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingAmount = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + (p.amount || 0), 0);
  const overduePayments = payments.filter(p => !p.isPaid && isPast(parseISO(p.dueDate))).length;
  const overdueAmount = payments.filter(p => !p.isPaid && isPast(parseISO(p.dueDate))).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Active loans for list
  const activeLoans = loans.filter(l => l.status === 'active');

  // Helper: Get paid count for a loan for a given month/year
  const getPaidCountForMonth = (loan: Loan, month: number, year: number) => {
    const monthPayments = payments.filter(p => p.loanId === loan.id && p.month === month && p.year === year);
    return monthPayments.filter(p => p.isPaid).length;
  };

  // Helper: Get total count for a loan
  const getTotalCount = (loan: Loan) => loan.borrowerIds ? loan.borrowerIds.length : 0;

  // Get last 3 months (including current)
  const now = new Date();
  const months = [0, 1, 2].map(i => {
    const d = subMonths(now, i);
    return { month: getMonth(d) + 1, year: getYear(d), label: format(d, 'MMM yyyy') };
  }).reverse();

  const renderLoanItem = ({ item }: { item: Loan }) => {
    const payment = getThisMonthPayment(item.id);
    // Calculate paid/total borrowers for this month
    const thisMonthPayments = payments.filter(p => p.loanId === item.id && isThisMonth(parseISO(p.dueDate)));
    const paidCount = thisMonthPayments.filter(p => p.isPaid).length;
    const totalCount = item.borrowerIds ? item.borrowerIds.length : 0;
    return (
      <View style={styles.loanItem}>
        <View style={styles.loanHeader}>
          <View>
            <Text style={styles.loanName}>{item.loanName || 'Loan'}</Text>
            <Text style={styles.paidCount}>Paid: {paidCount}/{totalCount}</Text>
          </View>
          <Badge variant={payment?.isPaid ? 'default' : 'destructive'}>
            {payment?.isPaid ? 'Paid' : 'Unpaid'}
          </Badge>
        </View>
        <View style={styles.loanDetails}>
          <Text style={styles.loanAmount}>₹{item.totalAmount.toLocaleString()}</Text>
          <Text style={styles.emiAmount}>EMI: ₹{item.emiAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.loanProgress}>
          <Text style={styles.progressText}>
            {item.paidEmis}/{item.totalEmis} EMIs paid
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(item.paidEmis / (item.totalEmis || 1)) * 100}%` },
              ]}
            />
          </View>
        </View>
        <View style={styles.paymentStatusDetails}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>This Month Status:</Text>
            <Text style={payment?.isPaid ? [styles.statusValue, styles.paidText] : [styles.statusValue, styles.unpaidText]}>
              {payment?.isPaid ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
          {payment?.isPaid && payment.paymentDate && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Paid Date:</Text>
              <Text style={styles.statusValue}>
                {format(parseISO(payment.paymentDate), 'dd MMM yyyy')}
              </Text>
            </View>
          )}
          {payment?.dueDate && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Due Date:</Text>
              <Text style={styles.statusValue}>
                {format(parseISO(payment.dueDate), 'dd MMM yyyy')}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render for past 3 months tab
  const renderLoanPastMonths = (loan: Loan) => (
    <View style={styles.loanItem} key={loan.id}>
      <Text style={styles.loanName}>{loan.loanName || 'Loan'}</Text>
      <View style={styles.pastMonthsRow}>
        {months.map(({ month, year, label }) => {
          const paid = getPaidCountForMonth(loan, month, year);
          const total = getTotalCount(loan);
          return (
            <View style={styles.pastMonthCell} key={label}>
              <Text style={styles.pastMonthLabel}>{label}</Text>
              <Badge variant={paid === total && total > 0 ? 'default' : 'destructive'}>
                {paid}/{total} {paid === total && total > 0 ? 'Paid' : 'Unpaid'}
              </Badge>
            </View>
          );
        })}
      </View>
    </View>
  );

  const webMinHeight = Platform.OS === 'web' ? { minHeight: typeof window !== 'undefined' ? window.innerHeight : 800 } : {};
  return (
    <ScrollView
      style={[styles.container, webMinHeight]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      nestedScrollEnabled={true}
    >
      <StatusBar style="auto" />
      <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 8 }}>
        <Image source={require('../../assets/icon.png')} style={{ width: 80, height: 80, borderRadius: 20 }} />
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Dashboard</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statValue}>{totalActiveLoans}</Text>
              <Text style={styles.statLabel}>Active Loans</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statValue}>{totalBorrowers}</Text>
              <Text style={styles.statLabel}>Total Borrowers</Text>
            </CardContent>
          </Card>
        </View>
        
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statValue}>₹{monthlyCollection.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Monthly Collection</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statValue}>₹{pendingAmount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Pending Amount</Text>
            </CardContent>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statValue}>{overduePayments}</Text>
              <Text style={styles.statLabel}>Overdue Payments</Text>
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.statContent}>
              <Text style={styles.statValue}>₹{overdueAmount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Overdue Amount</Text>
            </CardContent>
          </Card>
        </View>
      </View>

      {/* Active Loans */}
      <Card style={styles.loansCard}>
        <CardHeader>
          <CardTitle>Active Loans</CardTitle>
          <CardDescription>
            Recent loan activities and payment status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <Button variant={activeTab === 'thisMonth' ? 'default' : 'outline'} size="sm" onPress={() => setActiveTab('thisMonth')}>This Month</Button>
            <Button variant={activeTab === 'past3Months' ? 'default' : 'outline'} size="sm" onPress={() => setActiveTab('past3Months')}>Past 3 Months</Button>
          </View>
          {activeTab === 'thisMonth' ? (
            <FlatList
              data={activeLoans}
              renderItem={renderLoanItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No active loans found.</Text>}
            />
          ) : (
            <View>
              {activeLoans.length === 0 ? (
                <Text style={styles.emptyText}>No active loans found.</Text>
              ) : (
                activeLoans.map(renderLoanPastMonths)
              )}
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
    width: '100%',
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
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
    minHeight: Platform.OS === 'ios' ? 80 : 60,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.font.sizeTitle,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statsContainer: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  statsRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'row',
    flexWrap: Platform.OS === 'web' ? 'wrap' : 'nowrap',
    gap: theme.spacing.sm,
    width: '100%',
  },
  statCard: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? 100 : 70,
    margin: Platform.OS === 'web' ? 6 : 0,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? '48%' : undefined,
  },
  statContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  statValue: {
    fontSize: theme.font.sizeTitle,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  loansCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  loanItem: {
    backgroundColor: '#f9fafb',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  loanName: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  loanDetails: {
    marginBottom: theme.spacing.sm,
  },
  loanAmount: {
    fontSize: theme.font.size,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  emiAmount: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
  },
  loanProgress: {
    marginBottom: theme.spacing.sm,
  },
  progressText: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.divider,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
  paymentStatusDetails: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
  },
  statusValue: {
    fontSize: theme.font.size,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  paidText: {
    color: theme.colors.secondary,
  },
  unpaidText: {
    color: theme.colors.error,
  },
  paidCount: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
    marginTop: 2,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size,
    fontStyle: 'italic',
    padding: Math.max(20, screenWidth * 0.05),
  },
  tabsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  pastMonthsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  pastMonthCell: {
    alignItems: 'center',
    minWidth: 80,
  },
  pastMonthLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
}); 