export interface LoanUser {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  createdAt: string;
  // Additional fields for user management
  emergencyContact?: string;
  occupation?: string;
  monthlyIncome?: number;
  bankAccount?: string;
  ifscCode?: string;
  aadharNumber?: string;
  panNumber?: string;
}

export interface Loan {
  id: string;
  // userId: string; // deprecated, replaced by borrowerIds
  borrowerIds: string[]; // array of borrower IDs
  startDate: string; // ISO format date - Column C2
  endDate: string; // ISO format date - Column D2
  totalAmount: number;
  emiAmount: number;
  interestRate: number;
  purpose?: string;
  status: 'active' | 'completed' | 'defaulted';
  remainingAmount: number;
  paidAmount: number;
  totalEmis: number;
  paidEmis: number;
  // Additional fields for loan management
  loanNumber?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  collateralDetails?: string;
  disbursementDate?: string;
  lastPaymentDate?: string;
  nextDueDate?: string; // Column A2 - Due date
  overdueDays?: number;
  penaltyAmount?: number;
  // New fields
  loanName?: string;
  loanPurpose?: string;
  // Per-borrower EMI mapping
  emiAmounts?: Record<string, number>;
  // Bank details
  loanBank?: string;
  loanAccountNumber?: string;
}

export interface Payment {
  id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  dueDate: string; // ISO format date - Column A2
  paymentDate?: string; // ISO format date - Column I2
  isPaid: boolean;
  month: number;
  year: number;
  reminderSent: boolean;
  emiNumber: number;
  // Additional fields for payment tracking
  paymentMethod?: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'bank_deposit' | 'collection_agent' | 'online_transfer' | 'atm_deposit';
  transactionId?: string;
  receiptNumber?: string;
  lateFee?: number;
  partialPayment?: boolean;
  partialAmount?: number;
  notes?: string;
  // New payment details fields
  paidBy?: string; // Who paid the amount
  totalEmiPaymentDate?: string; // Date when total EMI was paid
  // Bank payment details
  paidToBankBy?: string; // Who paid to the bank
  paidToBankOn?: string; // Date when paid to bank
  paidThrough?: 'deposit' | 'online_transfer' | 'collection_agent' | 'cheque_deposit' | 'atm_deposit'; // How it was paid to bank
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phoneNumber?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface ReminderSettings {
  daysBeforeDue: number;
  enableSms: boolean;
  enableEmail: boolean;
  reminderTime: string; // HH:MM format
}

export interface DashboardStats {
  totalActiveLoans: number;
  totalBorrowers: number;
  monthlyCollection: number;
  pendingAmount: number;
  overduePayments: number;
  overdueAmount: number;
  totalLoanAmount: number;
  // Additional stats
  thisMonthDue: number;
  thisMonthCollected: number;
  nextWeekDue: number;
  defaultedLoans: number;
  averageEMI: number;
}

export interface LoanSummary {
  loanId: string;
  borrowerName: string;
  loanAmount: number;
  emiAmount: number;
  nextDueDate: string;
  isPaid: boolean;
  paymentDate?: string;
  overdueDays: number;
  contactNumber: string;
  status: 'active' | 'completed' | 'defaulted';
}

export interface PaymentReminder {
  id: string;
  loanId: string;
  userId: string;
  dueDate: string;
  amount: number;
  borrowerName: string;
  contactNumber: string;
  email?: string;
  daysUntilDue: number;
  isOverdue: boolean;
  reminderSent: boolean;
  lastReminderDate?: string;
} 