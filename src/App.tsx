import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, RefreshCw, LogOut, ArrowRight, Smartphone, 
  Monitor, ExternalLink, Zap, TrendingUp, PieChart, ShieldCheck,
  CreditCard, Send, ArrowDownLeft, Building, Globe, SlidersHorizontal,
  FileText, Lock, CheckCircle2, ChevronRight, Home, Wallet, User,
  ArrowUpRight
} from 'lucide-react';
import { UserAccount, BankTransaction, CurrencyCode, TabType, SUPPORTED_CURRENCIES } from './types';
import { storage } from './lib/storage';
import { HeaderBar } from './components/HeaderBar';
import { CardLeatherPouch } from './components/CardLeatherPouch';
import { QuickActionPills } from './components/QuickActionPills';
import { PaymentHistorySection } from './components/PaymentHistorySection';
import { BalanceHeroCard } from './components/BalanceHeroCard';
import { CardLimitsSlider } from './components/CardLimitsSlider';
import { TransactionsSection } from './components/TransactionsSection';
import { FloatingDock } from './components/FloatingDock';
import { AuthPage } from './pages/AuthPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { SendMoneyModal } from './components/modals/SendMoneyModal';
import { DepositModal } from './components/modals/DepositModal';
import { CardDetailsModal } from './components/modals/CardDetailsModal';
import { CardLimitsModal } from './components/modals/CardLimitsModal';
import { SupportDrawer } from './components/modals/SupportDrawer';
import { NotificationDrawer } from './components/modals/NotificationDrawer';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // Routing detection
  const isDirectAdminUrl = 
    window.location.pathname.includes('/admin-dashboard') || 
    window.location.hostname.includes('admin') ||
    window.location.search.includes('admin');

  const [currentRoute, setCurrentRoute] = useState<'client' | 'admin'>(
    isDirectAdminUrl ? 'admin' : 'client'
  );

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storage.getCurrentSession());
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [desktopNav, setDesktopNav] = useState<'dashboard' | 'cards' | 'transfers' | 'history' | 'analytics'>('dashboard');
  const [txnFilter, setTxnFilter] = useState<'all' | 'history' | 'today' | 'yesterday'>('all');

  // Modals state
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Live storage sync
  const refreshUserData = () => {
    const session = storage.getCurrentSession();
    if (session) {
      const refreshed = storage.getUserById(session.id);
      if (refreshed) {
        setCurrentUser(refreshed);
        setCurrency(refreshed.currency || 'USD');
      }
    }
  };

  useEffect(() => {
    refreshUserData();
    const unsubscribe = storage.subscribe(refreshUserData);
    return () => unsubscribe();
  }, []);

  // Handle Currency change
  const handleCurrencyChange = (newCur: CurrencyCode) => {
    setCurrency(newCur);
    if (currentUser) {
      const updated = { ...currentUser, currency: newCur };
      storage.updateUser(updated);
      setCurrentUser(updated);
    }
  };

  // Toggle freeze card
  const handleToggleFreeze = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, cardFrozen: !currentUser.cardFrozen };
    storage.updateUser(updated);
    setCurrentUser(updated);
  };

  // Pay Now on PS5 item
  const handlePayNow = (txnId: string) => {
    if (!currentUser) return;
    const txn = storage.getTransactions().find(t => t.id === txnId);
    if (!txn) return;

    const amountUSD = Math.abs(txn.amountUSD);
    if (currentUser.totalBalanceUSD < amountUSD) {
      alert('Insufficient funds for this due payment.');
      return;
    }

    // Deduct balance
    const updatedUser = {
      ...currentUser,
      totalBalanceUSD: currentUser.totalBalanceUSD - amountUSD,
      paymentCompletedUSD: currentUser.paymentCompletedUSD + amountUSD,
    };
    storage.updateUser(updatedUser);
    setCurrentUser(updatedUser);

    // Update transaction
    const updatedTxn: BankTransaction = {
      ...txn,
      status: 'Paid Successfully',
      badgeText: 'Settled Early'
    };
    storage.updateTransaction(updatedTxn);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Handle Logout
  const handleLogout = () => {
    storage.setCurrentSession(null);
    setCurrentUser(null);
  };

  // If Admin view is selected
  if (currentRoute === 'admin') {
    return (
      <AdminDashboard
        onBackToClient={() => {
          window.history.pushState({}, '', '/');
          setCurrentRoute('client');
        }}
        onLogout={handleLogout}
      />
    );
  }

  // If not logged in, render the Auth Page
  if (!currentUser) {
    return (
      <AuthPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrency(user.currency || 'USD');
          if (user.role === 'admin') {
            setCurrentRoute('admin');
          }
        }}
        onNavigateAdminDirectly={() => setCurrentRoute('admin')}
      />
    );
  }

  // If account is Suspended by Admin
  if (currentUser.status === 'suspended') {
    return (
      <div className="min-h-screen w-full bg-[#111317] text-white flex flex-col items-center justify-center p-6 text-center font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 mb-4 animate-pulse">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">European Banking Compliance Notice</h2>
        <p className="text-xs text-gray-400 max-w-sm mt-2 leading-relaxed">
          Your account ({currentUser.email}) has been placed on temporary hold by Bank Administration under regulatory AML compliance.
        </p>
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => setIsSupportOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700 transition"
          >
            Contact Concierge
          </button>
          <button
            onClick={handleLogout}
            className="py-2.5 px-4 rounded-xl bg-white/10 text-xs font-bold hover:bg-white/15 transition"
          >
            Sign Out
          </button>
        </div>
        <SupportDrawer isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
      </div>
    );
  }

  const allTransactions = storage.getTransactions(currentUser.id);

  // Filter transactions for Desktop view
  const filteredTransactions = allTransactions.filter(t => {
    if (txnFilter === 'history') return t.groupDate === 'History' || t.title.includes('Mac') || t.title.includes('Keyboard') || t.title.includes('PS5');
    if (txnFilter === 'today') return t.groupDate === 'Today';
    if (txnFilter === 'yesterday') return t.groupDate === 'Yesterday';
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* =========================================================================
          DESKTOP FULL REAL BANKING APPLICATION INTERFACE (lg:flex)
          ========================================================================= */}
      <div className="hidden lg:flex min-h-screen w-full">
        {/* Left Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200/80 flex flex-col justify-between shrink-0 sticky top-0 h-screen p-6">
          <div className="space-y-6">
            {/* Bank Crest / Logo */}
            <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                EU
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-gray-900 leading-none">Apex Private Bank</h1>
                <span className="text-[10px] text-gray-400 font-medium">European Credit Institution</span>
              </div>
            </div>

            {/* User Profile Tile */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400 p-0.5 bg-white"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate">{currentUser.fullName}</div>
                <div className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span>Verified Client</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 text-xs font-bold">
              <button
                onClick={() => setDesktopNav('dashboard')}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                  desktopNav === 'dashboard' ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>

              <button
                onClick={() => {
                  setDesktopNav('cards');
                  setIsCardDetailsOpen(true);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                  desktopNav === 'cards' ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card & Credentials</span>
              </button>

              <button
                onClick={() => {
                  setDesktopNav('transfers');
                  setIsSendOpen(true);
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                  desktopNav === 'transfers' ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Payments & Transfers</span>
              </button>

              <button
                onClick={() => {
                  setDesktopNav('history');
                  const el = document.getElementById('desktop-txns');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl transition ${
                  desktopNav === 'history' ? 'bg-black text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Transaction History</span>
              </button>

              <button
                onClick={() => setIsLimitsOpen(true)}
                className="w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-black transition"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Spending Limits</span>
              </button>
            </nav>
          </div>

          {/* Bottom Sidebar Action Items */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentRoute('admin')}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition flex items-center justify-between"
            >
              <span className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Dashboard</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-3 rounded-xl bg-gray-50 text-gray-600 text-xs font-semibold hover:bg-rose-50 hover:text-rose-600 transition flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Desktop Main Content Workstation */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Welcome back</span>
              <div className="text-lg font-extrabold text-gray-900 tracking-tight">{currentUser.fullName} • Private Wealth</div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Dynamic Currency Switcher */}
              <div className="flex items-center bg-gray-100 rounded-full px-3 py-1.5 border border-gray-200">
                <Globe className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-xs font-bold text-gray-700 mr-2">Standard Currency:</span>
                <select
                  value={currency}
                  onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)}
                  className="bg-transparent text-xs font-extrabold text-gray-900 outline-none cursor-pointer"
                >
                  {Object.keys(SUPPORTED_CURRENCIES).map((cur) => (
                    <option key={cur} value={cur}>
                      {cur} ({SUPPORTED_CURRENCIES[cur as CurrencyCode].symbol})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setIsSendOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition flex items-center space-x-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Money</span>
              </button>

              <button
                onClick={() => setIsDepositOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center space-x-1.5 shadow-xs"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Top Up Deposit</span>
              </button>

              {/* Concierge & Notification */}
              <button
                onClick={() => setIsSupportOpen(true)}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition"
                title="European Concierge"
              >
                <HeaderBar
                  user={currentUser}
                  currency={currency}
                  onCurrencyChange={handleCurrencyChange}
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  unreadCount={unreadNotifications}
                />
              </button>
            </div>
          </header>

          {/* Desktop Dashboard Canvas */}
          <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
            
            {/* ROW 1: Hero Total Balance Card & Luxury Stitched Mastercard */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              {/* Balance Hero Card (7 Cols) */}
              <div className="col-span-12 xl:col-span-7 flex flex-col justify-between bg-white rounded-3xl p-7 shadow-soft-card border border-gray-100">
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Available Balance</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      +4.85% APY Active
                    </span>
                  </div>

                  <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight my-2">
                    {storage.formatCurrency(currentUser.totalBalanceUSD, currency)}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Official European Central Bank Clearing Corridor</span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-6">
                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="text-xs font-medium text-gray-400 block mb-1">Payment Next Due</span>
                    <span className="text-lg font-bold text-gray-900 font-mono">
                      {storage.formatCurrency(currentUser.paymentNextUSD, currency)}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-gray-100">
                    <span className="text-xs font-medium text-gray-400 block mb-1">Payment Completed</span>
                    <span className="text-lg font-bold text-gray-900 font-mono">
                      {storage.formatCurrency(currentUser.paymentCompletedUSD, currency)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => setIsSendOpen(true)}
                    className="flex-1 py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Instant Wire / Transfer</span>
                  </button>
                  <button
                    onClick={() => setIsDepositOpen(true)}
                    className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>SEPA / Card Deposit</span>
                  </button>
                </div>
              </div>

              {/* Luxury Stitched Leather Card Pouch (5 Cols) */}
              <div className="col-span-12 xl:col-span-5 bg-white rounded-3xl p-6 shadow-soft-card border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Mastercard</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      currentUser.cardFrozen ? 'bg-blue-50 text-cyan-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {currentUser.cardFrozen ? 'Frozen' : 'Active'}
                    </span>
                  </div>

                  {/* The genuine stitched card component */}
                  <CardLeatherPouch
                    user={currentUser}
                    currency={currency}
                    onSelectCard={() => setIsCardDetailsOpen(true)}
                    onToggleFreeze={handleToggleFreeze}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setIsCardDetailsOpen(true)}
                    className="py-2.5 px-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-bold transition text-center"
                  >
                    Card Details
                  </button>
                  <button
                    onClick={handleToggleFreeze}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition text-center ${
                      currentUser.cardFrozen ? 'bg-blue-600 text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    {currentUser.cardFrozen ? 'Unfreeze' : 'Freeze Card'}
                  </button>
                  <button
                    onClick={() => setIsLimitsOpen(true)}
                    className="py-2.5 px-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-xl text-xs font-bold transition text-center"
                  >
                    Set Limits
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2: Card Limits Slider & Financial Flow Insights */}
            <div className="grid grid-cols-12 gap-6 items-stretch">
              {/* Card Limits Progress (6 Cols) */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-6 shadow-soft-card border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 tracking-tight">Card Spending Limits</h3>
                      <p className="text-xs text-gray-400">Daily contactless and online spending buffer</p>
                    </div>
                    <button
                      onClick={() => setIsLimitsOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <span>Adjust Cap</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <CardLimitsSlider
                    user={currentUser}
                    currency={currency}
                    onOpenSetLimits={() => setIsLimitsOpen(true)}
                  />
                </div>
              </div>

              {/* Weekly Financial Inflow / Outflow Analytics (6 Cols) */}
              <div className="col-span-12 lg:col-span-6 bg-white rounded-3xl p-6 shadow-soft-card border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 tracking-tight">Weekly Liquidity Flow</h3>
                    <p className="text-xs text-gray-400">Total settlement volume this week</p>
                  </div>
                  <span className="text-sm font-extrabold text-gray-900 font-mono">
                    {storage.formatCurrency(currentUser.paymentCompletedUSD, currency)}
                  </span>
                </div>

                <div className="h-32 flex items-end justify-between gap-3 pt-4">
                  {[40, 65, 35, 85, 75, 95, 60].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 3: Full Real Transactions & Payment History Stream */}
            <div id="desktop-txns" className="bg-white rounded-3xl p-7 shadow-soft-card border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Transaction Ledger</h3>
                  <p className="text-xs text-gray-400">Real-time payment history, pending settlements, and store clearances</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setTxnFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      txnFilter === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    All ({allTransactions.length})
                  </button>
                  <button
                    onClick={() => setTxnFilter('history')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      txnFilter === 'history' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Payment History (Amazon, PS5)
                  </button>
                  <button
                    onClick={() => setTxnFilter('today')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      txnFilter === 'today' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setTxnFilter('yesterday')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      txnFilter === 'yesterday' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Yesterday
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto pt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wider text-[11px]">
                      <th className="pb-3 px-3">Item / Merchant</th>
                      <th className="pb-3 px-3">Category Tag</th>
                      <th className="pb-3 px-3">Date & Time</th>
                      <th className="pb-3 px-3">Amount</th>
                      <th className="pb-3 px-3">Status</th>
                      <th className="pb-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredTransactions.map((item) => {
                      const isPending = item.status === 'Pending';
                      const formattedAmount = storage.formatCurrency(item.amountUSD, currency);

                      return (
                        <tr key={item.id} className="hover:bg-gray-50/60 transition group">
                          {/* Title & Subtitle */}
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-gray-900 text-sm">{item.title}</div>
                            <div className="text-gray-400 text-xs font-medium">{item.subtitle}</div>
                          </td>

                          {/* Tag */}
                          <td className="py-3.5 px-3">
                            {item.badgeText ? (
                              <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                {item.badgeText}
                              </span>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          {/* Date Display */}
                          <td className="py-3.5 px-3 text-gray-500 font-medium">
                            {item.dateDisplay}
                          </td>

                          {/* Amount */}
                          <td className={`py-3.5 px-3 font-mono font-bold text-sm ${
                            item.amountUSD >= 0 ? 'text-emerald-600' : 'text-gray-900'
                          }`}>
                            {item.amountUSD >= 0 ? `+${formattedAmount}` : formattedAmount}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center space-x-1.5 ${
                              item.status === 'Paid Successfully' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'Paid Successfully' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}></span>
                              <span>{item.status}</span>
                            </span>
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-3 text-right">
                            {isPending ? (
                              <button
                                onClick={() => handlePayNow(item.id)}
                                className="py-1.5 px-3 rounded-full bg-black hover:bg-neutral-800 text-white font-bold text-xs transition shadow-xs"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <span className="text-gray-400 text-xs">Cleared</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VIEWPORT (lg:hidden): 100% REAL FULL-BLEED NATIVE CLIENT INTERFACE
          ========================================================================= */}
      <div className="lg:hidden w-full min-h-screen pb-24 bg-[#F5F7FA]">
        <HeaderBar
          user={currentUser}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={unreadNotifications}
        />

        {/* Tab 1: Home (Exact Card & Payment History View) */}
        {activeTab === 'home' && (
          <div className="space-y-1 animate-fade-in">
            <CardLeatherPouch
              user={currentUser}
              currency={currency}
              onSelectCard={() => setIsCardDetailsOpen(true)}
              onToggleFreeze={handleToggleFreeze}
            />
            <QuickActionPills
              user={currentUser}
              onOpenCardDetails={() => setIsCardDetailsOpen(true)}
              onToggleFreeze={handleToggleFreeze}
              onOpenMore={() => setIsSendOpen(true)}
            />
            <PaymentHistorySection
              transactions={allTransactions}
              currency={currency}
              onPayNow={handlePayNow}
              onSelectTransaction={() => {}}
            />
          </div>
        )}

        {/* Tab 2: Wallet (Exact Total Balance, Card Limits, and Today/Yesterday Transactions) */}
        {activeTab === 'wallet' && (
          <div className="space-y-1 animate-fade-in">
            <BalanceHeroCard
              user={currentUser}
              currency={currency}
              onOpenSend={() => setIsSendOpen(true)}
              onOpenDeposit={() => setIsDepositOpen(true)}
            />
            <CardLimitsSlider
              user={currentUser}
              currency={currency}
              onOpenSetLimits={() => setIsLimitsOpen(true)}
            />
            <TransactionsSection
              transactions={allTransactions}
              currency={currency}
              onSelectTransaction={() => {}}
            />
          </div>
        )}

        {/* Tab 3: Cards */}
        {activeTab === 'cards' && (
          <div className="space-y-3 px-5 py-2 animate-fade-in">
            <CardLeatherPouch
              user={currentUser}
              currency={currency}
              onSelectCard={() => setIsCardDetailsOpen(true)}
              onToggleFreeze={handleToggleFreeze}
            />
            <CardLimitsSlider
              user={currentUser}
              currency={currency}
              onOpenSetLimits={() => setIsLimitsOpen(true)}
            />
            <div className="bg-white rounded-2xl p-4 shadow-soft-card">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Card Management</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setIsCardDetailsOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-50 text-xs font-semibold text-gray-800 text-left flex justify-between"
                >
                  <span>Card Security Credentials</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={handleToggleFreeze}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-50 text-xs font-semibold text-gray-800 text-left flex justify-between"
                >
                  <span>{currentUser.cardFrozen ? 'Unfreeze Card' : 'Freeze Card'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-3 px-5 py-2 animate-fade-in">
            <div className="bg-white rounded-3xl p-5 shadow-soft-card">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Weekly Financial Inflow
              </span>
              <div className="text-2xl font-extrabold text-gray-900 font-mono">
                {storage.formatCurrency(currentUser.paymentCompletedUSD, currency)}
              </div>
              <div className="h-32 flex items-end justify-between gap-2 pt-6">
                {[45, 60, 30, 85, 70, 95, 65].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full bg-blue-600 rounded-t-lg transition-all"
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <TransactionsSection
              transactions={allTransactions}
              currency={currency}
              onSelectTransaction={() => {}}
            />
          </div>
        )}

        {/* Tab 5: Profile & Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-3 px-5 py-2 animate-fade-in">
            <div className="bg-white rounded-3xl p-5 shadow-soft-card text-center">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-16 h-16 rounded-full mx-auto ring-4 ring-emerald-100 object-cover mb-3"
              />
              <h3 className="text-lg font-extrabold text-gray-900">{currentUser.fullName}</h3>
              <p className="text-xs text-gray-400 font-mono">{currentUser.email}</p>
              <div className="mt-3 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                Verified European Private Account
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 shadow-soft-card space-y-2">
              <button
                onClick={() => setCurrentRoute('admin')}
                className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 text-white text-xs font-bold text-left flex justify-between items-center"
              >
                <span className="flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-2 text-blue-400" />
                  Admin Control Room
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold text-left flex justify-between items-center"
              >
                <span>Sign Out</span>
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Capsule Dock Bar */}
        <FloatingDock activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* =========================================================================
          INTERACTIVE POPUPS & MODALS
          ========================================================================= */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        user={currentUser}
        currency={currency}
        onSuccess={(updated) => setCurrentUser(updated)}
      />

      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        user={currentUser}
        currency={currency}
        onSuccess={(updated) => setCurrentUser(updated)}
      />

      <CardDetailsModal
        isOpen={isCardDetailsOpen}
        onClose={() => setIsCardDetailsOpen(false)}
        user={currentUser}
        onToggleFreeze={handleToggleFreeze}
      />

      <CardLimitsModal
        isOpen={isLimitsOpen}
        onClose={() => setIsLimitsOpen(false)}
        user={currentUser}
        currency={currency}
        onSave={(updated) => setCurrentUser(updated)}
      />

      <SupportDrawer
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onClear={() => setUnreadNotifications(0)}
      />
    </div>
  );
};

export default App;
