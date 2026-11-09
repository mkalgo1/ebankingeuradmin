export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 USD = rateToUSD Units
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.79 },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 0.88 },
};

export type AccountStatus = 'verified' | 'pending' | 'suspended';
export type UserRole = 'user' | 'admin';

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  fullName: string;
  avatarUrl: string;
  role: UserRole;
  status: AccountStatus;
  currency: CurrencyCode;
  totalBalanceUSD: number;
  paymentNextUSD: number;
  paymentCompletedUSD: number;
  cardLimitUSD: number;
  todaySpentUSD: number;
  cardNumber: string;
  cardHolder: string;
  cardExpiry: string;
  cardCvv: string;
  cardFrozen: boolean;
  iban: string;
  bicSwift: string;
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  userId: string;
  type: 'payment' | 'transfer' | 'deposit' | 'withdrawal';
  title: string;
  subtitle: string;
  amountUSD: number; // negative for expense, positive for credit
  currency: CurrencyCode;
  status: 'Paid Successfully' | 'Pending' | 'Failed' | 'Reversed';
  badgeText?: string;
  iconType: 'mac' | 'keyboard' | 'ps5' | 'amazon' | 'flipkart' | 'apple' | 'transfer' | 'deposit' | 'generic';
  groupDate: 'Today' | 'Yesterday' | 'History';
  dateDisplay: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  targetUserEmail: string;
  timestamp: string;
  details: string;
}
