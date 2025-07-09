import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { LoanUser } from '../types';
import { LoanService } from './loanService';
import { PaymentService } from './paymentService';

const USERS_COLLECTION = 'users';

// Helper function to convert Firestore data to proper format
const convertFirestoreData = (data: any): any => {
  const converted = { ...data };
  if (converted.createdAt && typeof converted.createdAt.toDate === 'function') {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }
  return converted;
};

// Helper to check uniqueness for aadhar, account, pan
const checkBorrowerUnique = async (fields: Partial<LoanUser>, excludeId?: string) => {
  const checks: { field: keyof LoanUser; value?: string }[] = [
    { field: 'aadharNumber', value: fields.aadharNumber },
    { field: 'bankAccount', value: fields.bankAccount },
    { field: 'panNumber', value: fields.panNumber },
  ];
  for (const check of checks) {
    if (check.value) {
      const q = query(collection(db, USERS_COLLECTION), where(check.field, '==', check.value));
      const snapshot = await getDocs(q);
      const duplicate = snapshot.docs.find(docSnap => docSnap.id !== excludeId);
      if (duplicate) {
        throw new Error(`${check.field === 'aadharNumber' ? 'Aadhar' : check.field === 'bankAccount' ? 'Account Number' : 'PAN'} already exists for another borrower.`);
      }
    }
  }
};

export const BorrowerService = {
  subscribeToBorrowers: (onUpdate: (users: LoanUser[]) => void) => {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const users: LoanUser[] = snapshot.docs.map(docSnap => {
        const data = convertFirestoreData(docSnap.data());
        return { id: docSnap.id, ...data } as LoanUser;
      });
      onUpdate(users);
    });
  },
  addBorrower: async (user: Omit<LoanUser, 'id' | 'createdAt'>) => {
    await checkBorrowerUnique(user);
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...user,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },
  updateBorrower: async (userId: string, updates: Partial<LoanUser>) => {
    await checkBorrowerUnique(updates, userId);
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, updates);
  },
  deleteBorrower: async (userId: string) => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  },
  
  // Delete a borrower with all associated data (recommended for UI)
  deleteBorrowerWithCleanup: async (userId: string, confirmFn?: (message: string) => Promise<boolean>) => {
    const deletionService = await import('./deletionService');
    return deletionService.DeletionService.deleteBorrowerAndCleanup(userId, confirmFn);
  },
};

/**
 * @deprecated Use BorrowerService.deleteBorrowerWithCleanup instead
 * Deletes a borrower and cleans up all references in loans and payments.
 * Shows a confirmation dialog before proceeding.
 */
export const deleteBorrowerAndCleanup = async (userId: string, confirmFn: (message: string) => Promise<boolean>) => {
  console.warn('deleteBorrowerAndCleanup is deprecated. Use BorrowerService.deleteBorrowerWithCleanup instead.');
  return BorrowerService.deleteBorrowerWithCleanup(userId, confirmFn);
}; 