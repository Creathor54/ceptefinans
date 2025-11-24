
export interface ReceiptItem {
  name: string;
  price: number;
  quantity: string;
}

export interface ReceiptData {
  merchant: string;
  date: string;
  items: ReceiptItem[];
  total: number;
  currency?: string;
}

export interface Expense extends ReceiptData {
  id: string;
  category: string;
  timestamp: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit?: number;
}

export interface PaymentPlan {
  id: string;
  title: string;
  totalAmount: number;
  totalInstallments: number;
  startDate: string; // YYYY-MM-DD
  category: string; // Icon mapping
  
  // Computed/State fields (optional because we can calculate them)
  remainingAmount?: number;
  monthlyPayment?: number;
  currentInstallment?: number;
  nextPaymentDate?: string;
  status?: 'active' | 'completed';
  daysLeft?: number;
}

export interface Subscription {
  id: string;
  platform: string; // Netflix, Spotify, Rent etc.
  amount: number;
  currency: string;
  category: string; // icon name
  firstPaymentDate: string; // YYYY-MM-DD
  nextPaymentDate: string; // YYYY-MM-DD (Updated automatically)
  billingCycle: 'monthly' | 'yearly';
  color: string;
  isActive: boolean;
}

export interface AppNotification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionLink?: string;
}

export interface User {
  name: string;
  surname: string;
  email: string;
  password?: string; // Demo purposes only
  avatar?: string;
}
