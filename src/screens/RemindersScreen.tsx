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
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../components/ui/Modal';
import { ReminderService, ReminderSettings, ReminderFirestoreService, NotificationLogService } from '../services/reminderService';
import { LoanService } from '../services/loanService';
import { BorrowerService } from '../services/borrowerService';
import { PaymentService } from '../services/paymentService';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Payment, Loan, LoanUser, PaymentReminder } from '../types';
import { theme } from '../theme';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function RemindersScreen() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<LoanUser[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reminders, setReminders] = useState<PaymentReminder[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>();
  const [reminderStats, setReminderStats] = useState<any>(null);
  const [notificationStats, setNotificationStats] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tempSettings, setTempSettings] = useState<ReminderSettings>();
  const [formData, setFormData] = useState<Partial<PaymentReminder>>({});
  const [showAddEditReminderModal, setShowAddEditReminderModal] = useState(false);
  const [confirmDeleteReminderId, setConfirmDeleteReminderId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
    setupFirestoreSubscriptions();
  }, []);

  useEffect(() => {
    if (settings && loans.length > 0 && users.length > 0 && payments.length > 0) {
      loadReminders();
      loadStats();
      loadNotificationStats();
      setLoading(false);
    }
  }, [settings, loans, users, payments]);

  const setupFirestoreSubscriptions = () => {
    console.log('Setting up Firestore subscriptions...');
    
    // Subscribe to loans
    const unsubscribeLoans = LoanService.subscribeToLoans((updatedLoans) => {
      console.log('Loans updated:', updatedLoans.length);
      setLoans(updatedLoans);
    });

    // Subscribe to borrowers
    const unsubscribeBorrowers = BorrowerService.subscribeToBorrowers((updatedUsers) => {
      console.log('Borrowers updated:', updatedUsers.length);
      setUsers(updatedUsers);
    });

    // Subscribe to payments
    const unsubscribePayments = PaymentService.subscribeToPayments((updatedPayments) => {
      console.log('Payments updated:', updatedPayments.length);
      setPayments(updatedPayments);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeLoans();
      unsubscribeBorrowers();
      unsubscribePayments();
    };
  };

  const loadSettings = async () => {
    try {
      const currentSettings = await ReminderService.getReminderSettings();
      setSettings(currentSettings);
      setTempSettings(currentSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadReminders = () => {
    if (settings) {
      const dueReminders = ReminderService.getDueReminders(payments, loans, users, settings);
      setReminders(dueReminders);
    }
  };

  const loadStats = () => {
    const stats = ReminderService.getReminderStats(payments, loans, users);
    setReminderStats(stats);
  };

  const loadNotificationStats = async () => {
    try {
      const stats = await ReminderService.getNotificationStats(24);
      setNotificationStats(stats);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  const handleProcessReminders = async () => {
    try {
      setIsProcessing(true);
      const result = await ReminderService.processReminders(payments, loans, users, settings!);
      
      Alert.alert(
        'Reminders Processed',
        `Successfully sent: ${result.success}\nFailed: ${result.failed}`,
        [{ text: 'OK' }]
      );
      
      loadReminders();
      loadStats();
      loadNotificationStats();
    } catch (error: any) {
      Alert.alert('Error', `Failed to process reminders: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendSingleReminder = async (reminder: PaymentReminder) => {
    try {
      const payment = payments.find(p => p.loanId === reminder.loanId);
      const loan = loans.find(l => l.id === reminder.loanId);
      const borrower = users.find(u => u.id === reminder.userId);

      if (payment && loan && borrower) {
        const success = await ReminderService.sendPaymentReminder(payment, loan, borrower, settings!, reminder.id);
        
        if (success) {
          Alert.alert('Success', 'Reminder sent successfully!');
          loadReminders();
          loadStats();
          loadNotificationStats();
        } else {
          Alert.alert('Error', 'Failed to send reminder');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to send reminder: ${error.message}`);
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (tempSettings) {
        await ReminderService.updateReminderSettings(tempSettings);
        setSettings(tempSettings);
        setShowSettingsModal(false);
        Alert.alert('Success', 'Settings saved successfully!');
        loadReminders(); // Reload reminders with new settings
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to save settings: ${error.message}`);
    }
  };

  const handleToggleAutoReminders = async () => {
    try {
      if (settings) {
        const newValue = !settings.enableAutoReminders;
        await ReminderService.updateReminderSettings({ enableAutoReminders: newValue });
        setSettings({ ...settings, enableAutoReminders: newValue });
        
        Alert.alert(
          newValue ? 'Auto Reminders Enabled' : 'Auto Reminders Disabled',
          newValue 
            ? `Automatic reminders will now run every ${settings.autoReminderInterval} minutes`
            : 'Automatic reminders have been stopped'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to toggle auto reminders: ${error.message}`);
    }
  };

  const getBorrowerName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown';
  };

  const getLoanPurpose = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    return loan ? loan.purpose : 'Unknown';
  };

  const webMinHeight = Platform.OS === 'web' ? { minHeight: typeof window !== 'undefined' ? window.innerHeight : 800 } : {};

  const handleEditReminder = (reminder: PaymentReminder) => {
    setFormData(reminder);
    setShowAddEditReminderModal(true);
  };

  const handleSaveOrUpdateReminder = async () => {
    if (!formData.amount || !formData.dueDate || !formData.loanId || !formData.userId || !formData.borrowerName || !formData.contactNumber) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    try {
      if (formData.id) {
        await ReminderFirestoreService.updateReminder(formData.id, {
          ...formData,
        });
        Alert.alert('Success', 'Reminder updated successfully!');
      } else {
        await ReminderFirestoreService.addReminder({
          dueDate: formData.dueDate!,
          amount: formData.amount!,
          loanId: formData.loanId!,
          userId: formData.userId!,
          borrowerName: formData.borrowerName!,
          contactNumber: formData.contactNumber!,
          email: formData.email ?? '',
          daysUntilDue: formData.daysUntilDue ?? 0,
          isOverdue: formData.isOverdue ?? false,
          reminderSent: formData.reminderSent ?? false,
          lastReminderDate: formData.lastReminderDate ?? '',
        });
        Alert.alert('Success', 'Reminder added successfully!');
      }
      setShowAddEditReminderModal(false);
      setFormData({});
    } catch (e) {
      Alert.alert('Error', 'Failed to save reminder. ' + ((e as any)?.message || ''));
    }
  };

  const handleDeleteReminder = (reminderId: string) => {
    setConfirmDeleteReminderId(reminderId);
  };

  const confirmDeleteReminder = async () => {
    if (!confirmDeleteReminderId) return;
    setIsDeleting(true);
    try {
      await ReminderFirestoreService.deleteReminder(confirmDeleteReminderId);
      setConfirmDeleteReminderId(null);
    } catch (e) {
      Alert.alert('Error', 'Failed to delete reminder.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteReminder = () => {
    setConfirmDeleteReminderId(null);
  };

  if (loading || !settings || !tempSettings) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading reminder data...</Text>
        <Text style={styles.loadingSubtext}>
          Loans: {loans.length} | Borrowers: {users.length} | Payments: {payments.length}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, webMinHeight]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Payment Reminders</Text>
        <View style={styles.headerActions}>
          <Button 
            variant="outline"
            onPress={() => setShowSettingsModal(true)}
            style={styles.settingsButton}
          >
            Settings
          </Button>
          <Button 
            onPress={handleProcessReminders}
            disabled={isProcessing}
            style={styles.processButton}
          >
            {isProcessing ? 'Processing...' : 'Send All Reminders'}
          </Button>
        </View>
      </View>

      {/* Data Summary */}
      <Card style={styles.statsCard}>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
          <CardDescription>Current system data counts</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{loans.length}</Text>
              <Text style={styles.statLabel}>Total Loans</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{users.length}</Text>
              <Text style={styles.statLabel}>Borrowers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{payments.length}</Text>
              <Text style={styles.statLabel}>Payments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{payments.filter(p => !p.isPaid).length}</Text>
              <Text style={styles.statLabel}>Unpaid</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <CardHeader>
          <CardTitle>Reminder Statistics</CardTitle>
          <CardDescription>Current reminder status and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reminderStats?.totalReminders || 0}</Text>
              <Text style={styles.statLabel}>Total Due</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reminderStats?.overdueReminders || 0}</Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reminderStats?.upcomingReminders || 0}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{reminderStats?.sentToday || 0}</Text>
              <Text style={styles.statLabel}>Sent Today</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Notification Stats */}
      <Card style={styles.statsCard}>
        <CardHeader>
          <CardTitle>Notification Statistics (Last 24h)</CardTitle>
          <CardDescription>Recent notification activity</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notificationStats?.totalSent || 0}</Text>
              <Text style={styles.statLabel}>Total Sent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notificationStats?.totalFailed || 0}</Text>
              <Text style={styles.statLabel}>Failed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notificationStats?.smsSent || 0}</Text>
              <Text style={styles.statLabel}>SMS Sent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notificationStats?.emailSent || 0}</Text>
              <Text style={styles.statLabel}>Email Sent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{notificationStats?.whatsappSent || 0}</Text>
              <Text style={styles.statLabel}>WhatsApp Sent</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Current Settings */}
      <Card style={styles.settingsCard}>
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
          <CardDescription>Reminder configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Days before due:</Text>
              <Text style={styles.settingValue}>{settings.daysBeforeDue}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>SMS enabled:</Text>
              <Text style={styles.settingValue}>{settings.enableSms ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Email enabled:</Text>
              <Text style={styles.settingValue}>{settings.enableEmail ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>WhatsApp enabled:</Text>
              <Text style={styles.settingValue}>{settings.enableWhatsApp ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Overdue reminders:</Text>
              <Text style={styles.settingValue}>{settings.enableOverdueReminders ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Overdue interval:</Text>
              <Text style={styles.settingValue}>{settings.overdueReminderInterval} days</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Auto reminders:</Text>
              <Text style={styles.settingValue}>{settings.enableAutoReminders ? 'Yes' : 'No'}</Text>
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Auto reminder interval:</Text>
              <Text style={styles.settingValue}>{settings.autoReminderInterval} minutes</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Due Reminders */}
      <Card style={styles.remindersCard}>
        <CardHeader>
          <CardTitle>Due Reminders ({reminders.length})</CardTitle>
          <CardDescription>Reminders that need to be sent</CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <Text style={styles.emptyText}>
              {loans.length === 0 ? 'No loan data available' : 'No reminders due at this time'}
            </Text>
          ) : (
            reminders.map((reminder, index) => (
              <View key={index} style={styles.reminderItem}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.borrowerName}>{reminder.borrowerName}</Text>
                  <Badge variant={reminder.isOverdue ? 'destructive' : 'default'}>
                    {reminder.isOverdue ? 'Overdue' : 'Due Soon'}
                  </Badge>
                </View>
                <View style={styles.reminderDetails}>
                  <Text style={styles.loanPurpose}>
                    {getLoanPurpose(reminder.loanId)}
                  </Text>
                  <Text style={styles.amount}>
                    Amount: ₹{reminder.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.dueDate}>
                    Due: {format(parseISO(reminder.dueDate), 'dd MMM yyyy')}
                  </Text>
                  <Text style={styles.daysInfo}>
                    {reminder.isOverdue 
                      ? `${Math.abs(reminder.daysUntilDue)} days overdue`
                      : `${reminder.daysUntilDue} days until due`
                    }
                  </Text>
                </View>
                <View style={styles.reminderActions}>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleSendSingleReminder(reminder)}
                  >
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => handleEditReminder(reminder)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onPress={() => handleDeleteReminder(reminder.id)}
                  >
                    Delete
                  </Button>
                </View>
              </View>
            ))
          )}
        </CardContent>
      </Card>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      >
        <ModalHeader
          title="Reminder Settings"
          onClose={() => setShowSettingsModal(false)}
        />
        <ModalContent>
          <View style={styles.modalContent}>
            <Input
              label="Days before due"
              placeholder="Enter number of days"
              value={tempSettings.daysBeforeDue.toString()}
              onChangeText={(text: string) => setTempSettings({
                ...tempSettings,
                daysBeforeDue: parseInt(text) || 3
              })}
              keyboardType="numeric"
            />
            <Input
              label="Overdue reminder interval (days)"
              placeholder="Enter interval in days"
              value={tempSettings.overdueReminderInterval.toString()}
              onChangeText={(text: string) => setTempSettings({
                ...tempSettings,
                overdueReminderInterval: parseInt(text) || 7
              })}
              keyboardType="numeric"
            />
            <Input
              label="Auto reminder interval (minutes)"
              placeholder="Enter interval in minutes"
              value={tempSettings.autoReminderInterval.toString()}
              onChangeText={(text: string) => setTempSettings({
                ...tempSettings,
                autoReminderInterval: parseInt(text) || 60
              })}
              keyboardType="numeric"
            />
            <Input
              label="Reminder time (HH:MM)"
              placeholder="Enter time in HH:MM format"
              value={tempSettings.reminderTime}
              onChangeText={(text: string) => setTempSettings({
                ...tempSettings,
                reminderTime: text
              })}
            />
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable SMS reminders</Text>
              <Switch
                value={tempSettings.enableSms}
                onValueChange={(value) => setTempSettings({
                  ...tempSettings,
                  enableSms: value
                })}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable Email reminders</Text>
              <Switch
                value={tempSettings.enableEmail}
                onValueChange={(value) => setTempSettings({
                  ...tempSettings,
                  enableEmail: value
                })}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable WhatsApp reminders</Text>
              <Switch
                value={tempSettings.enableWhatsApp}
                onValueChange={(value) => setTempSettings({
                  ...tempSettings,
                  enableWhatsApp: value
                })}
              />
            </View>

            {tempSettings.enableWhatsApp && (
              <>
                <Input
                  label="WhatsApp API Key"
                  placeholder="Enter your WhatsApp API key"
                  value={tempSettings.whatsAppApiKey || ''}
                  onChangeText={(text: string) => setTempSettings({
                    ...tempSettings,
                    whatsAppApiKey: text
                  })}
                />
                <Input
                  label="WhatsApp From Number"
                  placeholder="Enter your WhatsApp business number"
                  value={tempSettings.whatsAppFromNumber || ''}
                  onChangeText={(text: string) => setTempSettings({
                    ...tempSettings,
                    whatsAppFromNumber: text
                  })}
                />
              </>
            )}
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable overdue reminders</Text>
              <Switch
                value={tempSettings.enableOverdueReminders}
                onValueChange={(value) => setTempSettings({
                  ...tempSettings,
                  enableOverdueReminders: value
                })}
              />
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Enable Auto Reminders</Text>
              <Switch
                value={tempSettings.enableAutoReminders}
                onValueChange={(value) => setTempSettings({
                  ...tempSettings,
                  enableAutoReminders: value
                })}
              />
            </View>
          </View>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={() => {
              setTempSettings(settings);
              setShowSettingsModal(false);
            }}
          >
            Cancel
          </Button>
          <Button onPress={handleSaveSettings}>
            Save Settings
          </Button>
        </ModalFooter>
      </Modal>

      {/* Add/Edit Reminder Modal */}
      <Modal
        visible={showAddEditReminderModal}
        onClose={() => setShowAddEditReminderModal(false)}
      >
        <ModalHeader
          title={formData.id ? 'Edit Reminder' : 'Add Reminder'}
          onClose={() => setShowAddEditReminderModal(false)}
        />
        <ModalContent>
          <View style={styles.modalContent}>
            <Input
              label="Amount *"
              placeholder="Enter amount"
              keyboardType="numeric"
              value={formData.amount ? String(formData.amount) : ''}
              onChangeText={(text: string) => setFormData({ ...formData, amount: Number(text) })}
            />
            <Input
              label="Due Date *"
              placeholder="Select due date"
              value={formData.dueDate || ''}
              onChangeText={(text: string) => setFormData({ ...formData, dueDate: text })}
            />
            <Input
              label="Loan ID *"
              placeholder="Enter loan ID"
              value={formData.loanId || ''}
              onChangeText={(text: string) => setFormData({ ...formData, loanId: text })}
            />
            <Input
              label="User ID *"
              placeholder="Enter user ID"
              value={formData.userId || ''}
              onChangeText={(text: string) => setFormData({ ...formData, userId: text })}
            />
            <Input
              label="Borrower Name *"
              placeholder="Enter borrower name"
              value={formData.borrowerName || ''}
              onChangeText={(text: string) => setFormData({ ...formData, borrowerName: text })}
            />
            <Input
              label="Contact Number *"
              placeholder="Enter contact number"
              value={formData.contactNumber || ''}
              onChangeText={(text: string) => setFormData({ ...formData, contactNumber: text })}
            />
            <Input
              label="Email"
              placeholder="Enter email"
              value={formData.email || ''}
              onChangeText={(text: string) => setFormData({ ...formData, email: text })}
            />
          </View>
        </ModalContent>
        <ModalFooter>
          <Button
            variant="outline"
            onPress={() => setShowAddEditReminderModal(false)}
          >
            Cancel
          </Button>
          <Button onPress={handleSaveOrUpdateReminder}>
            {formData.id ? 'Update Reminder' : 'Add Reminder'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={!!confirmDeleteReminderId}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={confirmDeleteReminder}
        onCancel={cancelDeleteReminder}
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
  loadingText: {
    fontSize: theme.font.sizeHeading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
  headerActions: {
    flexDirection: 'row',
    gap: Math.max(12, screenWidth * 0.03),
  },
  settingsButton: {
    minWidth: 80,
  },
  processButton: {
    minWidth: 120,
  },
  statsCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  settingsCard: {
    margin: Math.max(20, screenWidth * 0.05),
    marginTop: 0,
  },
  remindersCard: {
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
  settingsList: {
    gap: Math.max(12, screenWidth * 0.03),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Math.max(12, screenWidth * 0.03),
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingLabel: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  reminderItem: {
    padding: Math.max(16, screenWidth * 0.04),
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: Math.max(12, screenWidth * 0.03),
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Math.max(12, screenWidth * 0.03),
  },
  borrowerName: {
    fontSize: theme.font.sizeHeading,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.font.family,
  },
  reminderDetails: {
    gap: 4,
    marginBottom: Math.max(12, screenWidth * 0.03),
  },
  loanPurpose: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  amount: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontWeight: '500',
  },
  dueDate: {
    fontSize: theme.font.size,
    color: theme.colors.textSecondary,
  },
  daysInfo: {
    fontSize: theme.font.size,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  reminderActions: {
    alignItems: 'flex-end',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Math.max(8, screenWidth * 0.02),
  },
  switchLabel: {
    fontSize: theme.font.size,
    color: theme.colors.text,
    fontWeight: '500',
  },
}); 