import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { Payment } from '../types';

const PAYMENTS_COLLECTION = 'payments';

// Helper function to convert Firestore data to proper format
const convertFirestoreData = (data: any): any => {
  const converted = { ...data };
  if (converted.createdAt && typeof converted.createdAt.toDate === 'function') {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }
  return converted;
};

export const PaymentService = {
  subscribeToPayments: (onUpdate: (payments: Payment[]) => void) => {
    const q = query(collection(db, PAYMENTS_COLLECTION), orderBy('dueDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const payments: Payment[] = snapshot.docs.map(docSnap => {
        const data = convertFirestoreData(docSnap.data());
        return { id: docSnap.id, ...data } as Payment;
      });
      onUpdate(payments);
    });
  },
  addPayment: async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const docRef = await addDoc(collection(db, PAYMENTS_COLLECTION), {
      ...payment,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },
  updatePayment: async (paymentId: string, updates: Partial<Payment>) => {
    try {
      console.log('Updating payment:', paymentId, 'with data:', updates);
      const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
      await updateDoc(docRef, updates);
      console.log('Payment updated successfully');
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  },
  deletePayment: async (paymentId: string) => {
    const docRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await deleteDoc(docRef);
  },
}; 