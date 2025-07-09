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
  TextInput,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../components/ui/Modal';
import { AuthService } from '../services/authService';
import { User } from 'firebase/auth';
import { format, parseISO } from 'date-fns';
import { LoanUser, Loan, Payment } from '../types';
import { theme } from '../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock data for logged-in users - replace with actual Firebase data
const mockLoggedInUsers: LoanUser[] = [
  {
    id: 'current_user',
    name: 'Current User',
    phoneNumber: '+91 9876543210',
    email: 'user@example.com',
    address: 'Mumbai, Maharashtra',
    createdAt: '2024-01-01',
    emergencyContact: '+91 9876543211',
    occupation: 'Business Owner',
    monthlyIncome: 50000,
    bankAccount: '1234567890',
    ifscCode: 'SBIN0001234',
    aadharNumber: '1234-5678-9012',
    panNumber: 'ABCDE1234F',
  },
];

// Mock loan data - replace with actual Firebase data
const mockLoans: Loan[] = [
  {
    id: '1',
    userId: 'user1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    totalAmount: 50000,
    emiAmount: 5000,
    interestRate: 12,
    purpose: 'Business Loan',
    status: 'active',
    remainingAmount: 35000,
    paidAmount: 15000,
    totalEmis: 12,
    paidEmis: 3,
    nextDueDate: '2024-05-01',
    overdueDays: 0,
  },
  {
    id: '2',
    userId: 'user1',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    totalAmount: 25000,
    emiAmount: 2500,
    interestRate: 8,
    purpose: 'Education Loan',
    status: 'completed',
    remainingAmount: 0,
    paidAmount: 25000,
    totalEmis: 12,
    paidEmis: 12,
  },
  {
    id: '3',
    userId: 'user2',
    startDate: '2024-02-01',
    endDate: '2025-01-31',
    totalAmount: 30000,
    emiAmount: 3000,
    interestRate: 10,
    purpose: 'Personal Loan',
    status: 'active',
    remainingAmount: 24000,
    paidAmount: 6000,
    totalEmis: 12,
    paidEmis: 2,
    nextDueDate: '2024-04-15',
    overdueDays: 5,
  },
  {
    id: '4',
    userId: 'user3',
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    totalAmount: 40000,
    emiAmount: 4000,
    interestRate: 11,
    purpose: 'Education Loan',
    status: 'active',
    remainingAmount: 32000,
    paidAmount: 8000,
    totalEmis: 12,
    paidEmis: 2,
    nextDueDate: '2024-05-10',
    overdueDays: 0,
  },
];

// Mock payment data
const mockPayments: Payment[] = [
  {
    id: '1',
    loanId: '1',
    amount: 5000,
    dueDate: '2024-04-01',
    paymentDate: '2024-04-01',
    isPaid: true,
    month: 4,
    year: 2024,
    reminderSent: false,
    emiNumber: 4,
  },
  {
    id: '2',
    loanId: '1',
    amount: 5000,
    dueDate: '2024-05-01',
    paymentDate: undefined,
    isPaid: false,
    month: 5,
    year: 2024,
    reminderSent: true,
    emiNumber: 5,
  },
  {
    id: '3',
    loanId: '3',
    amount: 3000,
    dueDate: '2024-04-15',
    paymentDate: undefined,
    isPaid: false,
    month: 4,
    year: 2024,
    reminderSent: true,
    emiNumber: 3,
  },
  {
    id: '4',
    loanId: '4',
    amount: 4000,
    dueDate: '2024-05-10',
    paymentDate: undefined,
    isPaid: false,
    month: 5,
    year: 2024,
    reminderSent: false,
    emiNumber: 3,
  },
];

