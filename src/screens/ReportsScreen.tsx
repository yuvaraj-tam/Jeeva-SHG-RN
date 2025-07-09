import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ExcelService } from '../services/excelService';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, isAfter, addDays, differenceInDays } from 'date-fns';
import { Loan, LoanUser, Payment, DashboardStats } from '../types';
import { theme } from '../theme';
import { LoanService } from '../services/loanService';
import { BorrowerService } from '../services/borrowerService';
import { PaymentService } from '../services/paymentService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ReportsScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowers, setBorrowers] = useState<LoanUser[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [report, setReport] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Subscribe to Firestore data
    const unsubscribeLoans = LoanService.subscribeToLoans(setLoans);
    const unsubscribeBorrowers = BorrowerService.subscribeToBorrowers(setBorrowers);
    const unsubscribePayments = PaymentService.subscribeToPayments(setPayments);
    
    return () => {
      unsubscribeLoans();
      unsubscribeBorrowers();
      unsubscribePayments();
    };
  }, []);

  useEffect(() => {
    generateReport();
  }, [loans, borrowers, payments]);

  const generateReport = () => {
    const reportData = ExcelService.generateLoanReport(loans, borrowers, payments);
    setReport(reportData);
  };

  const handleExportToExcel = async () => {
    try {
      setIsGenerating(true);
      await ExcelService.exportToExcelAndShare({
        loans,
        users: borrowers,
        payments,
      });
      Alert.alert('Success', 'Report exported and ready to share!');
    } catch (error: any) {
      Alert.alert('Error', `Failed to export: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getBorrowerName = (borrowerId: string) => {
    const borrower = borrowers.find((b: LoanUser) => b.id === borrowerId);
    return borrower ? borrower.name : 'Unknown';
  };

  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const monthPayments = payments.filter(p => 
      p.month === currentMonth && p.year === currentYear
    );
    
    return {
      totalDue: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      totalPaid: monthPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0),
      totalPending: monthPayments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0),
      paidCount: monthPayments.filter(p => p.isPaid).length,
      pendingCount: monthPayments.filter(p => !p.isPaid).length,
    };
  };

  const monthlyStats = getMonthlyStats();

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
        <Text style={styles.title}>Reports & Analytics</Text>
        <Button 
          onPress={handleExportToExcel}
          disabled={isGenerating}
          style={styles.exportButton}
        >
          {isGenerating ? 'Generating...' : 'Export to Excel'}
        </Button>
      </View>

      {/* Summary Stats */}
      <Card style={styles.summaryCard}>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Overall loan and payment statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{report?.summary.totalLoans || 0}</Text>
              <Text style={styles.statLabel}>Total Loans</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{report?.summary.activeLoans || 0}</Text>
              <Text style={styles.statLabel}>Active Loans</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{(report?.summary.totalAmount || 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Amount</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{(report?.summary.totalCollected || 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Collected</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{(report?.summary.totalPending || 0).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{report?.summary.defaultedLoans || 0}</Text>
              <Text style={styles.statLabel}>Defaulted Loans</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Current Month Stats */}
      <Card style={styles.monthlyCard}>
        <CardHeader>
          <CardTitle>Current Month ({format(new Date(), 'MMMM yyyy')})</CardTitle>
          <CardDescription>This month's payment statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{monthlyStats.totalDue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Due</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{monthlyStats.totalPaid.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Paid</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{monthlyStats.totalPending.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyStats.paidCount}/{monthlyStats.paidCount + monthlyStats.pendingCount}</Text>
              <Text style={styles.statLabel}>Payments</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Overdue Loans */}
      <Card style={styles.overdueCard}>
        <CardHeader>
          <CardTitle>Overdue Loans</CardTitle>
          <CardDescription>Loans with overdue payments</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const overduePayments = payments.filter(p => {
              if (p.isPaid) return false;
              const dueDate = parseISO(p.dueDate);
              return isAfter(new Date(), dueDate);
            }).map(p => {
              const dueDate = parseISO(p.dueDate);
              const overdueDays = differenceInDays(new Date(), dueDate);
              const loan = loans.find(l => l.id === p.loanId);
              const borrower = borrowers.find(b => b.id === p.borrowerId);
              return {
                ...p,
                overdueDays,
                borrowerName: borrower?.name || 'Unknown',
                loanName: loan?.loanName || loan?.loanNumber || 'Unknown Loan'
              };
            }).sort((a, b) => b.overdueDays - a.overdueDays);

            return overduePayments.length > 0 ? (
              overduePayments.map((overdue: any, index: number) => (
                <View key={index} style={styles.overdueItem}>
                  <View style={styles.overdueHeader}>
                    <Text style={styles.borrowerName}>
                      {overdue.borrowerName}
                    </Text>
                    <Badge variant="destructive">
                      {overdue.overdueDays} days overdue
                    </Badge>
                  </View>
                  <Text style={styles.overdueAmount}>
                    Due Amount: ₹{overdue.amount.toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No overdue payments</Text>
            );
          })()}
        </CardContent>
      </Card>

      {/* Upcoming Payments */}
      <Card style={styles.upcomingCard}>
        <CardHeader>
          <CardTitle>Upcoming Payments (Next 7 Days)</CardTitle>
          <CardDescription>Payments due in the next week</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const upcomingPayments = payments.filter(p => {
              if (p.isPaid) return false;
              const dueDate = parseISO(p.dueDate);
              const today = new Date();
              const nextWeek = addDays(today, 7);
              return dueDate >= today && dueDate <= nextWeek;
            }).map(p => {
              const dueDate = parseISO(p.dueDate);
              const daysUntilDue = differenceInDays(dueDate, new Date());
              const loan = loans.find(l => l.id === p.loanId);
              const borrower = borrowers.find(b => b.id === p.borrowerId);
              return {
                ...p,
                daysUntilDue,
                borrowerName: borrower?.name || 'Unknown',
                loanName: loan?.loanName || loan?.loanNumber || 'Unknown Loan'
              };
            }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

            return upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment: any, index: number) => (
                <View key={index} style={styles.upcomingItem}>
                  <View style={styles.upcomingHeader}>
                    <Text style={styles.borrowerName}>
                      {payment.borrowerName}
                    </Text>
                    <Badge variant="default">
                      {payment.daysUntilDue} days
                    </Badge>
                  </View>
                  <Text style={styles.upcomingAmount}>
                    Amount: ₹{payment.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.upcomingDate}>
                    Due: {format(parseISO(payment.dueDate), 'dd MMM yyyy')}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No upcoming payments</Text>
            );
          })()}
        </CardContent>
      </Card>

      {/* Monthly Collection Chart */}
      <Card style={styles.chartCard}>
        <CardHeader>
          <CardTitle>Monthly Collection Trend</CardTitle>
          <CardDescription>Collection data for the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {report?.monthlyCollection && report.monthlyCollection.length > 0 ? (
            report.monthlyCollection.slice(-6).map((month: any, index: number) => (
              <View key={index} style={styles.monthlyItem}>
                <Text style={styles.monthLabel}>
                  {format(parseISO(month.month + '-01'), 'MMM yyyy')}
                </Text>
                <Text style={styles.monthAmount}>
                  ₹{month.amount.toLocaleString()}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No collection data available</Text>
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
    padding: Math.max(20, screenWidth * 0.05),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: Platform.OS === 'ios' ? 100 : 80,
  },
  title: {
    fontSize: theme.font.sizeTitle,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  exportButton: {
    minWidth: 120,
  },
  summaryCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  monthlyCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  overdueCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  upcomingCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  chartCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Math.max(16, screenWidth * 0.04),
  },
  statItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    padding: Math.max(16, screenWidth * 0.04),
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  statLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  overdueItem: {
    padding: Math.max(16, screenWidth * 0.04),
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: Math.max(12, screenWidth * 0.03),
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  overdueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  borrowerName: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  overdueAmount: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
  },
  upcomingItem: {
    padding: Math.max(16, screenWidth * 0.04),
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    marginBottom: Math.max(12, screenWidth * 0.03),
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  upcomingAmount: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  upcomingDate: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Math.max(12, screenWidth * 0.03),
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: Math.max(8, screenWidth * 0.02),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  monthLabel: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontWeight: '500',
  },
  monthAmount: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size,
    fontStyle: 'italic',
    padding: Math.max(20, screenWidth * 0.05),
  },
}); 