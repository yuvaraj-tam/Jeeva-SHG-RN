import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MultiSelectDropdown } from '../components/ui/MultiSelectDropdown';
import { SingleSelectDropdown } from '../components/ui/SingleSelectDropdown';
import { AuthService } from '../services/authService';
import { User } from 'firebase/auth';
import { format, parseISO, isThisMonth, isAfter, isBefore, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Loan, LoanUser, Payment } from '../types';
import { theme } from '../theme';
import { LoanService } from '../services/loanService';
import { BorrowerService } from '../services/borrowerService';
import { PaymentService } from '../services/paymentService';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { ModalHeader, ModalContent, ModalFooter } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface LoanDetailsScreenProps {
  route: {
    params: {
      loanId: string;
    };
  };
  navigation: any;
}

export default function LoanDetailsScreen({ route, navigation }: LoanDetailsScreenProps) {
  const { loanId } = route.params;
  const [user, setUser] = useState<User | null>(null);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [borrowers, setBorrowers] = useState<LoanUser[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedBorrowerIds, setSelectedBorrowerIds] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [showConfirmMarkPaid, setShowConfirmMarkPaid] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  // Individual borrower payment states
  const [borrowerPaymentMethod, setBorrowerPaymentMethod] = useState<'cash' | 'upi' | 'online_transfer'>('cash');
  const [borrowerPaidBy, setBorrowerPaidBy] = useState('');
  const [borrowerEmiPaymentDate, setBorrowerEmiPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [borrowerNotes, setBorrowerNotes] = useState('');
  
  // Bank payment states (for Mark All as Paid)
  const [paidToBankBy, setPaidToBankBy] = useState('');
  const [paidToBankOn, setPaidToBankOn] = useState(new Date().toISOString().split('T')[0]);
  const [paidThrough, setPaidThrough] = useState<'cash_deposit' | 'atm_deposit' | 'cheque_deposit' | 'online_transfer' | 'collection_agent'>('cash_deposit');
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [editingCurrentMonth, setEditingCurrentMonth] = useState(false);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    
    // Subscribe to Firestore data
    const unsubscribeLoans = LoanService.subscribeToLoans((loans) => {
      const currentLoan = loans.find(l => l.id === loanId);
      setLoan(currentLoan || null);
    });
    
    const unsubscribeBorrowers = BorrowerService.subscribeToBorrowers(setBorrowers);
    const unsubscribePayments = PaymentService.subscribeToPayments(setPayments);
    
    return () => {
      unsubscribeLoans();
      unsubscribeBorrowers();
      unsubscribePayments();
    };
  }, [loanId]);

  // Get payments for this specific loan
  const loanPayments = payments.filter(p => p.loanId === loanId);
  
  // Get date range based on selection
  const getDateRangeFilter = () => {
    const now = new Date();
    
    switch (selectedDateRange) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'last3Months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case 'last6Months':
        return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
      case 'last12Months':
        return { start: startOfMonth(subMonths(now, 11)), end: endOfMonth(now) };
      case 'next3Months':
        return { start: startOfMonth(now), end: endOfMonth(addMonths(now, 2)) };
      case 'next6Months':
        return { start: startOfMonth(now), end: endOfMonth(addMonths(now, 5)) };
      case 'next12Months':
        return { start: startOfMonth(now), end: endOfMonth(addMonths(now, 11)) };

      default:
        return null;
    }
  };

  // Filter payments based on borrowers and date range
  const filteredPayments = loanPayments
    .filter(p => selectedBorrowerIds.length === 0 || selectedBorrowerIds.includes(p.borrowerId))
    .filter(p => {
      const dateFilter = getDateRangeFilter();
      if (!dateFilter || !dateFilter.start || !dateFilter.end) return true;
      
      const paymentDate = parseISO(p.dueDate);
      return paymentDate >= dateFilter.start && paymentDate <= dateFilter.end;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()); // Sort ascending by due date

  // Get borrower options for the dropdown
  const borrowerOptions = borrowers
    .filter(borrower => loanPayments.some(p => p.borrowerId === borrower.id))
    .map(borrower => ({
      id: borrower.id,
      label: borrower.name,
      subtitle: borrower.phoneNumber || borrower.email || 'No contact info'
    }));

  // Date range shortcut options
  const dateRangeOptions = [
    { key: 'all', label: 'All' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'last3Months', label: 'Last 3 Months' },
    { key: 'last6Months', label: 'Last 6 Months' },
    { key: 'last12Months', label: 'Last 12 Months' },
    { key: 'next3Months', label: 'Next 3 Months' },
    { key: 'next6Months', label: 'Next 6 Months' },
    { key: 'next12Months', label: 'Next 12 Months' },
  ];

  // Check if a payment can be marked as paid (current or previous months only)
  const canMarkAsPaid = (payment: Payment) => {
    const dueDate = parseISO(payment.dueDate);
    const currentDate = new Date();
    const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const dueMonth = new Date(dueDate.getFullYear(), dueDate.getMonth(), 1);
    
    // Can mark as paid if due date is current month or previous months
    return !isAfter(dueMonth, currentMonth);
  };

  // Get this month's payments that can be marked as paid
  const thisMonthPayments = loanPayments.filter(p => isThisMonth(parseISO(p.dueDate)));
  const thisMonthPaidCount = thisMonthPayments.filter(p => p.isPaid).length;
  const thisMonthTotalCount = thisMonthPayments.length;
  const thisMonthPayableCount = thisMonthPayments.filter(p => !p.isPaid && canMarkAsPaid(p)).length;
  const allThisMonthPaid = thisMonthTotalCount > 0 && thisMonthPaidCount === thisMonthTotalCount;

  const handleMarkAllPaid = () => {
    if (thisMonthPayableCount === 0) {
      Alert.alert('No Payments to Mark', 'All payable EMIs for this month are already paid or are for future months.');
      return;
    }
    setShowConfirmMarkPaid(true);
  };

  const confirmMarkAllPaid = async () => {
    if (!loan) return;
    
    setIsMarkingPaid(true);
    try {
      // Mark all unpaid payments for this month that can be marked as paid
      const unpaidPayments = thisMonthPayments.filter(p => !p.isPaid && canMarkAsPaid(p));
      await Promise.all(
        unpaidPayments.map(p => {
          const updateData: any = {
            isPaid: true,
            paymentDate: paidToBankOn + 'T00:00:00.000Z',
          };
          
          // Add bank payment details
          if (paidToBankBy && paidToBankBy.trim()) {
            updateData.paidToBankBy = paidToBankBy.trim();
          }
          
          if (paidToBankOn) {
            updateData.paidToBankOn = paidToBankOn + 'T00:00:00.000Z';
          }
          
          updateData.paidThrough = paidThrough;
          
          return PaymentService.updatePayment(p.id, updateData);
        })
      );
      Alert.alert('Success', 'All payable EMIs for this month have been marked as paid!');
      setPaidToBankBy('');
      setPaidToBankOn(new Date().toISOString().split('T')[0]);
      setPaidThrough('cash_deposit');
    } catch (error) {
      console.error('Error marking payments as paid:', error);
      Alert.alert('Error', 'Failed to mark payments as paid. Please try again.');
    } finally {
      setIsMarkingPaid(false);
      setShowConfirmMarkPaid(false);
    }
  };

  const confirmMarkAllUnpaid = async () => {
    if (!loan) return;
    
    setIsMarkingPaid(true);
    try {
      // Mark all paid payments for this month as unpaid
      const paidPayments = thisMonthPayments.filter(p => p.isPaid);
      await Promise.all(
        paidPayments.map(p => {
          const updateData: any = {
            isPaid: false,
            paymentDate: null,
            paymentMethod: null,
            notes: null,
            paidBy: null,
            paidToBankBy: null,
            paidToBankOn: null,
            paidThrough: null,
          };
          
          return PaymentService.updatePayment(p.id, updateData);
        })
      );
      Alert.alert('Success', 'All EMIs for this month have been marked as unpaid!');
      setPaidToBankBy('');
      setPaidToBankOn(new Date().toISOString().split('T')[0]);
      setPaidThrough('cash_deposit');
    } catch (error) {
      console.error('Error marking payments as unpaid:', error);
      Alert.alert('Error', 'Failed to mark payments as unpaid. Please try again.');
    } finally {
      setIsMarkingPaid(false);
      setShowConfirmMarkPaid(false);
    }
  };

  const handleMarkBorrowerPaid = (payment: Payment, borrowerName: string) => {
    if (!canMarkAsPaid(payment)) {
      Alert.alert('Cannot Mark as Paid', 'This EMI is for a future month and cannot be marked as paid yet.');
      return;
    }
    
    setSelectedPayment(payment);
    setShowMarkPaidModal(true);
  };

  const handleEditBorrowerPayment = (payment: Payment, borrowerName: string) => {
    // Pre-populate form with existing payment data
    setBorrowerPaymentMethod(payment.paymentMethod as 'cash' | 'upi' | 'online_transfer' || 'cash');
    setBorrowerPaidBy(payment.paidBy || '');
    setBorrowerEmiPaymentDate(payment.paymentDate ? payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0]);
    setBorrowerNotes(payment.notes || '');
    
    setSelectedPayment(payment);
    setShowMarkPaidModal(true);
  };

  const confirmMarkBorrowerPaid = async () => {
    if (!selectedPayment) return;
    
    try {
      const updateData: any = {
        isPaid: true,
        paymentDate: borrowerEmiPaymentDate + 'T00:00:00.000Z',
        paymentMethod: borrowerPaymentMethod,
      };
      
      // Only add notes if it has a value
      if (borrowerNotes && borrowerNotes.trim()) {
        updateData.notes = borrowerNotes.trim();
      }
      
      // Add payment details fields
      if (borrowerPaidBy && borrowerPaidBy.trim()) {
        updateData.paidBy = borrowerPaidBy.trim();
      }
      
      await PaymentService.updatePayment(selectedPayment.id, updateData);
      Alert.alert('Success', `Payment marked as paid successfully!`);
      setBorrowerNotes('');
      setBorrowerPaidBy('');
      setBorrowerEmiPaymentDate(new Date().toISOString().split('T')[0]);
      setShowMarkPaidModal(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      Alert.alert('Error', 'Failed to mark payment as paid. Please try again.');
    }
  };

  const confirmMarkBorrowerUnpaid = async () => {
    if (!selectedPayment) return;
    
    try {
      const updateData: any = {
        isPaid: false,
        paymentDate: null,
        paymentMethod: null,
        notes: null,
        paidBy: null,
      };
      
      await PaymentService.updatePayment(selectedPayment.id, updateData);
      Alert.alert('Success', `Payment marked as unpaid successfully!`);
      setBorrowerNotes('');
      setBorrowerPaidBy('');
      setBorrowerEmiPaymentDate(new Date().toISOString().split('T')[0]);
      setShowMarkPaidModal(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error marking payment as unpaid:', error);
      Alert.alert('Error', 'Failed to mark payment as unpaid. Please try again.');
    }
  };

  const cancelMarkBorrowerPaid = () => {
    setShowMarkPaidModal(false);
    setSelectedPayment(null);
    setBorrowerNotes('');
    setBorrowerPaidBy('');
    setBorrowerEmiPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const cancelMarkAllPaid = () => {
    setShowConfirmMarkPaid(false);
    setPaidToBankBy('');
    setPaidToBankOn(new Date().toISOString().split('T')[0]);
    setPaidThrough('cash_deposit');
  };

  const handleEditCurrentMonthPayment = () => {
    // Pre-populate form with existing data from first payment
    const firstPayment = thisMonthPayments.find(p => p.isPaid);
    if (firstPayment) {
      setPaidToBankBy(firstPayment.paidToBankBy || '');
      setPaidToBankOn(firstPayment.paidToBankOn ? firstPayment.paidToBankOn.split('T')[0] : new Date().toISOString().split('T')[0]);
      setPaidThrough(firstPayment.paidThrough === 'deposit' ? 'cash_deposit' : firstPayment.paidThrough || 'cash_deposit');
    }
    setEditingCurrentMonth(true);
    setShowEditPaymentModal(true);
  };

  const confirmEditCurrentMonthPayment = async () => {
    if (!loan) return;
    
    setIsMarkingPaid(true);
    try {
      // Update all paid payments for this month with bank payment details
      const paidPayments = thisMonthPayments.filter(p => p.isPaid);
      await Promise.all(
        paidPayments.map(p => {
          const updateData: any = {
            isPaid: true,
            paymentDate: p.paymentDate, // Keep existing payment date
          };
          
          // Add bank payment details
          if (paidToBankBy && paidToBankBy.trim()) {
            updateData.paidToBankBy = paidToBankBy.trim();
          }
          
          if (paidToBankOn) {
            updateData.paidToBankOn = paidToBankOn + 'T00:00:00.000Z';
          }
          
          updateData.paidThrough = paidThrough;
          
          return PaymentService.updatePayment(p.id, updateData);
        })
      );
      Alert.alert('Success', 'Payment details updated successfully!');
      setShowEditPaymentModal(false);
      setEditingCurrentMonth(false);
      // Reset form
      setPaidToBankBy('');
      setPaidToBankOn(new Date().toISOString().split('T')[0]);
      setPaidThrough('cash_deposit');
    } catch (error) {
      console.error('Error updating payment details:', error);
      Alert.alert('Error', 'Failed to update payment details. Please try again.');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const cancelEditCurrentMonthPayment = () => {
    setShowEditPaymentModal(false);
    setEditingCurrentMonth(false);
    setPaidToBankBy('');
    setPaidToBankOn(new Date().toISOString().split('T')[0]);
    setPaidThrough('cash_deposit');
  };

  const handleGeneratePayments = async () => {
    if (!loan) return;
    
    try {
      // Check if payments already exist for this loan
      if (loanPayments.length > 0) {
        Alert.alert(
          'Payments Already Exist', 
          'Payments for this loan have already been generated. Generating payments again will create duplicates.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Generate Anyway', 
              style: 'destructive',
              onPress: () => generatePaymentsForLoan()
            }
          ]
        );
        return;
      }
      
      await generatePaymentsForLoan();
    } catch (error) {
      console.error('Error generating payments:', error);
      Alert.alert('Error', 'Failed to generate payments. Please try again.');
    }
  };

  const generatePaymentsForLoan = async () => {
    if (!loan) return;
    
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
      const existingPayments = loanPayments;
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

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const borrower = borrowers.find(b => b.id === item.borrowerId);
    const isOverdue = new Date() > parseISO(item.dueDate);
    const isPayable = canMarkAsPaid(item);
    
    return (
      <View style={styles.paymentItem}>
        <View style={styles.paymentHeader}>
          <Text style={styles.borrowerName}>{borrower?.name || 'Unknown'}</Text>
          <Badge 
            variant={item.isPaid ? 'default' : isOverdue ? 'destructive' : 'outline'}
          >
            {item.isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
          </Badge>
        </View>
        
        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>EMI Amount:</Text>
            <Text style={styles.detailValue}>₹{item.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Due Date:</Text>
            <Text style={[styles.detailValue, isOverdue && !item.isPaid && styles.overdueText]}>
              {format(parseISO(item.dueDate), 'dd MMM yyyy')}
            </Text>
          </View>
          {item.isPaid && item.paymentDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid Date:</Text>
              <Text style={styles.detailValue}>
                {format(parseISO(item.paymentDate), 'dd MMM yyyy')}
              </Text>
            </View>
          )}
          {item.isPaid && item.paymentMethod && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method:</Text>
              <Text style={styles.detailValue}>
                {item.paymentMethod === 'cash' ? 'Cash' :
                 item.paymentMethod === 'upi' ? 'UPI' :
                 item.paymentMethod === 'bank_transfer' ? 'Netbanking' :
                 item.paymentMethod === 'cheque' ? 'Card' :
                 item.paymentMethod === 'bank_deposit' ? 'Bank Deposit' :
                 item.paymentMethod === 'collection_agent' ? 'Collection Agent' :
                 item.paymentMethod === 'online_transfer' ? 'Online Transfer' :
                 item.paymentMethod === 'atm_deposit' ? 'ATM Deposit' :
                 item.paymentMethod}
              </Text>
            </View>
          )}
          {item.isPaid && item.paidBy && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid By:</Text>
              <Text style={styles.detailValue}>{item.paidBy}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>EMI Number:</Text>
            <Text style={styles.detailValue}>{item.emiNumber}</Text>
          </View>
          {!isPayable && !item.isPaid && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.futureText}>Future EMI</Text>
            </View>
          )}
        </View>

        {!item.isPaid && isPayable ? (
          <View style={styles.paymentActions}>
            <Button
              variant="default"
              size="sm"
              onPress={() => handleMarkBorrowerPaid(item, borrower?.name || 'Unknown')}
            >
              Mark as Paid
            </Button>
          </View>
        ) : item.isPaid ? (
          <View style={styles.paymentActions}>
            <Button
              variant="outline"
              size="sm"
              onPress={() => handleEditBorrowerPayment(item, borrower?.name || 'Unknown')}
            >
              Edit
            </Button>
          </View>
        ) : null}
      </View>
    );
  };

  if (!loan) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  const webMinHeight = Platform.OS === 'web' ? { minHeight: typeof window !== 'undefined' ? window.innerHeight : 800 } : {};

  return (
    <ScrollView
      style={[styles.container, webMinHeight]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={Platform.OS === 'web'}
      nestedScrollEnabled={true}
    >
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Loan Details</Text>
          {user && (
            <Text style={styles.userInfo}>Welcome, {user.email}</Text>
          )}
        </View>
        <Button variant="outline" onPress={() => navigation.goBack()} style={styles.backButton}>
          Back
        </Button>
      </View>

      {/* Loan Information */}
      <Card style={styles.loanCard}>
        <CardHeader>
          <CardTitle>{loan.loanName || 'Loan'}</CardTitle>
          <CardDescription>Loan ID: {loan.loanNumber || loan.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.loanDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Purpose:</Text>
              <Text style={styles.detailValue}>{loan.loanPurpose || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.detailValue}>₹{loan.totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>EMI Amount:</Text>
              <Text style={styles.detailValue}>₹{loan.emiAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>{format(parseISO(loan.startDate), 'dd MMM yyyy')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>End Date:</Text>
              <Text style={styles.detailValue}>{format(parseISO(loan.endDate), 'dd MMM yyyy')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Badge variant={loan.status === 'active' ? 'default' : 'secondary'}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </Badge>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Borrowers:</Text>
              <Text style={styles.detailValue}>{loan.borrowerIds?.length || 0}</Text>
            </View>
            {loan.totalEmis && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total EMI:</Text>
                <Text style={styles.detailValue}>{loan.totalEmis}</Text>
              </View>
            )}
            {loan.loanBank && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loan Bank:</Text>
                <Text style={styles.detailValue}>{loan.loanBank}</Text>
              </View>
            )}
            {loan.loanAccountNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account Number:</Text>
                <Text style={styles.detailValue}>{loan.loanAccountNumber}</Text>
              </View>
            )}
          </View>
        </CardContent>
      </Card>

      {/* This Month Status */}
      <Card style={styles.statusCard}>
        <CardHeader>
          <CardTitle>This Month Status</CardTitle>
          <CardDescription>Payment status for current month</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.monthStatus}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Paid EMIs:</Text>
              <Text style={styles.statusValue}>{thisMonthPaidCount}/{thisMonthTotalCount}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Payable EMIs:</Text>
              <Text style={styles.statusValue}>{thisMonthPayableCount}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Badge variant={allThisMonthPaid ? 'default' : 'destructive'}>
                {allThisMonthPaid ? 'All Paid' : 'Pending'}
              </Badge>
            </View>
            
            {/* Payment Details - Show when all paid */}
            {allThisMonthPaid && thisMonthPayments.length > 0 && (
              <View style={styles.bankPaymentDetails}>
                <Text style={styles.bankPaymentTitle}>Payment Details</Text>
                {(() => {
                  const firstPayment = thisMonthPayments.find(p => p.isPaid);
                  if (firstPayment) {
                    return (
                      <View style={styles.bankDetails}>
                        {/* General Payment Details */}
                        {firstPayment.paymentMethod && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Payment Method:</Text>
                            <Text style={styles.detailValue}>
                              {firstPayment.paymentMethod === 'cash' ? 'Cash' :
                               firstPayment.paymentMethod === 'upi' ? 'UPI' :
                               firstPayment.paymentMethod === 'bank_transfer' ? 'Netbanking' :
                               firstPayment.paymentMethod === 'cheque' ? 'Card' :
                               firstPayment.paymentMethod === 'bank_deposit' ? 'Bank Deposit' :
                               firstPayment.paymentMethod === 'collection_agent' ? 'Collection Agent' :
                               firstPayment.paymentMethod === 'online_transfer' ? 'Online Transfer' :
                               firstPayment.paymentMethod === 'atm_deposit' ? 'ATM Deposit' :
                               firstPayment.paymentMethod}
                            </Text>
                          </View>
                        )}
                        {firstPayment.paidBy && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Paid By:</Text>
                            <Text style={styles.detailValue}>{firstPayment.paidBy}</Text>
                          </View>
                        )}
                        {firstPayment.totalEmiPaymentDate && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Total EMI Payment Date:</Text>
                            <Text style={styles.detailValue}>
                              {format(parseISO(firstPayment.totalEmiPaymentDate), 'dd MMM yyyy')}
                            </Text>
                          </View>
                        )}
                        {firstPayment.notes && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Notes:</Text>
                            <Text style={styles.detailValue}>{firstPayment.notes}</Text>
                          </View>
                        )}
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
            
            {/* Debug Information */}
            <View style={styles.debugSection}>
              <Text style={styles.debugTitle}>Payment Details:</Text>
              <Text style={styles.debugText}>Total Payments: {loanPayments.length}</Text>
              <Text style={styles.debugText}>This Month Total: {thisMonthTotalCount}</Text>
              <Text style={styles.debugText}>This Month Paid: {thisMonthPaidCount}</Text>
              <Text style={styles.debugText}>This Month Payable: {thisMonthPayableCount}</Text>
              <Text style={styles.debugText}>Current Date: {new Date().toLocaleDateString()}</Text>
            </View>
            
            {thisMonthPayableCount > 0 ? (
              <Button
                variant="default"
                onPress={handleMarkAllPaid}
                disabled={isMarkingPaid}
                style={styles.markAllButton}
              >
                {isMarkingPaid ? 'Marking...' : `Mark ${thisMonthPayableCount} as Paid`}
              </Button>
            ) : thisMonthTotalCount === 0 ? (
              <View style={styles.noPaymentsInfo}>
                <Text style={styles.noPaymentsText}>
                  No payments found for this month. Generate payments first from the Payments screen.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleGeneratePayments}
                  style={styles.generatePaymentsButton}
                >
                  Generate Payments
                </Button>
              </View>
            ) : (
                            <View style={styles.noPaymentsInfo}>
                <Text style={styles.noPaymentsText}>
                  All payments for this month are already marked as paid.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={handleEditCurrentMonthPayment}
                  style={styles.editPaymentButton}
                >
                  Edit Payment Details
                </Button>
              </View>
            )}
          </View>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card style={styles.paymentsCard}>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>All payments for this loan</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Borrower Filter */}
          {borrowerOptions.length > 0 && (
            <View style={styles.filterSection}>
              <MultiSelectDropdown
                label="Filter by Borrowers"
                placeholder="Select borrowers to filter payments..."
                options={borrowerOptions}
                selectedIds={selectedBorrowerIds}
                onSelectionChange={setSelectedBorrowerIds}
                maxHeight={200}
              />
              {selectedBorrowerIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => setSelectedBorrowerIds([])}
                  style={styles.clearFilterButton}
                >
                  Clear Filter
                </Button>
              )}
            </View>
          )}

          {/* Date Range Filter */}
          <View style={styles.filterSection}>
            <SingleSelectDropdown
              label="Filter by Date Range"
              placeholder="Select date range..."
              options={dateRangeOptions.map(option => ({ 
                id: option.key, 
                label: option.label 
              }))}
              selectedId={selectedDateRange}
              onSelectionChange={setSelectedDateRange}
              maxHeight={300}
            />
          </View>
          
          {loanPayments.length === 0 ? (
            <Text style={styles.emptyText}>No payments found for this loan.</Text>
          ) : filteredPayments.length === 0 ? (
            <Text style={styles.emptyText}>
              {selectedBorrowerIds.length > 0 || selectedDateRange !== 'all'
                ? 'No payments found for the selected filters.' 
                : 'No payments found for this loan.'}
            </Text>
          ) : (
            <View style={styles.paymentsList}>
              {filteredPayments.map((payment) => (
                <View key={payment.id}>
                  {renderPaymentItem({ item: payment })}
                </View>
              ))}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Mark as Paid Modal */}
      <Modal
        visible={showMarkPaidModal}
      >
        <ModalHeader
          title={selectedPayment?.isPaid ? "Edit Payment" : "Mark Payment as Paid"}
          onClose={cancelMarkBorrowerPaid}
        />
        <ModalContent>
          {selectedPayment && (
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Payment Method:</Text>
              <View style={styles.paymentMethodButtons}>
                <Button
                  variant={borrowerPaymentMethod === 'cash' ? 'default' : 'outline'}
                  size="sm"
                  onPress={() => setBorrowerPaymentMethod('cash')}
                >
                  Cash
                </Button>
                <Button
                  variant={borrowerPaymentMethod === 'upi' ? 'default' : 'outline'}
                  size="sm"
                  onPress={() => setBorrowerPaymentMethod('upi')}
                >
                  UPI
                </Button>
                <Button
                  variant={borrowerPaymentMethod === 'online_transfer' ? 'default' : 'outline'}
                  size="sm"
                  onPress={() => setBorrowerPaymentMethod('online_transfer')}
                >
                  Online Transfer
                </Button>
              </View>
              
              <Input
                label="Paid By"
                placeholder="Enter who paid the amount"
                value={borrowerPaidBy}
                onChangeText={setBorrowerPaidBy}
              />
              
              <Input
                label="EMI Payment Date"
                placeholder="Select EMI payment date"
                value={borrowerEmiPaymentDate}
                onChangeText={setBorrowerEmiPaymentDate}
                keyboardType="default"
              />
              
              <Input
                label="Notes (Optional)"
                placeholder="Add any notes about this payment..."
                value={borrowerNotes}
                onChangeText={setBorrowerNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          )}
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={cancelMarkBorrowerPaid}
          >
            Cancel
          </Button>
          {selectedPayment?.isPaid ? (
            <>
              <Button 
                variant="outline"
                onPress={confirmMarkBorrowerUnpaid}
              >
                Mark as Unpaid
              </Button>
              <Button onPress={confirmMarkBorrowerPaid}>
                Update Payment
              </Button>
            </>
          ) : (
            <Button onPress={confirmMarkBorrowerPaid}>
              Mark as Paid
            </Button>
          )}
        </ModalFooter>
      </Modal>

      {/* Confirm Mark All Paid Modal */}
      <Modal
        visible={showConfirmMarkPaid}
      >
        <ModalHeader
          title="Mark All as Paid"
          onClose={cancelMarkAllPaid}
        />
        <ModalContent>
          <View style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Bank Payment Details</Text>
            
            <Input
              label="Paid to Bank By"
              placeholder="Enter who paid to the bank"
              value={paidToBankBy}
              onChangeText={setPaidToBankBy}
            />
            
            <Input
              label="Paid to Bank On"
              placeholder="Select bank payment date"
              value={paidToBankOn}
              onChangeText={setPaidToBankOn}
              keyboardType="default"
            />
            
            <Text style={styles.modalLabel}>Paid Through:</Text>
            <View style={styles.paymentMethodButtons}>
              <Button
                variant={paidThrough === 'cash_deposit' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('cash_deposit')}
              >
                Cash Deposit
              </Button>
              <Button
                variant={paidThrough === 'atm_deposit' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('atm_deposit')}
              >
                ATM Deposit
              </Button>
              <Button
                variant={paidThrough === 'cheque_deposit' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('cheque_deposit')}
              >
                Cheque Deposit
              </Button>
              <Button
                variant={paidThrough === 'online_transfer' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('online_transfer')}
              >
                Online Transfer
              </Button>
              <Button
                variant={paidThrough === 'collection_agent' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('collection_agent')}
              >
                Collection Agent
              </Button>
            </View>
            
            <Text style={styles.modalInfo}>
              {thisMonthPayableCount > 0 
                ? `This will mark ${thisMonthPayableCount} payments as paid for this month.`
                : `This will update bank payment details for ${thisMonthPaidCount} paid payments this month.`
              }
            </Text>
          </View>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={cancelMarkAllPaid}
          >
            Cancel
          </Button>
          {thisMonthPaidCount > 0 && (
            <Button 
              variant="outline"
              onPress={confirmMarkAllUnpaid}
              disabled={isMarkingPaid}
            >
              {isMarkingPaid ? 'Processing...' : 'Mark All as Unpaid'}
            </Button>
          )}
          <Button 
            onPress={confirmMarkAllPaid}
            disabled={isMarkingPaid || thisMonthPayableCount === 0}
          >
            {isMarkingPaid ? 'Marking...' : 'Mark All as Paid'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Current Month Payment Modal */}
      <Modal
        visible={showEditPaymentModal}
      >
        <ModalHeader
          title="Edit Payment Details"
          onClose={cancelEditCurrentMonthPayment}
        />
        <ModalContent>
          <View style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Bank Payment Details</Text>
            
            <Input
              label="Paid to Bank By"
              placeholder="Enter who paid to the bank"
              value={paidToBankBy}
              onChangeText={setPaidToBankBy}
            />
            
            <Input
              label="Paid to Bank On"
              placeholder="Select bank payment date"
              value={paidToBankOn}
              onChangeText={setPaidToBankOn}
              keyboardType="default"
            />
            
            <Text style={styles.modalLabel}>Paid Through:</Text>
            <View style={styles.paymentMethodButtons}>
              <Button
                variant={paidThrough === 'cash_deposit' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('cash_deposit')}
              >
                Cash Deposit
              </Button>
              <Button
                variant={paidThrough === 'atm_deposit' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('atm_deposit')}
              >
                ATM Deposit
              </Button>
              <Button
                variant={paidThrough === 'cheque_deposit' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('cheque_deposit')}
              >
                Cheque Deposit
              </Button>
              <Button
                variant={paidThrough === 'online_transfer' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('online_transfer')}
              >
                Online Transfer
              </Button>
              <Button
                variant={paidThrough === 'collection_agent' ? 'default' : 'outline'}
                size="sm"
                onPress={() => setPaidThrough('collection_agent')}
              >
                Collection Agent
              </Button>
            </View>
            
            <Text style={styles.modalInfo}>
              This will update bank payment details for all paid payments in this month.
            </Text>
          </View>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={cancelEditCurrentMonthPayment}
          >
            Cancel
          </Button>
          <Button onPress={confirmEditCurrentMonthPayment}>
            {isMarkingPaid ? 'Updating...' : 'Update Payment Details'}
          </Button>
        </ModalFooter>
      </Modal>

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
    borderBottomColor: theme.colors.border,
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
  backButton: {
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
  loadingText: {
    textAlign: 'center',
    padding: theme.spacing.lg,
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
  },
  loanCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  statusCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  paymentsCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  loanDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  detailValue: {
    fontSize: theme.font.size,
    fontWeight: '500',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  monthStatus: {
    gap: theme.spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  statusValue: {
    fontSize: theme.font.size,
    fontWeight: '500',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  markAllButton: {
    marginTop: theme.spacing.sm,
  },
  paymentItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  borrowerName: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  paymentDetails: {
    marginBottom: theme.spacing.md,
  },
  paymentActions: {
    alignItems: 'flex-end',
  },
  overdueText: {
    color: theme.colors.error,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size,
    fontStyle: 'italic',
    padding: theme.spacing.lg,
    fontFamily: theme.font.family,
  },
  modalContent: {
    gap: theme.spacing.md,
  },
  modalLabel: {
    fontSize: theme.font.size,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  paymentMethodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  futureText: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  filterSection: {
    marginBottom: theme.spacing.lg,
  },
  clearFilterButton: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  paymentsList: {
    gap: theme.spacing.md,
  },
  modalInfo: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    fontFamily: theme.font.family,
  },
  noPaymentsInfo: {
    padding: 20,
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  noPaymentsText: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
    marginBottom: theme.spacing.sm,
  },
  editPaymentButton: {
    alignSelf: 'center',
  },
  generatePaymentsButton: {
    marginLeft: theme.spacing.sm,
  },
  debugSection: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
  },
  debugTitle: {
    fontSize: theme.font.size,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  debugText: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  modalSectionTitle: {
    fontSize: theme.font.size,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  bankPaymentDetails: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
  },
  bankPaymentTitle: {
    fontSize: theme.font.size,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  bankDetails: {
    gap: theme.spacing.xs,
  },
}); 