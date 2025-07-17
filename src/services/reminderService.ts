import { Payment, Loan, LoanUser, PaymentReminder } from '../types';
import { format, parseISO, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp, where } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderSettings {
  daysBeforeDue: number;
  enableSms: boolean;
  enableEmail: boolean;
  enableWhatsApp: boolean; // NEW: Enable WhatsApp reminders
  whatsAppApiKey?: string; // NEW: WhatsApp API key
  whatsAppFromNumber?: string; // NEW: WhatsApp business number
  reminderTime: string; // HH:MM format
  enableOverdueReminders: boolean;
  overdueReminderInterval: number; // days
  enableAutoReminders: boolean; // NEW: Enable automatic reminders
  autoReminderInterval: number; // NEW: Check interval in minutes (default: 60)
  lastAutoReminderCheck: string; // NEW: Last time auto reminders were checked
}

export interface NotificationLog {
  id?: string;
  reminderId: string;
  borrowerId: string;
  loanId: string;
  type: 'sms' | 'email' | 'push' | 'whatsapp'; // Added whatsapp
  status: 'sent' | 'failed' | 'pending';
  sentAt?: string;
  message: string;
  errorMessage?: string;
}

const REMINDERS_COLLECTION = 'reminders';
const NOTIFICATION_LOGS_COLLECTION = 'notificationLogs';
const REMINDER_SETTINGS_KEY = 'reminderSettings';

// Global variable to track auto reminder interval
let autoReminderInterval: NodeJS.Timeout | null = null;

// Helper function to convert Firestore data to proper format
const convertFirestoreData = (data: any): any => {
  const converted = { ...data };
  if (converted.createdAt && typeof converted.createdAt.toDate === 'function') {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }
  return converted;
};

export const ReminderFirestoreService = {
  subscribeToReminders: (onUpdate: (reminders: PaymentReminder[]) => void) => {
    const q = query(collection(db, REMINDERS_COLLECTION), orderBy('dueDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const reminders: PaymentReminder[] = snapshot.docs.map(docSnap => {
        const data = convertFirestoreData(docSnap.data());
        return { id: docSnap.id, ...data } as PaymentReminder;
      });
      onUpdate(reminders);
    });
  },
  addReminder: async (reminder: Omit<PaymentReminder, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, REMINDERS_COLLECTION), {
      ...reminder,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },
  updateReminder: async (reminderId: string, updates: Partial<PaymentReminder>) => {
    const docRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await updateDoc(docRef, updates);
  },
  deleteReminder: async (reminderId: string) => {
    const docRef = doc(db, REMINDERS_COLLECTION, reminderId);
    await deleteDoc(docRef);
  },
  // NEW: Get reminders by borrower
  getRemindersByBorrower: async (borrowerId: string): Promise<PaymentReminder[]> => {
    const q = query(
      collection(db, REMINDERS_COLLECTION), 
      where('userId', '==', borrowerId),
      orderBy('dueDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = convertFirestoreData(docSnap.data());
      return { id: docSnap.id, ...data } as PaymentReminder;
    });
  },
};

