import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  getDoc,
  setDoc,
  runTransaction,
  where
} from 'firebase/firestore';
import { Loan } from '../types';

const LOANS_COLLECTION = 'loans';
const COUNTERS_COLLECTION = 'counters';

// Helper function to convert Firestore data to proper format
const convertFirestoreData = (data: any): any => {
  const converted = { ...data };
  if (converted.createdAt && typeof converted.createdAt.toDate === 'function') {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }
  return converted;
};

// Helper function to generate incremental loan number
const generateLoanNumber = async (): Promise<string> => {
  const counterRef = doc(db, COUNTERS_COLLECTION, 'loanNumber');
  
  try {
    const result = await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      let nextNumber = 1;
      if (counterDoc.exists()) {
        nextNumber = counterDoc.data()?.currentNumber || 0;
        nextNumber += 1;
      }
      
      // Update the counter
      transaction.set(counterRef, { currentNumber: nextNumber });
      
      // Generate loan number in SHG001 format
      return `SHG${nextNumber.toString().padStart(3, '0')}`;
    });
    
    return result;
  } catch (error) {
    console.error('Error generating loan number:', error);
    // Fallback: generate based on current timestamp
    const timestamp = Date.now();
    const fallbackNumber = timestamp % 1000;
    return `SHG${fallbackNumber.toString().padStart(3, '0')}`;
  }
};

// Helper to check uniqueness for loanNumber
const checkLoanNumberUnique = async (loanNumber: string) => {
  const q = query(collection(db, LOANS_COLLECTION), where('loanNumber', '==', loanNumber));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error('Loan ID already exists. Please try again.');
  }
};

export const LoanService = {
  // Subscribe to real-time updates for all loans
  subscribeToLoans: (onUpdate: (loans: Loan[]) => void) => {
    const q = query(collection(db, LOANS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const loans: Loan[] = snapshot.docs.map(docSnap => {
        const data = convertFirestoreData(docSnap.data());
        return { id: docSnap.id, ...data } as Loan;
      });
      onUpdate(loans);
    });
  },

  // Get all loans (one-time fetch)
  getLoans: async (): Promise<Loan[]> => {
    const snapshot = await getDocs(collection(db, LOANS_COLLECTION));
    return snapshot.docs.map(docSnap => {
      const data = convertFirestoreData(docSnap.data());
      return { id: docSnap.id, ...data } as Loan;
    });
  },

  // Add a new loan with incremental loan number
  addLoan: async (loan: Omit<Loan, 'id' | 'createdAt' | 'loanNumber'>) => {
    console.log('addLoan called with:', loan);
    // Generate incremental loan number
    let loanNumber = await generateLoanNumber();
    console.log('Generated loan number:', loanNumber);
    // Uniqueness check
    try {
      await checkLoanNumberUnique(loanNumber);
      console.log('Loan number is unique:', loanNumber);
    } catch (e) {
      console.warn('Loan number not unique, generating fallback number. Error:', e);
      // Fallback: generate based on current timestamp
      const timestamp = Date.now();
      loanNumber = `SHG${(timestamp % 100000).toString().padStart(5, '0')}`;
      console.log('Fallback loan number:', loanNumber);
    }
    try {
      const docRef = await addDoc(collection(db, LOANS_COLLECTION), {
        ...loan,
        loanNumber,
        createdAt: Timestamp.now(),
      });
      console.log('Loan added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('addLoan error:', error);
      throw error;
    }
  },

  // Update a loan
  updateLoan: async (loanId: string, updates: Partial<Loan>) => {
    const docRef = doc(db, LOANS_COLLECTION, loanId);
    await updateDoc(docRef, updates);
  },

  // Delete a loan (basic - for internal use only)
  deleteLoan: async (loanId: string) => {
    const docRef = doc(db, LOANS_COLLECTION, loanId);
    await deleteDoc(docRef);
  },

  // Delete a loan with all associated data (recommended for UI)
  deleteLoanWithCleanup: async (loanId: string, confirmFn?: (message: string) => Promise<boolean>) => {
    const { DeletionService } = await import('./deletionService');
    return DeletionService.deleteLoanAndCleanup(loanId, confirmFn);
  },

  // Get the next loan number (for preview purposes)
  getNextLoanNumber: async (): Promise<string> => {
    return await generateLoanNumber();
  },

  // Reset loan number counter (admin function)
  resetLoanNumberCounter: async (startNumber: number = 1) => {
    const counterRef = doc(db, COUNTERS_COLLECTION, 'loanNumber');
    await setDoc(counterRef, { currentNumber: startNumber - 1 });
  },
}; 