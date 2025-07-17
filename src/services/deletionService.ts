import { Alert } from 'react-native';
import { LoanService } from './loanService';
import { PaymentService } from './paymentService';
import { BorrowerService } from './borrowerService';
import { ReminderFirestoreService } from './reminderService';
import { db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface DeletionOptions {
  showConfirmation?: boolean;
  customConfirmMessage?: string;
  onProgress?: (message: string) => void;
}

export class DeletionService {
  /**
   * Safely delete a loan and all its associated data
   */
  static async deleteLoanAndCleanup(
    loanId: string, 
    confirmFn?: (message: string) => Promise<boolean>,
    options: DeletionOptions = {}
  ): Promise<void> {
    const { showConfirmation = true, onProgress } = options;

    try {
      // 1. Show confirmation if required
      if (showConfirmation && confirmFn) {
        const confirmed = await confirmFn(
          options.customConfirmMessage || 
          'Deleting this loan will also remove all associated payments and reminders. This action cannot be undone. Do you want to continue?'
        );
        if (!confirmed) return;
      }

      onProgress?.('Finding associated payments...');
      
      // 2. Get all payments for this loan
      const paymentsQuery = query(
        collection(db, 'payments'), 
        where('loanId', '==', loanId)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      onProgress?.(`Deleting ${paymentsSnapshot.docs.length} payments...`);
      
      // 3. Delete all payments for this loan
      for (const docSnap of paymentsSnapshot.docs) {
        await PaymentService.deletePayment(docSnap.id);
      }
      
      onProgress?.('Finding associated reminders...');
      
      // 4. Get all reminders for this loan
      const remindersQuery = query(
        collection(db, 'reminders'), 
        where('loanId', '==', loanId)
      );
      const remindersSnapshot = await getDocs(remindersQuery);
      
      onProgress?.(`Deleting ${remindersSnapshot.docs.length} reminders...`);
      
      // 5. Delete all reminders for this loan
      for (const docSnap of remindersSnapshot.docs) {
        await ReminderFirestoreService.deleteReminder(docSnap.id);
      }
      
      onProgress?.('Deleting loan...');
      
      // 6. Finally delete the loan itself
      await LoanService.deleteLoan(loanId);
      
      onProgress?.('Deletion completed successfully');
      
    } catch (error) {
      console.error('Error in deleteLoanAndCleanup:', error);
      throw new Error(`Failed to delete loan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Safely delete a borrower and all associated data
   */
  static async deleteBorrowerAndCleanup(
    borrowerId: string,
    confirmFn?: (message: string) => Promise<boolean>,
    options: DeletionOptions = {}
  ): Promise<void> {
    const { showConfirmation = true, onProgress } = options;

    try {
      // 1. Show confirmation if required
      if (showConfirmation && confirmFn) {
        const confirmed = await confirmFn(
          options.customConfirmMessage || 
          'Deleting this borrower will remove them from all loans and delete all their payment records. This action cannot be undone. Do you want to continue?'
        );
        if (!confirmed) return;
      }

      onProgress?.('Finding associated loans...');
      
      // 2. Get all loans where this borrower is involved
      const loans = await LoanService.getLoans();
      const affectedLoans = loans.filter(loan => 
        loan.borrowerIds && loan.borrowerIds.includes(borrowerId)
      );
      
      onProgress?.(`Updating ${affectedLoans.length} loans...`);
      
      // 3. Remove borrower from all loans
      for (const loan of affectedLoans) {
        const updatedBorrowerIds = loan.borrowerIds!.filter(id => id !== borrowerId);
        let updates: any = { borrowerIds: updatedBorrowerIds };
        
        // If loan has EMI amounts mapping, remove this borrower's entry
        if (loan.emiAmounts && loan.emiAmounts[borrowerId] !== undefined) {
          const updatedEmiAmounts = { ...loan.emiAmounts };
          delete updatedEmiAmounts[borrowerId];
          updates.emiAmounts = updatedEmiAmounts;
        }
        
        await LoanService.updateLoan(loan.id, updates);
      }
      
      onProgress?.('Finding associated payments...');
      
      // 4. Get all payments for this borrower
      const paymentsQuery = query(
        collection(db, 'payments'), 
        where('borrowerId', '==', borrowerId)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      onProgress?.(`Deleting ${paymentsSnapshot.docs.length} payments...`);
      
      // 5. Delete all payments for this borrower
      for (const docSnap of paymentsSnapshot.docs) {
        await PaymentService.deletePayment(docSnap.id);
      }
      
      onProgress?.('Finding associated reminders...');
      
      // 6. Get all reminders for this borrower
      const remindersQuery = query(
        collection(db, 'reminders'), 
        where('userId', '==', borrowerId)
      );
      const remindersSnapshot = await getDocs(remindersQuery);
      
      onProgress?.(`Deleting ${remindersSnapshot.docs.length} reminders...`);
      
      // 7. Delete all reminders for this borrower
      for (const docSnap of remindersSnapshot.docs) {
        await ReminderFirestoreService.deleteReminder(docSnap.id);
      }
      
      onProgress?.('Deleting borrower...');
      
      // 8. Finally delete the borrower
      await BorrowerService.deleteBorrower(borrowerId);
      
      onProgress?.('Deletion completed successfully');
      
    } catch (error) {
      console.error('Error in deleteBorrowerAndCleanup:', error);
      throw new Error(`Failed to delete borrower: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Safely delete a payment
   */
  static async deletePaymentSafely(
    paymentId: string,
    confirmFn?: (message: string) => Promise<boolean>,
    options: DeletionOptions = {}
  ): Promise<void> {
    const { showConfirmation = true, onProgress } = options;

    try {
      // 1. Show confirmation if required
      if (showConfirmation && confirmFn) {
        const confirmed = await confirmFn(
          options.customConfirmMessage || 
          'Are you sure you want to delete this payment? This action cannot be undone.'
        );
        if (!confirmed) return;
      }

      onProgress?.('Deleting payment...');
      
      // 2. Delete the payment
      await PaymentService.deletePayment(paymentId);
      
      onProgress?.('Payment deleted successfully');
      
    } catch (error) {
      console.error('Error in deletePaymentSafely:', error);
      throw new Error(`Failed to delete payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generic confirmation dialog helper
   */
  static async showConfirmationDialog(
    title: string,
    message: string,
    confirmText: string = 'Delete',
    cancelText: string = 'Cancel'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { 
            text: cancelText, 
            style: 'cancel', 
            onPress: () => resolve(false) 
          },
          { 
            text: confirmText, 
            style: 'destructive', 
            onPress: () => resolve(true) 
          },
        ],
        { cancelable: false }
      );
    });
  }

  /**
   * Show progress dialog (for platforms that support it)
   */
  static showProgress(message: string): void {
    console.log(`[Deletion Progress]: ${message}`);
    // On web, you could show a toast or loading indicator
    // On mobile, you could use a modal or progress indicator
  }
} 