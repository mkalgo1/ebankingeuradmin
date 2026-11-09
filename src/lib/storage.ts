import { UserAccount, BankTransaction, CurrencyCode, SUPPORTED_CURRENCIES } from '../types';

const STORAGE_KEY_USERS = 'ebanking_users_v2';
const STORAGE_KEY_TXNS = 'ebanking_txns_v2';
const STORAGE_KEY_SESSION = 'ebanking_session_v2';

// Realistic initial demo seed matching the user's reference image
const DEFAULT_CLIENT: UserAccount = {
  id: 'usr_vikram_2026',
  email: 'client@ebanking.eu',
  password: 'demo',
  fullName: 'Vikram UI/UX',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  role: 'user',
  status: 'verified',
  currency: 'USD',
  totalBalanceUSD: 548750.87,
  paymentNextUSD: 43865.00,
  paymentCompletedUSD: 547876.04,
  cardLimitUSD: 43865.00,
  todaySpentUSD: 659.49,
  cardNumber: '3745 6987 4096 3960',
  cardHolder: 'Vikram UI/UX',
  cardExpiry: '09/29',
  cardCvv: '842',
  cardFrozen: false,
  iban: 'EU89 BKEU 0048 3920 1829 48',
  bicSwift: 'BKEUEU2X',
  createdAt: '2026-01-01T00:00:00Z',
};

const DEFAULT_ADMIN: UserAccount = {
  id: 'adm_supervisor_eu',
  email: 'admin@ebanking.eu',
  password: 'admin',
  fullName: 'Bank Executive Supervisor',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  role: 'admin',
  status: 'verified',
  currency: 'EUR',
  totalBalanceUSD: 1850000.00,
  paymentNextUSD: 25000.00,
  paymentCompletedUSD: 1825000.00,
  cardLimitUSD: 100000.00,
  todaySpentUSD: 1420.00,
  cardNumber: '4912 8820 1934 7721',
  cardHolder: 'Supervisor General',
  cardExpiry: '12/30',
  cardCvv: '901',
  cardFrozen: false,
  iban: 'EU33 BKEU 0099 1822 4910 55',
  bicSwift: 'BKEUEU2X',
  createdAt: '2025-11-01T00:00:00Z',
};

const DEFAULT_TXNS: BankTransaction[] = [
  // Payment History Section (Left screen in reference)
  {
    id: 'txn_history_1',
    userId: 'usr_vikram_2026',
    type: 'payment',
    title: 'Mac mini M4',
    subtitle: 'Amazon.com',
    amountUSD: -628.71,
    currency: 'USD',
    status: 'Paid Successfully',
    badgeText: '% amazon sale offer',
    iconType: 'mac',
    groupDate: 'History',
    dateDisplay: '1 January, 2026',
    createdAt: '2026-01-01T14:20:00Z'
  },
  {
    id: 'txn_history_2',
    userId: 'usr_vikram_2026',
    type: 'payment',
    title: 'Kreo Gaming Keyboard',
    subtitle: 'Amazon.com',
    amountUSD: -29.25,
    currency: 'USD',
    status: 'Paid Successfully',
    badgeText: "Amazon's Choice",
    iconType: 'keyboard',
    groupDate: 'History',
    dateDisplay: '2 January, 2026',
    createdAt: '2026-01-02T11:15:00Z'
  },
  {
    id: 'txn_history_3',
    userId: 'usr_vikram_2026',
    type: 'payment',
    title: 'PS5',
    subtitle: 'Amazon.com',
    amountUSD: -836.94,
    currency: 'USD',
    status: 'Pending',
    badgeText: 'Due date 18',
    iconType: 'ps5',
    groupDate: 'History',
    dateDisplay: 'Due date 18 Jan, 2026',
    createdAt: '2026-01-03T09:40:00Z'
  },
  // Transactions Screen (Right screen in reference)
  {
    id: 'txn_today_1',
    userId: 'usr_vikram_2026',
    type: 'payment',
    title: 'Amazon.com',
    subtitle: 'Nov 18, 2025',
    amountUSD: -86.59,
    currency: 'USD',
    status: 'Paid Successfully',
    badgeText: 'Purchase',
    iconType: 'amazon',
    groupDate: 'Today',
    dateDisplay: '9:34 AM',
    createdAt: '2026-01-04T09:34:00Z'
  },
  {
    id: 'txn_today_2',
    userId: 'usr_vikram_2026',
    type: 'payment',
    title: 'Flipkart.com',
    subtitle: 'Sep 24, 2025',
    amountUSD: -30.45,
    currency: 'USD',
    status: 'Paid Successfully',
    badgeText: 'Retail',
    iconType: 'flipkart',
    groupDate: 'Today',
    dateDisplay: '8:49 AM',
    createdAt: '2026-01-04T08:49:00Z'
  },
  {
    id: 'txn_yesterday_1',
    userId: 'usr_vikram_2026',
    type: 'payment',
    title: 'Apple.com',
    subtitle: 'Oct 22, 2025',
    amountUSD: -260.92,
    currency: 'USD',
    status: 'Paid Successfully',
    badgeText: 'Hardware & iCloud',
    iconType: 'apple',
    groupDate: 'Yesterday',
    dateDisplay: '10:00 AM',
    createdAt: '2026-01-03T10:00:00Z'
  },
  {
    id: 'txn_yesterday_2',
    userId: 'usr_vikram_2026',
    type: 'payment',
    title: 'Apple.com',
    subtitle: 'Oct 22, 2025',
    amountUSD: -300.00,
    currency: 'USD',
    status: 'Paid Successfully',
    badgeText: 'Developer Services',
    iconType: 'apple',
    groupDate: 'Yesterday',
    dateDisplay: '9:50 AM',
    createdAt: '2026-01-03T09:50:00Z'
  }
];