export default function UserInfoScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState(mockLoggedInUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LoanUser | null>(null);
  const [formData, setFormData] = useState<Partial<LoanUser>>({});

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.phoneNumber.includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.occupation?.toLowerCase().includes(searchLower)
    );
  });

  const handleAddUser = () => {
    setFormData({});
    setShowAddModal(true);
  };

  const handleEditUser = (user: LoanUser) => {
    setSelectedUser(user);
    setFormData(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.phoneNumber) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    try {
      if (showAddModal) {
        // Add new user
        const newUser: LoanUser = {
          id: Date.now().toString(),
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          address: formData.address,
          createdAt: new Date().toISOString(),
          emergencyContact: formData.emergencyContact,
          occupation: formData.occupation,
          monthlyIncome: formData.monthlyIncome,
          bankAccount: formData.bankAccount,
          ifscCode: formData.ifscCode,
          aadharNumber: formData.aadharNumber,
          panNumber: formData.panNumber,
        };
        setUsers([...users, newUser]);
        Alert.alert('Success', 'User added successfully!');
      } else {
        // Update existing user
        const updatedUsers = users.map(u => 
          u.id === selectedUser?.id ? { ...u, ...formData } : u
        );
        setUsers(updatedUsers);
        Alert.alert('Success', 'User updated successfully!');
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({});
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save user. Please try again.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedUsers = users.filter(u => u.id !== userId);
            setUsers(updatedUsers);
            Alert.alert('Success', 'User deleted successfully!');
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      navigation.replace('Login');
    } catch (error: any) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleSMS = (phoneNumber: string) => {
    Linking.openURL(`sms:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\s+/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanNumber}`);
  };

  // Helper functions to get loan information
  const getUserLoans = (userId: string) => {
    return mockLoans.filter(loan => loan.userId === userId);
  };

  const getUserPayments = (userId: string) => {
    const userLoanIds = mockLoans
      .filter(loan => loan.userId === userId)
      .map(loan => loan.id);
    return mockPayments.filter(payment => userLoanIds.includes(payment.loanId));
  };

  const getLoanPaymentStatus = (loanId: string) => {
    const loanPayments = mockPayments.filter(payment => payment.loanId === loanId);
    const paidPayments = loanPayments.filter(payment => payment.isPaid);
    const unpaidPayments = loanPayments.filter(payment => !payment.isPaid);
    
    return {
      totalPayments: loanPayments.length,
      paidPayments: paidPayments.length,
      unpaidPayments: unpaidPayments.length,
      totalPaidAmount: paidPayments.reduce((sum, p) => sum + p.amount, 0),
      totalUnpaidAmount: unpaidPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  };

  const getNextDuePayment = (loanId: string) => {
    return mockPayments
      .filter(payment => payment.loanId === loanId && !payment.isPaid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  };

  const renderUserItem = ({ item }: { item: LoanUser }) => {
    // Only show the current user info
    if (!user) return null;
    // Determine authentication type
    let authType = 'Email/Password';
    if (user.providerData && user.providerData.length > 0) {
      if (user.providerData[0].providerId === 'google.com') authType = 'Google';
    }
    // Determine login status
    const loginStatus = user && user.email === item.email ? 'Active' : 'Inactive';
    // Last logged in
    const lastLogin = user.metadata?.lastSignInTime || '';
    return (
      <View style={styles.userItem}>
        <View style={styles.userHeader}>
          <Text style={styles.userName}>{item.name}</Text>
        </View>
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Authentication Type:</Text>
            <Text style={styles.detailValue}>{authType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Logged In:</Text>
            <Text style={styles.detailValue}>{lastLogin ? format(new Date(lastLogin), 'dd MMM yyyy, hh:mm a') : 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Login Status:</Text>
            <Text style={[styles.detailValue, { color: loginStatus === 'Active' ? 'green' : 'gray' }]}>{loginStatus}</Text>
          </View>
        </View>
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
          <Text style={styles.title}>My Profile</Text>
          {user && (
            <Text style={styles.userInfo}>Welcome, {user.email}</Text>
          )}
        </View>
        <Button variant="outline" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your profile information..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Users List */}
      <Card style={styles.usersCard}>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your personal information and loan details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery ? 
                'No users found matching your search criteria.' : 
                'No users yet.'}
            </Text>
          ) : (
            <FlatList
              data={filteredUsers}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        visible={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedUser(null);
          setFormData({});
        }}
      >
        <ModalHeader
          title={showAddModal ? 'Add New User' : 'Edit User'}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedUser(null);
            setFormData({});
          }}
        />
        <ModalContent>
          <View style={styles.modalContent}>
            <Input
              label="Full Name *"
              placeholder="Enter full name"
              value={formData.name || ''}
              onChangeText={(text: string) => setFormData({ ...formData, name: text })}
            />
            <Input
              label="Phone Number *"
              placeholder="Enter phone number"
              value={formData.phoneNumber || ''}
              onChangeText={(text: string) => setFormData({ ...formData, phoneNumber: text })}
              keyboardType="phone-pad"
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
            />
            <Input
              label="PAN Number"
              placeholder="Enter PAN number"
              value={formData.panNumber || ''}
              onChangeText={(text: string) => setFormData({ ...formData, panNumber: text })}
            />
          </View>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={() => {
              setShowAddModal(false);
              setShowEditModal(false);
              setSelectedUser(null);
              setFormData({});
            }}
          >
            Cancel
          </Button>
          <Button onPress={handleSaveUser}>
            {showAddModal ? 'Add User' : 'Update User'}
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
    padding: Math.max(20, screenWidth * 0.05),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: Platform.OS === 'ios' ? 100 : 80,
  },
  headerContent: {
    flex: 1,
  },
  logoutButton: {
    minWidth: 80,
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
  },
  searchContainer: {
    padding: Math.max(20, screenWidth * 0.05),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: Math.max(12, screenWidth * 0.03),
  },
  usersCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  searchInput: {
    marginBottom: 0,
    fontSize: theme.font.size,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.sm,
    fontFamily: theme.font.family,
  },
  userItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: Math.max(16, screenWidth * 0.04),
    marginBottom: Math.max(12, screenWidth * 0.03),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.max(12, screenWidth * 0.03),
  },
  userName: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  userDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size,
    fontStyle: 'italic',
    padding: Math.max(20, screenWidth * 0.05),
  },
  modalContent: {
    gap: Math.max(16, screenWidth * 0.04),
  },
  contactActions: {
    flex: 1,
    alignItems: 'flex-end',
  },
  clickableText: {
    fontSize: theme.font.size,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  contactButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  // Loan Information Styles
  loanSection: {
    marginTop: Math.max(16, screenWidth * 0.04),
    paddingTop: Math.max(16, screenWidth * 0.04),
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: Math.max(12, screenWidth * 0.03),
    fontFamily: theme.font.family,
  },
  noLoansText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.font.size,
    fontStyle: 'italic',
    padding: Math.max(12, screenWidth * 0.03),
  },
  loanCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: Math.max(12, screenWidth * 0.03),
    marginBottom: Math.max(12, screenWidth * 0.03),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.max(12, screenWidth * 0.03),
  },
  loanTitle: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  loanDetails: {
    gap: 6,
    marginBottom: Math.max(12, screenWidth * 0.03),
  },
  loanDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanDetailLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    fontFamily: theme.font.family,
  },
  loanDetailValue: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
    fontFamily: theme.font.family,
  },
  overdueText: {
    color: theme.colors.error,
    fontWeight: '600',
  },
  paymentSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: Math.max(12, screenWidth * 0.03),
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  paymentSummaryTitle: {
    fontSize: theme.font.size,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: Math.max(8, screenWidth * 0.02),
    fontFamily: theme.font.family,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentSummaryLabel: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    fontFamily: theme.font.family,
  },
  paymentSummaryValue: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontWeight: '500',
    fontFamily: theme.font.family,
  },
}); 