import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
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
import { AuthService } from '../services/authService';
import { User } from 'firebase/auth';
import { LoanUser, Loan, Payment } from '../types';
import { theme } from '../theme';
import { BorrowerService, deleteBorrowerAndCleanup } from '../services/borrowerService';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { LoanService } from '../services/loanService';
import { PaymentService } from '../services/paymentService';
import { isThisMonth, parseISO } from 'date-fns';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Using real Firestore data - no mock data needed

export default function BorrowersScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [borrowers, setBorrowers] = useState<LoanUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddBorrowerModal, setShowAddBorrowerModal] = useState(false);
  const [formData, setFormData] = useState<Partial<LoanUser>>({});
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<LoanUser | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [confirmDeleteBorrowerId, setConfirmDeleteBorrowerId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showBorrowerDetails, setShowBorrowerDetails] = useState<{ borrower: LoanUser; borrowerLoans: Loan[] } | null>(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    // Subscribe to Firestore borrowers
    const unsubscribe = BorrowerService.subscribeToBorrowers((updatedBorrowers) => {
      console.log('Borrowers updated:', updatedBorrowers.length);
      setBorrowers(updatedBorrowers);
    });
    const unsubscribeLoans = LoanService.subscribeToLoans((updatedLoans) => {
      console.log('Loans updated:', updatedLoans.length);
      console.log('Loans data:', updatedLoans);
      setLoans(updatedLoans);
    });
    const unsubscribePayments = PaymentService.subscribeToPayments((updatedPayments) => {
      console.log('Payments updated:', updatedPayments.length);
      setPayments(updatedPayments);
    });
    return () => {
      unsubscribe();
      unsubscribeLoans();
      unsubscribePayments();
    };
  }, []);

  // Filter users based on search query
  const filteredBorrowers = borrowers.filter((borrower) =>
    borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    borrower.phoneNumber.includes(searchQuery) ||
    (borrower.email && borrower.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Count active loans for each borrower
  const getBorrowerActiveLoans = (userId: string) => {
    const activeLoans = loans.filter(loan => {
      return loan.borrowerIds && loan.borrowerIds.includes(userId) && loan.status === 'active';
    });
    console.log(`Borrower ${userId} has ${activeLoans.length} active loans out of ${loans.length} total loans`);
    return activeLoans.length;
  };

  // Calculate total loan amount for each borrower
  const getBorrowerTotalLoanAmount = (userId: string) => {
    const borrowerLoans = loans.filter(loan => {
      return loan.borrowerIds && loan.borrowerIds.includes(userId);
    });
    const total = borrowerLoans.reduce((sum, loan) => sum + loan.totalAmount, 0);
    console.log(`Borrower ${userId} has total loan amount: ₹${total} from ${borrowerLoans.length} loans`);
    return total;
  };

  const handleAddBorrower = () => {
    console.log('handleAddBorrower called');
    console.log('Current showAddBorrowerModal state:', showAddBorrowerModal);
    try {
      setFormData({});
      setShowAddBorrowerModal(true);
      console.log('Modal state set to true');
    } catch (error) {
      console.error('Error in handleAddBorrower:', error);
    }
  };

  const handleSaveBorrower = async () => {
    setFieldErrors({});
    if (!formData.name || !formData.phoneNumber) {
      setFieldErrors(prev => ({ ...prev, name: 'Name is required', phoneNumber: 'Phone number is required' }));
      return;
    }
    try {
      await BorrowerService.addBorrower({
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        occupation: formData.occupation,
        monthlyIncome: formData.monthlyIncome,
        bankAccount: formData.bankAccount,
        ifscCode: formData.ifscCode,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
      });
      setShowAddBorrowerModal(false);
      setFormData({});
    } catch (error: any) {
      // Parse error message for field
      if (typeof error.message === 'string') {
        if (error.message.includes('Aadhar')) setFieldErrors(prev => ({ ...prev, aadharNumber: error.message }));
        else if (error.message.includes('Account')) setFieldErrors(prev => ({ ...prev, bankAccount: error.message }));
        else if (error.message.includes('PAN')) setFieldErrors(prev => ({ ...prev, panNumber: error.message }));
        else setFieldErrors(prev => ({ ...prev, general: error.message }));
      }
    }
  };



  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleBorrowerPress = (borrower: LoanUser) => {
    setSelectedBorrower(borrower);
    setShowDetailModal(true);
  };

  // Add edit and delete handlers
  const handleEditBorrower = (borrower: LoanUser) => {
    setFormData(borrower);
    setShowAddBorrowerModal(true);
  };

  const handleUpdateBorrower = async () => {
    setFieldErrors({});
    if (!formData.id || !formData.name || !formData.phoneNumber) {
      setFieldErrors(prev => ({ ...prev, name: 'Name is required', phoneNumber: 'Phone number is required' }));
      return;
    }
    try {
      await BorrowerService.updateBorrower(formData.id, {
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        occupation: formData.occupation,
        monthlyIncome: formData.monthlyIncome,
        bankAccount: formData.bankAccount,
        ifscCode: formData.ifscCode,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
      });
      setShowAddBorrowerModal(false);
      setFormData({});
    } catch (error: any) {
      if (typeof error.message === 'string') {
        if (error.message.includes('Aadhar')) setFieldErrors(prev => ({ ...prev, aadharNumber: error.message }));
        else if (error.message.includes('Account')) setFieldErrors(prev => ({ ...prev, bankAccount: error.message }));
        else if (error.message.includes('PAN')) setFieldErrors(prev => ({ ...prev, panNumber: error.message }));
        else setFieldErrors(prev => ({ ...prev, general: error.message }));
      }
    }
  };

  const handleDeleteBorrower = (borrowerId: string) => {
    setConfirmDeleteBorrowerId(borrowerId);
  };

  const confirmDeleteBorrower = async () => {
    if (!confirmDeleteBorrowerId) return;
    setIsDeleting(true);
    try {
      // Use enhanced deletion with proper cascade cleanup
      await BorrowerService.deleteBorrowerWithCleanup(confirmDeleteBorrowerId, async (message) => {
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
      setConfirmDeleteBorrowerId(null);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete borrower. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteBorrower = () => {
    setConfirmDeleteBorrowerId(null);
  };

  // Update save logic to handle add vs update
  const handleSaveOrUpdateBorrower = async () => {
    if (formData.id) {
      await handleUpdateBorrower();
    } else {
      await handleSaveBorrower();
    }
  };

  const handleViewBorrowerDetails = (borrower: LoanUser) => {
    // Find all loans for this borrower
    const borrowerLoans = loans.filter(loan => (loan.borrowerIds || []).includes(borrower.id));
    setShowBorrowerDetails({ borrower, borrowerLoans });
  };

  const closeBorrowerDetails = () => setShowBorrowerDetails(null);

  const renderBorrowerItem = ({ item }: { item: LoanUser }) => {
    const activeLoans = getBorrowerActiveLoans(item.id);
    const totalLoanAmount = getBorrowerTotalLoanAmount(item.id);

    return (
      <View style={styles.borrowerItem}>
        <View style={styles.borrowerHeader}>
          <Text style={styles.borrowerName}>{item.name}</Text>
          <Badge variant={activeLoans > 0 ? 'default' : 'secondary'}>
            {activeLoans} Active Loans
          </Badge>
        </View>
        
        <View style={styles.borrowerDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <TouchableOpacity onPress={() => handleCall(item.phoneNumber)}>
              <Text style={styles.contactLink}>{item.phoneNumber}</Text>
            </TouchableOpacity>
          </View>
          
          {item.email && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <TouchableOpacity onPress={() => handleEmail(item.email!)}>
                <Text style={styles.contactLink}>{item.email}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{item.address}</Text>
          </View>
          
          {item.occupation && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Occupation:</Text>
              <Text style={styles.detailValue}>{item.occupation}</Text>
            </View>
          )}
          
          {item.monthlyIncome && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Income:</Text>
              <Text style={styles.detailValue}>₹{item.monthlyIncome.toLocaleString()}</Text>
            </View>
          )}
          
          {item.emergencyContact && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Emergency Contact:</Text>
              <TouchableOpacity onPress={() => handleCall(item.emergencyContact!)}>
                <Text style={styles.contactLink}>{item.emergencyContact}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Loan Amount:</Text>
            <Text style={styles.detailValue}>₹{totalLoanAmount.toLocaleString()}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Member Since:</Text>
            <Text style={styles.detailValue}>{item.createdAt}</Text>
          </View>
        </View>

        <View style={styles.borrowerActions}>
          <Button 
            variant="outline" 
            size="sm"
            onPress={() => handleViewBorrowerDetails(item)}
          >
            View Details
          </Button>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Button size="sm" variant="outline" onPress={() => handleEditBorrower(item)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onPress={() => handleDeleteBorrower(item.id)}>
            Delete
          </Button>
        </View>
      </View>
    );
  };

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
          <Text style={styles.title}>Borrowers</Text>
          {user && (
            <Text style={styles.userInfo}>Welcome, {user.email}</Text>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search borrowers by name, phone or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Data Summary */}
      <Card style={styles.summaryCard}>
        <CardContent>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{borrowers.length}</Text>
              <Text style={styles.summaryLabel}>Total Borrowers</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{loans.length}</Text>
              <Text style={styles.summaryLabel}>Total Loans</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{loans.filter(l => l.status === 'active').length}</Text>
              <Text style={styles.summaryLabel}>Active Loans</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{payments.length}</Text>
              <Text style={styles.summaryLabel}>Total Payments</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <Button onPress={handleAddBorrower}>
          Add New Borrower
        </Button>
      </View>

      {/* Borrowers List */}
      <Card style={styles.borrowersCard}>
        <CardHeader>
          <CardTitle>Borrower Information</CardTitle>
          <CardDescription>
            Manage your borrowers and their contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBorrowers.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery ? 
                'No borrowers found matching your search.' : 
                'No borrowers yet. Add your first borrower to get started.'}
            </Text>
          ) : (
            <View style={styles.borrowersGrid}>
              {filteredBorrowers.map((borrower) => {
                const item = renderBorrowerItem({ item: borrower });
                return React.cloneElement(item, { key: borrower.id });
              })}
            </View>
          )}
        </CardContent>
      </Card>

      {/* Add Borrower Modal */}
      <Modal
        visible={showAddBorrowerModal}
        onClose={() => setShowAddBorrowerModal(false)}
        size="large"
      >
        <ModalHeader
          title="Add New Borrower"
          onClose={() => {
            setShowAddBorrowerModal(false);
            setFormData({});
          }}
        />
        <ModalContent style={{ flexGrow: 1, paddingBottom: 32, paddingTop: 8, paddingHorizontal: 16 }}>
          <View style={styles.modalContent}>
            <Input
              label="Full Name *"
              placeholder="Enter full name"
              value={formData.name || ''}
              onChangeText={(text: string) => setFormData({ ...formData, name: text })}
              error={fieldErrors.name}
            />
            <Input
              label="Phone Number *"
              placeholder="Enter phone number"
              value={formData.phoneNumber || ''}
              onChangeText={(text: string) => setFormData({ ...formData, phoneNumber: text })}
              keyboardType="phone-pad"
              error={fieldErrors.phoneNumber}
            />
            <Input
              label="Email"
              placeholder="Enter email address"
              value={formData.email || ''}
              onChangeText={(text: string) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
            />
            <Input
              label="Address"
              placeholder="Enter address"
              value={formData.address || ''}
              onChangeText={(text: string) => setFormData({ ...formData, address: text })}
              multiline
              numberOfLines={2}
            />
            <Input
              label="Emergency Contact"
              placeholder="Enter emergency contact number"
              value={formData.emergencyContact || ''}
              onChangeText={(text: string) => setFormData({ ...formData, emergencyContact: text })}
              keyboardType="phone-pad"
            />
            <Input
              label="Occupation"
              placeholder="Enter occupation"
              value={formData.occupation || ''}
              onChangeText={(text: string) => setFormData({ ...formData, occupation: text })}
            />
            <Input
              label="Monthly Income"
              placeholder="Enter monthly income"
              value={formData.monthlyIncome?.toString() || ''}
              onChangeText={(text: string) => setFormData({ ...formData, monthlyIncome: parseFloat(text) || undefined })}
              keyboardType="numeric"
            />
            <Input
              label="Bank Account Number"
              placeholder="Enter bank account number"
              value={formData.bankAccount || ''}
              onChangeText={(text: string) => setFormData({ ...formData, bankAccount: text })}
              keyboardType="numeric"
              error={fieldErrors.bankAccount}
            />
            <Input
              label="IFSC Code"
              placeholder="Enter IFSC code"
              value={formData.ifscCode || ''}
              onChangeText={(text: string) => setFormData({ ...formData, ifscCode: text })}
            />
            <Input
              label="Aadhar Number"
              placeholder="Enter Aadhar number"
              value={formData.aadharNumber || ''}
              onChangeText={(text: string) => setFormData({ ...formData, aadharNumber: text })}
              keyboardType="numeric"
              error={fieldErrors.aadharNumber}
            />
            <Input
              label="PAN Number"
              placeholder="Enter PAN number"
              value={formData.panNumber || ''}
              onChangeText={(text: string) => setFormData({ ...formData, panNumber: text })}
              error={fieldErrors.panNumber}
            />
          </View>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={() => {
              setShowAddBorrowerModal(false);
              setFormData({});
            }}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSaveOrUpdateBorrower}
            disabled={Object.keys(fieldErrors).length > 0 && Object.values(fieldErrors).some(Boolean)}
          >
            {formData.id ? 'Update Borrower' : 'Add Borrower'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={!!confirmDeleteBorrowerId}
        title="Delete Borrower"
        message="Are you sure you want to delete this borrower? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={confirmDeleteBorrower}
        onCancel={cancelDeleteBorrower}
      />

      {showBorrowerDetails && (
        <Modal visible onClose={closeBorrowerDetails} size="medium">
          <ModalHeader title={`Borrower Details: ${showBorrowerDetails.borrower.name}`} onClose={closeBorrowerDetails} />
          <ModalContent>
            <Text style={styles.sectionSubtitle}>Loans and Payment Status (This Month)</Text>
            <View style={styles.borrowerLoansList}>
              {(showBorrowerDetails.borrowerLoans || []).map((loan: Loan) => {
                const payment = payments.find(p => p.loanId === loan.id && p.borrowerId === showBorrowerDetails.borrower.id && isThisMonth(parseISO(p.dueDate)));
                // Get EMI amount for this borrower
                const emiAmount = loan.emiAmounts && loan.emiAmounts[showBorrowerDetails.borrower.id] !== undefined ? loan.emiAmounts[showBorrowerDetails.borrower.id] : loan.emiAmount;
                return (
                  <View key={loan.id} style={styles.borrowerLoanRow}>
                    <Text style={styles.loanName}>{loan.loanName || loan.loanNumber || loan.id}</Text>
                    <Text style={styles.emiAmount}>EMI: ₹{emiAmount.toLocaleString()}</Text>
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
    minHeight: Platform.OS === 'ios' ? 80 : 60,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: theme.font.sizeTitle,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  userInfo: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontFamily: theme.font.family,
  },
  searchContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  actionContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  summaryCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  summaryItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: '#f3f4f6',
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryValue: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  summaryLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: theme.font.family,
  },
  borrowersCard: {
    margin: theme.spacing.lg,
    marginTop: 0,
  },
  borrowersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  borrowerItem: {
    backgroundColor: '#f9fafb',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  borrowerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  borrowerName: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  borrowerDetails: {
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
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
  contactLink: {
    fontSize: theme.font.size,
    fontWeight: '500',
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontFamily: theme.font.family,
  },
  borrowerActions: {
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
  modalText: {
    fontSize: theme.font.sizeHeading,
    color: theme.colors.text,
    textAlign: 'center',
    padding: theme.spacing.lg,
    fontFamily: theme.font.family,
  },
  modalContent: {
    gap: theme.spacing.md,
  },
  searchInput: {
    fontSize: theme.font.size,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontFamily: theme.font.family,
  },
  sectionSubtitle: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
    marginBottom: theme.spacing.md,
  },
  loanName: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    fontWeight: '500',
  },
  borrowerLoansList: {
    gap: theme.spacing.md,
  },
  borrowerLoanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emiAmount: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontFamily: theme.font.family,
    fontWeight: '500',
  },
}); 