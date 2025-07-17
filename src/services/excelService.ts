import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Loan, LoanUser, Payment } from '../types';

export interface ExcelImportResult {
  loans: Loan[];
  users: LoanUser[];
  payments: Payment[];
  success: boolean;
  message: string;
}

export class ExcelService {
  static async importFromExcel(fileUri: string): Promise<ExcelImportResult> {
    try {
      // For React Native, we'll need to use a different approach
      // This is a placeholder for the import logic
      console.log('Importing from Excel file:', fileUri);
      
      // Mock import result for now
      const mockResult: ExcelImportResult = {
        loans: [],
        users: [],
        payments: [],
        success: true,
        message: 'Excel import functionality will be implemented with file picker'
      };
      
      return mockResult;
    } catch (error) {
      console.error('Error importing Excel file:', error);
      return {
        loans: [],
        users: [],
        payments: [],
        success: false,
        message: `Import failed: ${error}`
      };
    }
  }

  static exportToExcel(data: {
    loans: Loan[];
    users: LoanUser[];
    payments: Payment[];
  }): string {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create a separate sheet for each loan (same structure as exportToExcelAndShare)
      data.loans.forEach(loan => {
        // Get current date info for filtering
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
        const currentYear = now.getFullYear();
        
        // Calculate previous month
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;
        if (previousMonth === 0) {
          previousMonth = 12;
          previousYear = currentYear - 1;
        }
        
        // Filter payments for current and previous months only
        const loanPayments = data.payments
          .filter(payment => {
            if (payment.loanId !== loan.id) return false;
            
            // Check if payment is in current or previous month
            const isCurrentMonth = payment.month === currentMonth && payment.year === currentYear;
            const isPreviousMonth = payment.month === previousMonth && payment.year === previousYear;
            
            return isCurrentMonth || isPreviousMonth;
          })
          .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          });
        
        // Create a row for each payment with all borrower details
        const loanSheetData = loanPayments.map(payment => {
          const borrower = data.users.find(user => user.id === payment.borrowerId);
          const borrowerName = borrower ? borrower.name : 'Unknown';
          
          // Create EMI month string (e.g., "Jan 2024", "Feb 2024")
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const emiMonth = `${monthNames[payment.month - 1]} ${payment.year}`;
          
          return {
            'Loan Name': loan.loanName || '',
            'Loan Amount': loan.totalAmount,
            'Total EMI': loan.totalEmis || 0,
            'Bank': loan.loanBank || '',
            'Start Date': loan.startDate,
            'End Date': loan.endDate,
            'Loan EMI Month': emiMonth,
            'Borrower Name': borrowerName,
            'Borrower Paid Status': payment.isPaid ? 'Paid' : 'Pending',
            'Borrower EMI Amount': payment.amount,
            'Borrower Paid Date': payment.paymentDate || '',
            'Borrower Payment Method': payment.paymentMethod || '',
            'Borrower Notes': payment.notes || '',
            'Paid By': payment.paidBy || '',
            'Transaction ID': payment.transactionId || '',
            'Receipt Number': payment.receiptNumber || '',
            'Late Fee': payment.lateFee || 0,
            'Due Date': payment.dueDate,
            'EMI Number': payment.emiNumber
          };
        });
        
        // If no payments exist for this loan, create at least one row with loan info
        if (loanSheetData.length === 0) {
          loanSheetData.push({
            'Loan Name': loan.loanName || '',
            'Loan Amount': loan.totalAmount,
            'Total EMI': loan.totalEmis || 0,
            'Bank': loan.loanBank || '',
            'Start Date': loan.startDate,
            'End Date': loan.endDate,
            'Loan EMI Month': '',
            'Borrower Name': '',
            'Borrower Paid Status': '',
            'Borrower EMI Amount': 0,
            'Borrower Paid Date': '',
            'Borrower Payment Method': '',
            'Borrower Notes': '',
            'Paid By': '',
            'Transaction ID': '',
            'Receipt Number': '',
            'Late Fee': 0,
            'Due Date': '',
            'EMI Number': 0
          });
        }
        
        // Create worksheet for this loan
        const loanWs = XLSX.utils.json_to_sheet(loanSheetData);
        
        // Create a valid sheet name (Excel has character limits and restrictions)
        let sheetName = loan.loanName || loan.loanNumber || `Loan_${loan.id.substring(0, 8)}`;
        // Remove invalid characters and limit length
        sheetName = sheetName.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, loanWs, sheetName);
      });
      
      // If no loans exist, add a default sheet
      if (data.loans.length === 0) {
        const emptyWs = XLSX.utils.json_to_sheet([{
          'Message': 'No loans found to export'
        }]);
        XLSX.utils.book_append_sheet(wb, emptyWs, 'No Data');
      }

      // Generate file
      const fileName = `SHG_Loans_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      return fileName;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error(`Export failed: ${error}`);
    }
  }

  static async exportToExcelAndShare(data: {
    loans: Loan[];
    users: LoanUser[];
    payments: Payment[];
  }): Promise<void> {
    try {
      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // Create a separate sheet for each loan
      data.loans.forEach(loan => {
        // Get current date info for filtering
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
        const currentYear = now.getFullYear();
        
        // Calculate previous month
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;
        if (previousMonth === 0) {
          previousMonth = 12;
          previousYear = currentYear - 1;
        }
        
        // Filter payments for current and previous months only
        const loanPayments = data.payments
          .filter(payment => {
            if (payment.loanId !== loan.id) return false;
            
            // Check if payment is in current or previous month
            const isCurrentMonth = payment.month === currentMonth && payment.year === currentYear;
            const isPreviousMonth = payment.month === previousMonth && payment.year === previousYear;
            
            return isCurrentMonth || isPreviousMonth;
          })
          .sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          });
        
        // Create a row for each payment with all borrower details
        const loanSheetData = loanPayments.map(payment => {
          const borrower = data.users.find(user => user.id === payment.borrowerId);
          const borrowerName = borrower ? borrower.name : 'Unknown';
          
          // Create EMI month string (e.g., "Jan 2024", "Feb 2024")
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const emiMonth = `${monthNames[payment.month - 1]} ${payment.year}`;
          
          return {
            'Loan Name': loan.loanName || '',
            'Loan Amount': loan.totalAmount,
            'Total EMI': loan.totalEmis || 0,
            'Bank': loan.loanBank || '',
            'Start Date': loan.startDate,
            'End Date': loan.endDate,
            'Loan EMI Month': emiMonth,
            'Borrower Name': borrowerName,
            'Borrower Paid Status': payment.isPaid ? 'Paid' : 'Pending',
            'Borrower EMI Amount': payment.amount,
            'Borrower Paid Date': payment.paymentDate || '',
            'Borrower Payment Method': payment.paymentMethod || '',
            'Borrower Notes': payment.notes || '',
            'Paid By': payment.paidBy || '',
            'Transaction ID': payment.transactionId || '',
            'Receipt Number': payment.receiptNumber || '',
            'Late Fee': payment.lateFee || 0,
            'Due Date': payment.dueDate,
            'EMI Number': payment.emiNumber
          };
        });
        
        // If no payments exist for this loan, create at least one row with loan info
        if (loanSheetData.length === 0) {
          loanSheetData.push({
            'Loan Name': loan.loanName || '',
            'Loan Amount': loan.totalAmount,
            'Total EMI': loan.totalEmis || 0,
            'Bank': loan.loanBank || '',
            'Start Date': loan.startDate,
            'End Date': loan.endDate,
            'Loan EMI Month': '',
            'Borrower Name': '',
            'Borrower Paid Status': '',
            'Borrower EMI Amount': 0,
            'Borrower Paid Date': '',
            'Borrower Payment Method': '',
            'Borrower Notes': '',
            'Paid By': '',
            'Transaction ID': '',
            'Receipt Number': '',
            'Late Fee': 0,
            'Due Date': '',
            'EMI Number': 0
          });
        }
        
        // Create worksheet for this loan
        const loanWs = XLSX.utils.json_to_sheet(loanSheetData);
        
        // Create a valid sheet name (Excel has character limits and restrictions)
        let sheetName = loan.loanName || loan.loanNumber || `Loan_${loan.id.substring(0, 8)}`;
        // Remove invalid characters and limit length
        sheetName = sheetName.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, loanWs, sheetName);
      });
      
      // If no loans exist, add a default sheet
      if (data.loans.length === 0) {
        const emptyWs = XLSX.utils.json_to_sheet([{
          'Message': 'No loans found to export'
        }]);
        XLSX.utils.book_append_sheet(wb, emptyWs, 'No Data');
      }
      
      // Generate file name
      const fileName = `SHG_Loans_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      if (Platform.OS === 'web') {
        // For web platform, use browser download
        const arrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([arrayBuffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // For mobile platforms, use file system and sharing
        const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
        const fileUri = FileSystem.cacheDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, base64, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        await Sharing.shareAsync(fileUri, { 
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
          dialogTitle: 'Export SHG Loans to Excel' 
        });
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error(`Export failed: ${error}`);
    }
  }

  static generateLoanReport(loans: Loan[], users: LoanUser[], payments: Payment[]): any {
    const report = {
      summary: {
        totalLoans: loans.length,
        activeLoans: loans.filter(l => l.status === 'active').length,
        completedLoans: loans.filter(l => l.status === 'completed').length,
        defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
        totalAmount: loans.reduce((sum, loan) => sum + loan.totalAmount, 0),
        totalCollected: payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0),
        totalPending: payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0),
      },
      monthlyCollection: this.calculateMonthlyCollection(payments),
      overdueLoans: this.getOverdueLoans(loans, payments),
      upcomingPayments: this.getUpcomingPayments(payments),
      borrowerSummary: this.getBorrowerSummary(loans, users, payments)
    };

    return report;
  }

  private static calculateMonthlyCollection(payments: Payment[]): any[] {
    const monthlyData: { [key: string]: number } = {};
    
    payments.forEach(payment => {
      if (payment.isPaid && payment.paymentDate) {
        const monthKey = payment.paymentDate.substring(0, 7); // YYYY-MM
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + payment.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  private static getOverdueLoans(loans: Loan[], payments: Payment[]): any[] {
    const today = new Date();
    return loans.filter(loan => {
      const nextPayment = payments.find(p => 
        p.loanId === loan.id && !p.isPaid
      );
      if (nextPayment) {
        return new Date(nextPayment.dueDate) < today;
      }
      return false;
    }).map(loan => ({
      loanId: loan.id,
      overdueDays: loan.overdueDays || 0,
      dueAmount: loan.emiAmount
    }));
  }

  private static getUpcomingPayments(payments: Payment[]): any[] {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return payments.filter(payment => {
      if (payment.isPaid) return false;
      const dueDate = new Date(payment.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    }).map(payment => ({
      paymentId: payment.id,
      loanId: payment.loanId,
      amount: payment.amount,
      dueDate: payment.dueDate,
      daysUntilDue: Math.ceil((new Date(payment.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  private static getBorrowerSummary(loans: Loan[], users: LoanUser[], payments: Payment[]): any[] {
    return users.map(user => {
      const userLoans = loans.filter(loan => loan.borrowerIds?.includes(user.id));
      const userPayments = payments.filter(payment => 
        payment.borrowerId === user.id
      );
      
      return {
        userId: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        totalLoans: userLoans.length,
        activeLoans: userLoans.filter(l => l.status === 'active').length,
        totalAmount: userLoans.reduce((sum, loan) => sum + loan.totalAmount, 0),
        totalPaid: userPayments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0),
        totalPending: userPayments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0),
        lastPaymentDate: userPayments
          .filter(p => p.isPaid && p.paymentDate)
          .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime())[0]?.paymentDate
      };
    });
  }
} 