// NEW: Notification logging service
export const NotificationLogService = {
  addLog: async (log: Omit<NotificationLog, 'id'>) => {
    const docRef = await addDoc(collection(db, NOTIFICATION_LOGS_COLLECTION), {
      ...log,
      sentAt: new Date().toISOString(),
    });
    return docRef.id;
  },
  getLogsByReminder: async (reminderId: string): Promise<NotificationLog[]> => {
    const q = query(
      collection(db, NOTIFICATION_LOGS_COLLECTION), 
      where('reminderId', '==', reminderId),
      orderBy('sentAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as NotificationLog));
  },
  getRecentLogs: async (hours: number = 24): Promise<NotificationLog[]> => {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    const q = query(
      collection(db, NOTIFICATION_LOGS_COLLECTION), 
      where('sentAt', '>=', cutoffTime),
      orderBy('sentAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as NotificationLog));
  },
};

export class ReminderService {
  private static defaultSettings: ReminderSettings = {
    daysBeforeDue: 3,
    enableSms: true,
    enableEmail: true,
    enableWhatsApp: false, // NEW: WhatsApp disabled by default
    whatsAppApiKey: '',
    whatsAppFromNumber: '',
    reminderTime: '09:00',
    enableOverdueReminders: true,
    overdueReminderInterval: 7,
    enableAutoReminders: true, // NEW: Auto reminders enabled by default
    autoReminderInterval: 60, // NEW: Check every 60 minutes
    lastAutoReminderCheck: new Date().toISOString(),
  };

  static async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      // In a real app, integrate with SMS service like Twilio, AWS SNS, etc.
      console.log(`SMS to ${phoneNumber}: ${message}`);
      
      // Mock SMS sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  static async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    try {
      // In a real app, integrate with email service like SendGrid, AWS SES, etc.
      console.log(`Email to ${email}: ${subject} - ${message}`);
      
      // Mock email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // NEW: Send push notification
  static async sendPushNotification(userId: string, title: string, body: string): Promise<boolean> {
    try {
      // In a real app, integrate with Firebase Cloud Messaging or Expo Notifications
      console.log(`Push notification to ${userId}: ${title} - ${body}`);
      
      // Mock push notification
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Failed to send push notification:', error);
      return false;
    }
  }

  // NEW: Send WhatsApp message
  static async sendWhatsApp(
    phoneNumber: string, 
    message: string, 
    settings: ReminderSettings
  ): Promise<boolean> {
    try {
      if (!settings.enableWhatsApp || !settings.whatsAppApiKey) {
        console.warn('WhatsApp not configured or disabled');
        return false;
      }

      // Format phone number (remove spaces, dashes, and ensure country code)
      const formattedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
      
      console.log(`WhatsApp to ${formattedNumber}: ${message}`);
      
      // Integration options:
      // 1. WhatsApp Business API (Official)
      // 2. Twilio WhatsApp API
      // 3. Meta WhatsApp Cloud API
      // 4. Third-party services like MessageBird, etc.
      
      // Example with WhatsApp Business API (replace with actual implementation)
      const whatsappPayload = {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "text",
        text: {
          body: message
        }
      };

      // Mock API call - replace with actual WhatsApp API
      await this.sendWhatsAppAPIRequest(whatsappPayload, settings);
      
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  // NEW: WhatsApp API request handler
  private static async sendWhatsAppAPIRequest(payload: any, settings: ReminderSettings): Promise<void> {
    try {
      // Mock implementation - replace with actual API calls
      
      // Option 1: WhatsApp Business Cloud API
      // const response = await fetch(`https://graph.facebook.com/v18.0/${settings.whatsAppFromNumber}/messages`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${settings.whatsAppApiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // });

      // Option 2: Twilio WhatsApp API
      // const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${settings.whatsAppApiKey}`)}`,
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //   },
      //   body: new URLSearchParams({
      //     From: `whatsapp:${settings.whatsAppFromNumber}`,
      //     To: `whatsapp:${payload.to}`,
      //     Body: payload.text.body,
      //   }),
      // });

      // Mock delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('WhatsApp API request sent successfully (mocked)');
    } catch (error) {
      console.error('WhatsApp API request failed:', error);
      throw error;
    }
  }

  static generateReminderMessage(
    borrowerName: string,
    loanAmount: number,
    dueDate: string,
    isOverdue: boolean = false
  ): string {
    const formattedDueDate = format(parseISO(dueDate), 'dd MMM yyyy');
    const formattedAmount = `₹${loanAmount.toLocaleString()}`;
    
    if (isOverdue) {
      const overdueDays = differenceInDays(new Date(), parseISO(dueDate));
      return `Dear ${borrowerName}, your loan payment of ${formattedAmount} was due on ${formattedDueDate} (${overdueDays} days ago). Please make the payment immediately to avoid additional charges.`;
    } else {
      const daysUntilDue = differenceInDays(parseISO(dueDate), new Date());
      return `Dear ${borrowerName}, your loan payment of ${formattedAmount} is due on ${formattedDueDate} (in ${daysUntilDue} days). Please ensure timely payment.`;
    }
  }

  // NEW: Enhanced reminder sending with logging
  static async sendPaymentReminder(
    payment: Payment,
    loan: Loan,
    borrower: LoanUser,
    settings: ReminderSettings = this.defaultSettings,
    reminderId?: string
  ): Promise<boolean> {
    try {
      const isOverdue = isAfter(new Date(), parseISO(payment.dueDate));
      const message = this.generateReminderMessage(
        borrower.name,
        payment.amount,
        payment.dueDate,
        isOverdue
      );

      let overallSuccess = true;
      const notificationPromises: Promise<void>[] = [];

      // Send SMS if enabled
      if (settings.enableSms && borrower.phoneNumber) {
        const smsPromise = this.sendSMS(borrower.phoneNumber, message)
          .then(success => {
            NotificationLogService.addLog({
              reminderId: reminderId || `temp_${Date.now()}`,
              borrowerId: borrower.id,
              loanId: loan.id,
              type: 'sms',
              status: success ? 'sent' : 'failed',
              message,
              errorMessage: success ? undefined : 'SMS sending failed'
            });
            if (!success) overallSuccess = false;
          });
        notificationPromises.push(smsPromise);
      }

      // Send email if enabled
      if (settings.enableEmail && borrower.email) {
        const subject = isOverdue ? 'Overdue Payment Reminder' : 'Payment Due Reminder';
        const emailPromise = this.sendEmail(borrower.email, subject, message)
          .then(success => {
            NotificationLogService.addLog({
              reminderId: reminderId || `temp_${Date.now()}`,
              borrowerId: borrower.id,
              loanId: loan.id,
              type: 'email',
              status: success ? 'sent' : 'failed',
              message: `${subject}: ${message}`,
              errorMessage: success ? undefined : 'Email sending failed'
            });
            if (!success) overallSuccess = false;
          });
        notificationPromises.push(emailPromise);
      }

      // Send WhatsApp if enabled
      if (settings.enableWhatsApp && borrower.phoneNumber) {
        const whatsappPromise = this.sendWhatsApp(borrower.phoneNumber, message, settings)
          .then(success => {
            NotificationLogService.addLog({
              reminderId: reminderId || `temp_${Date.now()}`,
              borrowerId: borrower.id,
              loanId: loan.id,
              type: 'whatsapp',
              status: success ? 'sent' : 'failed',
              message,
              errorMessage: success ? undefined : 'WhatsApp sending failed'
            });
            if (!success) overallSuccess = false;
          });
        notificationPromises.push(whatsappPromise);
      }

      // Send push notification
      const pushTitle = isOverdue ? 'Payment Overdue' : 'Payment Reminder';
      const pushBody = `Your payment of ₹${payment.amount.toLocaleString()} is ${isOverdue ? 'overdue' : 'due soon'}`;
      const pushPromise = this.sendPushNotification(borrower.id, pushTitle, pushBody)
        .then(success => {
          NotificationLogService.addLog({
            reminderId: reminderId || `temp_${Date.now()}`,
            borrowerId: borrower.id,
            loanId: loan.id,
            type: 'push',
            status: success ? 'sent' : 'failed',
            message: `${pushTitle}: ${pushBody}`,
            errorMessage: success ? undefined : 'Push notification failed'
          });
          if (!success) overallSuccess = false;
        });
      notificationPromises.push(pushPromise);

      // Wait for all notifications to complete
      await Promise.all(notificationPromises);

      return overallSuccess;
    } catch (error) {
      console.error('Failed to send payment reminder:', error);
      if (reminderId) {
        await NotificationLogService.addLog({
          reminderId,
          borrowerId: borrower.id,
          loanId: loan.id,
          type: 'sms',
          status: 'failed',
          message: 'Failed to process reminder',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      return false;
    }
  }

  static getDueReminders(
    payments: Payment[],
    loans: Loan[],
    borrowers: LoanUser[],
    settings: ReminderSettings = this.defaultSettings
  ): PaymentReminder[] {
    const today = new Date();
    const reminders: PaymentReminder[] = [];

    payments.forEach(payment => {
      if (payment.isPaid) return;

      const dueDate = parseISO(payment.dueDate);
      const daysUntilDue = differenceInDays(dueDate, today);
      const isOverdue = isAfter(today, dueDate);

      // Check if reminder should be sent
      let shouldSendReminder = false;

      if (isOverdue) {
        // For overdue payments, send reminder based on interval
        if (settings.enableOverdueReminders) {
          const overdueDays = Math.abs(daysUntilDue);
          shouldSendReminder = overdueDays % settings.overdueReminderInterval === 0;
        }
      } else {
        // For upcoming payments, send reminder based on days before due
        shouldSendReminder = daysUntilDue <= settings.daysBeforeDue && daysUntilDue >= 0;
      }

      if (shouldSendReminder) {
        const loan = loans.find(l => l.id === payment.loanId);
        const borrower = borrowers.find(b => loan?.borrowerIds?.includes(b.id));

        if (loan && borrower) {
          reminders.push({
            id: `reminder_${payment.id}`,
            loanId: payment.loanId,
            userId: borrower.id,
            dueDate: payment.dueDate,
            amount: payment.amount,
            borrowerName: borrower.name,
            contactNumber: borrower.phoneNumber,
            email: borrower.email,
            daysUntilDue: daysUntilDue,
            isOverdue: isOverdue,
            reminderSent: false,
          });
        }
      }
    });

    return reminders;
  }

  static async processReminders(
    payments: Payment[],
    loans: Loan[],
    borrowers: LoanUser[],
    settings: ReminderSettings = this.defaultSettings
  ): Promise<{ success: number; failed: number }> {
    const reminders = this.getDueReminders(payments, loans, borrowers, settings);
    let successCount = 0;
    let failedCount = 0;

    for (const reminder of reminders) {
      const payment = payments.find(p => p.loanId === reminder.loanId);
      const loan = loans.find(l => l.id === reminder.loanId);
      const borrower = borrowers.find(b => b.id === reminder.userId);

      if (payment && loan && borrower) {
        const success = await this.sendPaymentReminder(payment, loan, borrower, settings, reminder.id);
        if (success) {
          successCount++;
        } else {
          failedCount++;
        }
      }
    }

    return { success: successCount, failed: failedCount };
  }

  // NEW: Automatic reminder processing
  static async processAutoReminders(): Promise<{ success: number; failed: number; skipped: number }> {
    try {
      console.log('Processing automatic reminders...');
      
      const settings = await this.getReminderSettings();
      
      // Check if auto reminders are enabled
      if (!settings.enableAutoReminders) {
        console.log('Auto reminders are disabled');
        return { success: 0, failed: 0, skipped: 0 };
      }

      // Import services dynamically to avoid circular dependencies
      const { LoanService } = await import('./loanService');
      const { BorrowerService } = await import('./borrowerService');
      const { PaymentService } = await import('./paymentService');

             // Get all data
       const loans = await LoanService.getLoans();
       
       // Get all borrowers
       const borrowers: LoanUser[] = [];
       const borrowersSnapshot = await getDocs(collection(db, 'users'));
       borrowersSnapshot.docs.forEach(docSnap => {
         const data = convertFirestoreData(docSnap.data());
         borrowers.push({ id: docSnap.id, ...data } as LoanUser);
       });

      // Get all payments
      const payments: Payment[] = [];
      const paymentsSnapshot = await getDocs(collection(db, 'payments'));
      paymentsSnapshot.docs.forEach(docSnap => {
        const data = convertFirestoreData(docSnap.data());
        payments.push({ id: docSnap.id, ...data } as Payment);
      });

      // Process reminders
      const result = await this.processReminders(payments, loans, borrowers, settings);
      
      // Update last check time
      await this.updateReminderSettings({
        lastAutoReminderCheck: new Date().toISOString()
      });

      console.log(`Auto reminders processed: ${result.success} sent, ${result.failed} failed`);
      return { ...result, skipped: 0 };
      
    } catch (error) {
      console.error('Error processing auto reminders:', error);
      return { success: 0, failed: 0, skipped: 1 };
    }
  }

  // NEW: Start automatic reminder service
  static startAutoReminderService() {
    this.stopAutoReminderService(); // Stop any existing service
    
    this.getReminderSettings().then(settings => {
      if (settings.enableAutoReminders) {
        const intervalMs = settings.autoReminderInterval * 60 * 1000; // Convert minutes to milliseconds
        
        console.log(`Starting auto reminder service with ${settings.autoReminderInterval} minute intervals`);
        
        autoReminderInterval = setInterval(() => {
          this.processAutoReminders().catch(error => {
            console.error('Auto reminder processing failed:', error);
          });
        }, intervalMs);

        // Run immediately on start
        this.processAutoReminders().catch(error => {
          console.error('Initial auto reminder processing failed:', error);
        });
      }
    });
  }

  // NEW: Stop automatic reminder service
  static stopAutoReminderService() {
    if (autoReminderInterval) {
      clearInterval(autoReminderInterval);
      autoReminderInterval = null;
      console.log('Auto reminder service stopped');
    }
  }

  // Enhanced settings management with persistence
  static async getReminderSettings(): Promise<ReminderSettings> {
    try {
      const stored = await AsyncStorage.getItem(REMINDER_SETTINGS_KEY);
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        return { ...this.defaultSettings, ...parsedSettings };
      }
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
    }
    return this.defaultSettings;
  }

  static async updateReminderSettings(settings: Partial<ReminderSettings>): Promise<void> {
    try {
      const currentSettings = await this.getReminderSettings();
      const newSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(newSettings));
      this.defaultSettings = newSettings;
      
      // Restart auto reminder service if settings changed
      if (settings.enableAutoReminders !== undefined || settings.autoReminderInterval !== undefined) {
        if (newSettings.enableAutoReminders) {
          this.startAutoReminderService();
        } else {
          this.stopAutoReminderService();
        }
      }
      
      console.log('Reminder settings updated:', newSettings);
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
      throw error;
    }
  }

  static getReminderStats(
    payments: Payment[],
    loans: Loan[],
    borrowers: LoanUser[]
  ): {
    totalReminders: number;
    overdueReminders: number;
    upcomingReminders: number;
    sentToday: number;
  } {
    const today = new Date();
    const reminders = this.getDueReminders(payments, loans, borrowers);
    
    return {
      totalReminders: reminders.length,
      overdueReminders: reminders.filter(r => r.isOverdue).length,
      upcomingReminders: reminders.filter(r => !r.isOverdue).length,
      sentToday: reminders.filter(r => 
        format(parseISO(r.dueDate), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      ).length,
    };
  }

  // NEW: Get notification statistics
  static async getNotificationStats(hours: number = 24): Promise<{
    totalSent: number;
    totalFailed: number;
    smsSent: number;
    emailSent: number;
    whatsappSent: number;
    pushSent: number;
    recentLogs: NotificationLog[];
  }> {
    const logs = await NotificationLogService.getRecentLogs(hours);
    
    return {
      totalSent: logs.filter(log => log.status === 'sent').length,
      totalFailed: logs.filter(log => log.status === 'failed').length,
      smsSent: logs.filter(log => log.type === 'sms' && log.status === 'sent').length,
      emailSent: logs.filter(log => log.type === 'email' && log.status === 'sent').length,
      whatsappSent: logs.filter(log => log.type === 'whatsapp' && log.status === 'sent').length,
      pushSent: logs.filter(log => log.type === 'push' && log.status === 'sent').length,
      recentLogs: logs.slice(0, 10), // Return last 10 logs
    };
  }

  // NEW: Initialize reminder service (call this on app startup)
  static async initialize() {
    console.log('Initializing reminder service...');
    const settings = await this.getReminderSettings();
    
    if (settings.enableAutoReminders) {
      this.startAutoReminderService();
    }
    
    console.log('Reminder service initialized with settings:', settings);
  }
} 