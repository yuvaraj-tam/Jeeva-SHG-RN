import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../components/ui/Modal';
import { MultiSelectDropdown } from '../components/ui/MultiSelectDropdown';
import { AuthService } from '../services/authService';
import { User } from 'firebase/auth';
import { format, parseISO, isThisMonth, compareAsc } from 'date-fns';
import { Loan, LoanUser, Payment } from '../types';
import { theme } from '../theme';
import { LoanService } from '../services/loanService';
import { BorrowerService } from '../services/borrowerService';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { PaymentService } from '../services/paymentService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoansScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [borrowers, setBorrowers] = useState<LoanUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddLoanModal, setShowAddLoanModal] = useState(false);
  const [loanPaymentStatus, setLoanPaymentStatus] = useState<Record<string, {
    isPaid: boolean;
    paymentDate?: string;
  }>>({});
  const [formData, setFormData] = useState<Partial<Loan> & { emiAmounts?: Record<string, number> }>({ borrowerIds: [], emiAmounts: {} });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loanNumberError, setLoanNumberError] = useState<string>('');
  const [confirmDeleteLoanId, setConfirmDeleteLoanId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [confirmMarkPaid, setConfirmMarkPaid] = useState<{ paymentId: string, borrowerName: string } | null>(null);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState<{ loan: Loan } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<any>({});

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    // Subscribe to Firestore loans, borrowers, and payments
    const unsubscribeLoans = LoanService.subscribeToLoans(setLoans);
    const unsubscribeBorrowers = BorrowerService.subscribeToBorrowers(setBorrowers);
    const unsubscribePayments = PaymentService.subscribeToPayments(setPayments);
    return () => {
      unsubscribeLoans();
      unsubscribeBorrowers();
      unsubscribePayments();
    };
  }, []);

  // Filter loans based on search query and status filter
  const filteredLoans = loans.filter((loan) => {
    if (statusFilter !== 'all' && loan.status !== statusFilter) {
      return false;
    }
    // Search filter (by loan number, loan name, or purpose)
    const searchLower = searchQuery.toLowerCase();
    return (
      (loan.loanNumber && loan.loanNumber.toLowerCase().includes(searchLower)) ||
      (loan.loanName && loan.loanName.toLowerCase().includes(searchLower)) ||
      (loan.loanPurpose && loan.loanPurpose.toLowerCase().includes(searchLower))
    );
  });

  // Sort loans - prioritize by current month due dates, then active status, then by start date
  const sortedLoans = [...filteredLoans].sort((loanA, loanB) => {
    // Sort by current month due date
    const paymentsA = payments.filter(p => p.loanId === loanA.id && isThisMonth(parseISO(p.dueDate)));
    const paymentsB = payments.filter(p => p.loanId === loanB.id && isThisMonth(parseISO(p.dueDate)));
    
    if (paymentsA.length === 0 && paymentsB.length === 0) {
      // If no current month payments, sort by active status first, then by start date
      if (loanA.status === 'active' && loanB.status !== 'active') return -1;
      if (loanA.status !== 'active' && loanB.status === 'active') return 1;
      return (loanB.startDate || '').localeCompare(loanA.startDate || '');
    }
    if (paymentsA.length === 0) return 1;
    if (paymentsB.length === 0) return -1;
    
    const earliestA = paymentsA.reduce((earliest, p) => 
      new Date(p.dueDate).getTime() < new Date(earliest.dueDate).getTime() ? p : earliest
    );
    const earliestB = paymentsB.reduce((earliest, p) => 
      new Date(p.dueDate).getTime() < new Date(earliest.dueDate).getTime() ? p : earliest
    );
    
    return new Date(earliestA.dueDate).getTime() - new Date(earliestB.dueDate).getTime();
  });

  const handleAddLoan = async () => {
    setFormData({});
    setShowAddLoanModal(true);
  };

  const handleEditLoan = (loan: Loan) => {
    setFormData(loan);
    setShowAddLoanModal(true);
  };

  const handleSaveOrUpdateLoan = async () => {
    console.log('=== handleSaveOrUpdateLoan START ===');
    console.log('handleSaveOrUpdateLoan called', { formData });
    console.log('formData.id:', formData.id, 'type:', typeof formData.id);
    console.log('=== FORM FIELD VALUES ===');
    console.log('loanName:', formData.loanName);
    console.log('loanPurpose:', formData.loanPurpose);
    console.log('totalAmount:', formData.totalAmount);
    console.log('totalEmis:', formData.totalEmis);
    console.log('emiAmount:', formData.emiAmount);
    console.log('startDate:', formData.startDate);
    console.log('endDate:', formData.endDate);
    console.log('=== END FORM FIELD VALUES ===');
    setLoanNumberError('');
    const borrowerIds: string[] = formData.borrowerIds || [];
    console.log('borrowerIds:', borrowerIds);
    
    const errors: any = {};
    if (!formData.loanName) errors.loanName = 'Loan name is required';
    if (!formData.loanPurpose) errors.loanPurpose = 'Purpose is required';
    if (!formData.totalAmount) errors.totalAmount = 'Total amount is required';
    if (!formData.totalEmis) errors.totalEmis = 'Total EMIs is required';
    if (!formData.emiAmount) errors.emiAmount = 'EMI amount is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (borrowerIds.length === 0) errors.borrowerIds = 'Select at least one borrower';
    
    console.log('Validation errors:', errors);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      console.log('Validation failed, returning early');
      return;
    }
    console.log('Validation passed, proceeding...');
    
    try {
      const isUpdate = formData.id && typeof formData.id === 'string' && formData.id.length > 0;
      console.log('Is update?', isUpdate);
      
      if (isUpdate) {
        console.log('Taking UPDATE path');
        await LoanService.updateLoan(formData.id!, {
          ...formData,
          borrowerIds,
        });
        Alert.alert('Success', 'Loan updated successfully!');
      } else {
        console.log('Taking CREATE path');
        console.log('About to call LoanService.addLoan with:', {
          ...formData,
          borrowerIds,
          startDate: formData.startDate || '',
          endDate: formData.endDate || '',
          totalAmount: formData.totalAmount ?? 0,
          emiAmount: formData.emiAmount ?? 0,
          totalEmis: formData.totalEmis ?? 0,
          status: 'active',
          interestRate: 0,
          remainingAmount: 0,
          paidAmount: 0,
          paidEmis: 0,
        });
        await LoanService.addLoan({
          ...formData,
          borrowerIds,
          startDate: formData.startDate || '',
          endDate: formData.endDate || '',
          totalAmount: formData.totalAmount ?? 0,
          emiAmount: formData.emiAmount ?? 0,
          totalEmis: formData.totalEmis ?? 0,
          status: 'active',
          interestRate: 0,
          remainingAmount: 0,
          paidAmount: 0,
          paidEmis: 0,
        });
        console.log('LoanService.addLoan completed successfully');
        Alert.alert('Success', 'Loan added successfully!');
      }
      console.log('About to close modal and reset form');
      setShowAddLoanModal(false);
      setFormData({ borrowerIds: [] });
      setFieldErrors({});
      console.log('=== handleSaveOrUpdateLoan END SUCCESS ===');
    } catch (e: any) {
      console.error('=== handleSaveOrUpdateLoan ERROR ===');
      console.error('Loan creation error:', e);
      if (e?.message && e.message.includes('Loan ID already exists')) {
        setLoanNumberError(e.message);
      } else {
        Alert.alert('Error', 'Failed to save loan. ' + (e?.message || JSON.stringify(e)));
      }
    }
  };

  const handleDeleteLoan = (loanId: string) => {
    setConfirmDeleteLoanId(loanId);
  };

  const confirmDeleteLoan = async () => {
    if (!confirmDeleteLoanId) return;
    setIsDeleting(true);
    try {
      // Use enhanced deletion with proper cascade cleanup
      await LoanService.deleteLoanWithCleanup(confirmDeleteLoanId, async (message) => {
        return await new Promise((resolve) => {
          Alert.alert(
            'Confirm Delete',
            message,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
            ],
            { cancelable: false }
          );
        });
      });
      setConfirmDeleteLoanId(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete loan. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteLoan = () => {
    setConfirmDeleteLoanId(null);
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      console.log('Navigation object:', navigation);
      if (navigation && typeof navigation.replace === 'function') {
        navigation.replace('Login');
      } else if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Login');
      } else {
        Alert.alert('Logout Error', 'Navigation is not available.');
      }
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const handleMarkAsPaid = async (loanId: string) => {
    // Find all unpaid payments for this loan for the current month
    const thisMonthPayments = payments.filter(p => p.loanId === loanId && isThisMonth(parseISO(p.dueDate)) && !p.isPaid);
    try {
      await Promise.all(thisMonthPayments.map(p => PaymentService.updatePayment(p.id, { isPaid: true, paymentDate: new Date().toISOString() })));
      Alert.alert('Success', 'Marked as paid for all borrowers for this month!');
    } catch (e) {
      Alert.alert('Error', 'Failed to mark as paid.');
    }
  };

  const handleMarkBorrowerPaid = (paymentId: string, borrowerName: string) => {
    setConfirmMarkPaid({ paymentId, borrowerName });
  };

  const confirmMarkBorrowerPaid = async () => {
    if (!confirmMarkPaid) return;
    setIsMarkingPaid(true);
    try {
      await PaymentService.updatePayment(confirmMarkPaid.paymentId, { isPaid: true, paymentDate: new Date().toISOString() });
      setConfirmMarkPaid(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to mark as paid.');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const cancelMarkBorrowerPaid = () => {
    setConfirmMarkPaid(null);
  };

  const handleViewLoanDetails = (loan: Loan) => {
    setShowLoanDetails({ loan });
  };

  const closeLoanDetails = () => setShowLoanDetails(null);

  const renderLoanItem = ({ item }: { item: Loan }) => {
    const paymentStatus = loanPaymentStatus[item.id];
    // For Mark as Paid button
    const thisMonthPayments = payments.filter(p => p.loanId === item.id && isThisMonth(parseISO(p.dueDate)));
    const allPaid = thisMonthPayments.length > 0 && thisMonthPayments.every(p => p.isPaid);
    // Map borrowerId to payment
    const paymentByBorrower: Record<string, Payment | undefined> = {};
    thisMonthPayments.forEach(p => {
      if (p.borrowerId) paymentByBorrower[p.borrowerId] = p;
    });

    return (
      <View style={styles.loanItem}>
        <View style={styles.loanHeader}>
                  <View>
          <Text style={styles.loanName}>{item.loanName}</Text>
          <Text style={styles.loanId}>Loan Number: {item.loanNumber || 'N/A'}</Text>
          <Text style={styles.borrowerCount}>Borrowers: {item.borrowerIds?.length || 0}</Text>
        </View>
          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Badge>
        </View>
        
        <View style={styles.loanDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Loan Amount:</Text>
            <Text style={styles.detailValue}>₹{item.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>EMI:</Text>
            <Text style={styles.detailValue}>₹{item.emiAmount.toLocaleString()}</Text>
          </View>
          {item.totalEmis && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total EMI:</Text>
              <Text style={styles.detailValue}>{item.totalEmis}</Text>
            </View>
          )}
          {item.loanBank && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank:</Text>
              <Text style={styles.detailValue}>{item.loanBank}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Date:</Text>
            <Text style={styles.detailValue}>{format(parseISO(item.startDate), 'dd MMM yyyy')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>End Date:</Text>
            <Text style={styles.detailValue}>{format(parseISO(item.endDate), 'dd MMM yyyy')}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>This Month:</Text>
            <View style={styles.paymentStatus}>
              {item.status === 'active' ? (
                paymentStatus ? (
                  paymentStatus.isPaid ? (
                    <Badge variant="default">Paid</Badge>
                  ) : (
                    <Badge variant="destructive">Unpaid</Badge>
                  )
                ) : (
                  <Badge variant="outline">Not scheduled</Badge>
                )
              ) : (
                <Badge variant="secondary">Closed</Badge>
              )}
            </View>
          </View>
          {paymentStatus && paymentStatus.isPaid && paymentStatus.paymentDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Date:</Text>
              <Text style={styles.detailValue}>
                {format(parseISO(paymentStatus.paymentDate), 'dd MMM yyyy')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.borrowerPaymentsList}>
          {(item.borrowerIds || []).map(borrowerId => {
            const borrower = borrowers.find(b => b.id === borrowerId);
            const payment = paymentByBorrower[borrowerId];
            return (
              <View key={borrowerId} style={styles.borrowerPaymentRow}>
                <Text style={styles.borrowerName}>{borrower?.name || 'Unknown'}</Text>
                {payment && payment.isPaid ? (
                  <Badge variant="default">Paid</Badge>
                ) : payment ? (
                  <Button
                    size="sm"
                    variant="default"
                    onPress={() => handleMarkBorrowerPaid(payment.id, borrower?.name || 'Unknown')}
                    disabled={isMarkingPaid}
                  >
                    Mark as Paid
                  </Button>
                ) : (
                  <Badge variant="outline">No EMI</Badge>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.loanActions}>
          <Button
            variant="outline"
            size="sm"
            onPress={() => handleEditLoan(item)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => handleViewLoanDetails(item)}
          >
            View Details
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onPress={() => handleDeleteLoan(item.id)}
          >
            Delete
          </Button>
          <Button
            variant="default"
            size="sm"
            onPress={() => handleMarkAsPaid(item.id)}
            disabled={allPaid || thisMonthPayments.length === 0}
          >
            Mark all as Paid
          </Button>
        </View>

        {/* Confirm Mark as Paid Modal */}
        <ConfirmModal
          visible={!!confirmMarkPaid}
          title="Mark as Paid"
          message={`Mark payment as paid for ${confirmMarkPaid?.borrowerName}?`}
          confirmText={isMarkingPaid ? 'Marking...' : 'Yes, Mark as Paid'}
          cancelText="Cancel"
          onConfirm={confirmMarkBorrowerPaid}
          onCancel={cancelMarkBorrowerPaid}
        />

        {/* Loan Details Modal */}
        {showLoanDetails && showLoanDetails.loan.id === item.id && (
          <Modal visible onClose={closeLoanDetails}>
            <ModalHeader title={`Loan Details: ${item.loanName || item.loanNumber || item.id}`} onClose={closeLoanDetails} />
            <ModalContent>
              <View style={styles.loanDetailsModal}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Purpose:</Text>
                  <Text style={styles.detailValue}>{item.loanPurpose || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total Amount:</Text>
                  <Text style={styles.detailValue}>₹{item.totalAmount.toLocaleString()}</Text>
                </View>
                {item.totalEmis && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total EMI:</Text>
                    <Text style={styles.detailValue}>{item.totalEmis}</Text>
                  </View>
                )}
                {item.loanBank && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bank:</Text>
                    <Text style={styles.detailValue}>{item.loanBank}</Text>
                  </View>
                )}
                {item.loanAccountNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Number:</Text>
                    <Text style={styles.detailValue}>{item.loanAccountNumber}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sectionSubtitle}>Borrowers and Payment Status (This Month)</Text>
              <View style={styles.borrowerPaymentsList}>
                {(item.borrowerIds || []).map(borrowerId => {
                  const borrower = borrowers.find(b => b.id === borrowerId);
                  const payment = payments.find(p => p.loanId === item.id && p.borrowerId === borrowerId && isThisMonth(parseISO(p.dueDate)));
                  return (
                    <View key={borrowerId} style={styles.borrowerPaymentRow}>
                      <Text style={styles.borrowerName}>{borrower?.name || 'Unknown'}</Text>
                      {payment && payment.isPaid ? (
                        <Badge variant="default">Paid</Badge>
                      ) : payment ? (
                        <Badge variant="destructive">Unpaid</Badge>
                      ) : (
                        <Badge variant="outline">No EMI</Badge>
                      )}
                    </View>
                  );
                })}
              </View>
            </ModalContent>
          </Modal>
        )}
      </View>
    );
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
          <Text style={styles.title}>Loans</Text>
          {user && (
            <Text style={styles.userInfo}>Welcome, {user.email}</Text>
          )}
        </View>
        <Button variant="outline" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </View>

      {/* Search and filters */}
      <View style={styles.searchContainer}>
        <Input
          placeholder="Search loans by loan number, name, or purpose..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchInput}
        />
        <View style={styles.filterButtons}>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onPress={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onPress={() => setStatusFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onPress={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <Button onPress={handleAddLoan}>
          Create New Loan
        </Button>
      </View>

      {/* Loans List */}
      <Card style={styles.loansCard}>
        <CardHeader>
          <CardTitle>Loan Management</CardTitle>
          <CardDescription>
            Manage all your loans and track monthly payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedLoans.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery || statusFilter !== 'all' ? 
                'No loans found matching your search criteria.' : 
                'No loans yet. Create your first loan to get started.'}
            </Text>
          ) : (
            <View style={styles.loansGrid}>
              {sortedLoans.map((loan) => renderLoanItem({ item: loan }))}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Add Loan Modal */}
      <Modal
        visible={showAddLoanModal}
        onClose={() => setShowAddLoanModal(false)}
      >
        <ModalHeader
          title={formData.id ? "Edit Loan" : "Create New Loan"}
          onClose={() => setShowAddLoanModal(false)}
        />
        <ModalContent>
          <View style={styles.modalContent}>
            <Input
              label="Loan Name *"
              placeholder="Enter loan name"
              value={formData.loanName || ''}
              onChangeText={(text: string) => setFormData({ ...formData, loanName: text })}
              error={fieldErrors.loanName}
            />
            <Input
              label="Loan Purpose *"
              placeholder="Enter loan purpose"
              value={formData.loanPurpose || ''}
              onChangeText={(text: string) => setFormData({ ...formData, loanPurpose: text })}
              error={fieldErrors.loanPurpose}
            />
            <MultiSelectDropdown
              label="Select Borrowers"
              placeholder="Choose borrowers for this loan..."
              options={borrowers.map(borrower => ({
                id: borrower.id,
                label: borrower.name,
                subtitle: borrower.phoneNumber
              }))}
              selectedIds={formData.borrowerIds || []}
              onSelectionChange={(selectedIds) => {
                setFormData({ ...formData, borrowerIds: selectedIds });
              }}
              required={true}
              disabled={borrowers.length === 0}
              error={fieldErrors.borrowerIds}
            />
            <Input
              label="Total Amount *"
              placeholder="Enter total amount"
              keyboardType="numeric"
              value={formData.totalAmount ? String(formData.totalAmount) : ''}
              onChangeText={(text: string) => setFormData({ ...formData, totalAmount: Number(text) })}
              error={fieldErrors.totalAmount}
            />
            <Input
              label="Total EMI *"
              placeholder="Enter total number of EMIs"
              keyboardType="numeric"
              value={formData.totalEmis ? String(formData.totalEmis) : ''}
              onChangeText={(text: string) => setFormData({ ...formData, totalEmis: Number(text) })}
              error={fieldErrors.totalEmis}
            />
            <Input
              label="EMI Amount *"
              placeholder="Enter EMI amount per borrower"
              keyboardType="numeric"
              value={formData.emiAmount ? String(formData.emiAmount) : ''}
              onChangeText={(text: string) => setFormData({ ...formData, emiAmount: Number(text) })}
              error={fieldErrors.emiAmount}
            />
            <Input
              label="Loan Bank"
              placeholder="Enter bank name"
              value={formData.loanBank || ''}
              onChangeText={(text: string) => setFormData({ ...formData, loanBank: text })}
            />
            <Input
              label="Loan Account Number"
              placeholder="Enter account number"
              value={formData.loanAccountNumber || ''}
              onChangeText={(text: string) => setFormData({ ...formData, loanAccountNumber: text })}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Input
                label="EMI Start Date *"
                placeholder="Select start date"
                value={formData.startDate ? format(parseISO(formData.startDate), 'dd/MM/yyyy') : ''}
                style={{ flex: 1 }}
                onPressIn={() => Platform.OS !== 'web' && setShowStartDatePicker(true)}
                editable={false}
                error={fieldErrors.startDate}
              />
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={formData.startDate ? formData.startDate.substring(0, 10) : ''}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value + 'T00:00:00.000Z' })}
                  style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
              ) : (
                <Button size="sm" onPress={() => setShowStartDatePicker(true)}>
                  Pick
                </Button>
              )}
              {showStartDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={formData.startDate ? parseISO(formData.startDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    setShowStartDatePicker(false);
                    if (date) setFormData({ ...formData, startDate: date.toISOString() });
                  }}
                />
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Input
                label="EMI End Date *"
                placeholder="Select end date"
                value={formData.endDate ? format(parseISO(formData.endDate), 'dd/MM/yyyy') : ''}
                style={{ flex: 1 }}
                onPressIn={() => Platform.OS !== 'web' && setShowEndDatePicker(true)}
                editable={false}
                error={fieldErrors.endDate}
              />
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={formData.endDate ? formData.endDate.substring(0, 10) : ''}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value + 'T00:00:00.000Z' })}
                  style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
              ) : (
                <Button size="sm" onPress={() => setShowEndDatePicker(true)}>
                  Pick
                </Button>
              )}
              {showEndDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={formData.endDate ? parseISO(formData.endDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event: DateTimePickerEvent, date?: Date) => {
                    setShowEndDatePicker(false);
                    if (date) setFormData({ ...formData, endDate: date.toISOString() });
                  }}
                />
              )}
            </View>
            {loanNumberError ? (
              <Text style={{ color: theme.colors.error, marginBottom: theme.spacing.md }}>{loanNumberError}</Text>
            ) : null}
          </View>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={() => {
              setShowAddLoanModal(false);
              setFormData({});
            }}
          >
            Cancel
          </Button>
          <Button 
            onPress={() => {
              console.log('Update/Create button clicked', { formDataId: formData.id, loanNumberError });
              handleSaveOrUpdateLoan();
            }} 
            disabled={!!loanNumberError}
          >
            {formData.id ? 'Update Loan' : 'Create Loan'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={!!confirmDeleteLoanId}
        title="Delete Loan"
        message="Are you sure you want to delete this loan? This will also delete all associated payments."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={confirmDeleteLoan}
        onCancel={cancelDeleteLoan}
      />
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
  searchContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    marginBottom: theme.spacing.md,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
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
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  loanId: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  borrowerCount: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
  },
  loanDetails: {
    marginBottom: theme.spacing.md,
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
  paymentStatus: {
    alignItems: 'flex-end',
  },
  loanActions: {
    alignItems: 'flex-end',
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
  borrowerPaymentsList: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  borrowerPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 2,
  },
  borrowerName: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  sectionSubtitle: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
    marginBottom: theme.spacing.md,
  },
  loanDetailsModal: {
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
}); 