class StorageService {
  private broadcast: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcast = new BroadcastChannel('ebanking_channel');
    }
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY_USERS)) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([DEFAULT_CLIENT, DEFAULT_ADMIN]));
    }
    if (!localStorage.getItem(STORAGE_KEY_TXNS)) {
      localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(DEFAULT_TXNS));
    }
  }

  public getUsers(): UserAccount[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEY_USERS);
      return data ? JSON.parse(data) : [DEFAULT_CLIENT, DEFAULT_ADMIN];
    } catch {
      return [DEFAULT_CLIENT, DEFAULT_ADMIN];
    }
  }

  public saveUsers(users: UserAccount[]) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    this.notifyUpdate('USERS_UPDATED');
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public updateUser(updatedUser: UserAccount) {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    this.saveUsers(users);

    // Update active session if matching
    const currentSession = this.getCurrentSession();
    if (currentSession && currentSession.id === updatedUser.id) {
      this.setCurrentSession(updatedUser);
    }
  }

  public getTransactions(userId?: string): BankTransaction[] {
    this.ensureInitialized();
    try {
      const data = localStorage.getItem(STORAGE_KEY_TXNS);
      const list: BankTransaction[] = data ? JSON.parse(data) : DEFAULT_TXNS;
      if (userId) {
        return list.filter(t => t.userId === userId);
      }
      return list;
    } catch {
      return DEFAULT_TXNS;
    }
  }

  public addTransaction(txn: BankTransaction) {
    const list = [txn, ...this.getTransactions()];
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(list));
    this.notifyUpdate('TXN_ADDED');
  }

  public updateTransaction(updated: BankTransaction) {
    const list = this.getTransactions().map(t => t.id === updated.id ? updated : t);
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(list));
    this.notifyUpdate('TXN_UPDATED');
  }

  public getCurrentSession(): UserAccount | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY_SESSION);
      if (data) {
        const parsed = JSON.parse(data);
        // refresh against stored users list to have latest balance/status
        const latest = this.getUserById(parsed.id);
        return latest || parsed;
      }
      // Default to demo client
      return DEFAULT_CLIENT;
    } catch {
      return DEFAULT_CLIENT;
    }
  }

  public setCurrentSession(user: UserAccount | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
    this.notifyUpdate('SESSION_CHANGED');
  }

  private notifyUpdate(type: string) {
    if (this.broadcast) {
      this.broadcast.postMessage({ type, timestamp: Date.now() });
    }
    window.dispatchEvent(new Event('storage'));
  }

  public subscribe(callback: () => void): () => void {
    const storageHandler = () => callback();
    window.addEventListener('storage', storageHandler);

    let channelHandler: ((e: MessageEvent) => void) | null = null;
    if (this.broadcast) {
      channelHandler = () => callback();
      this.broadcast.addEventListener('message', channelHandler);
    }

    return () => {
      window.removeEventListener('storage', storageHandler);
      if (this.broadcast && channelHandler) {
        this.broadcast.removeEventListener('message', channelHandler);
      }
    };
  }

  // Convert USD base amount to any currency
  public convertAmount(amountInUSD: number, targetCurrency: CurrencyCode): number {
    const rate = SUPPORTED_CURRENCIES[targetCurrency]?.rateToUSD || 1.0;
    return amountInUSD * rate;
  }

  // Format currency with symbol
  public formatCurrency(amountInUSD: number, currency: CurrencyCode, hideDecimals = false): string {
    const converted = this.convertAmount(amountInUSD, currency);
    const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
    const isNegative = converted < 0;
    const absVal = Math.abs(converted);

    const formattedNumber = absVal.toLocaleString('en-US', {
      minimumFractionDigits: hideDecimals ? 0 : 2,
      maximumFractionDigits: hideDecimals ? 0 : 2,
    });

    if (currency === 'CHF') {
      return `${isNegative ? '-' : ''}${formattedNumber} CHF`;
    }
    return `${isNegative ? '-' : ''}${config.symbol}${formattedNumber}`;
  }
}

export const storage = new StorageService();
