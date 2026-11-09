import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, RefreshCw, LogOut, ArrowRight, Smartphone, 
  Monitor, ExternalLink, Zap, TrendingUp, PieChart, ShieldCheck
} from 'lucide-react';
import { UserAccount, BankTransaction, CurrencyCode, TabType } from './types';
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

  const transactions = storage.getTransactions(currentUser.id);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] font-['Plus_Jakarta_Sans',sans-serif] text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Banner for Desktop Navigation & Quick Admin Link */}
      <header className="hidden lg:flex w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-8 py-3.5 items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
            EU
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight">European E-Banking</div>
            <div className="text-[10px] text-gray-400 font-medium">Licensed Credit Institution • ECB Regulated</div>
          </div>
        </div>

        {/* Desktop Quick Shortcuts */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSendOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition"
          >
            Send Money
          </button>
          <button
            onClick={() => setIsDepositOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
          >
            Deposit
          </button>
          <button
            onClick={() => setCurrentRoute('admin')}
            className="py-2 px-3.5 rounded-xl bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Admin Panel</span>
          </button>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <main className="max-w-7xl mx-auto py-2 sm:py-6 lg:py-8 px-2 sm:px-6">
        {/* DESKTOP WORKSTATION: Dual Phone Screen View + Expansive Dashboard */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
          {/* Left Column: Authentic Dual Mobile Preview (Screen 1 & Screen 2 Side-by-Side like Screenshot!) */}
          <div className="col-span-8 bg-white/60 p-6 rounded-[36px] border border-gray-200/80 shadow-soft-card">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-200/60">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Mobile Experience</span>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Dual-Screen Banking View (Exact Reference Image Recreation)
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200/60">
                  ● 100% Interactive & Synced
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Screen 1: Card Wallet & Payment History */}
              <div className="w-full max-w-[380px] mx-auto bg-[#F5F7FA] rounded-[36px] shadow-2xl border-4 border-[#E2E4E9] overflow-hidden flex flex-col relative pb-20">
                <HeaderBar
                  user={currentUser}
                  currency={currency}
                  onCurrencyChange={handleCurrencyChange}
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  unreadCount={unreadNotifications}
                />
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
                  transactions={transactions}
                  currency={currency}
                  onPayNow={handlePayNow}
                  onSelectTransaction={() => {}}
                />
              </div>

              {/* Screen 2: Total Balance & Transactions */}
              <div className="w-full max-w-[380px] mx-auto bg-[#F5F7FA] rounded-[36px] shadow-2xl border-4 border-[#E2E4E9] overflow-hidden flex flex-col relative pb-20">
                <HeaderBar
                  user={currentUser}
                  currency={currency}
                  onCurrencyChange={handleCurrencyChange}
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  unreadCount={unreadNotifications}
                />
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
                  transactions={transactions}
                  currency={currency}
                  onSelectTransaction={() => {}}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Command Center & Fast Action Panel */}
          <div className="col-span-4 space-y-6">
            {/* Quick Balance Overview */}
            <div className="bg-white rounded-3xl p-6 shadow-soft-card border border-gray-100">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                European Liquidity Balance
              </span>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {storage.formatCurrency(currentUser.totalBalanceUSD, currency)}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
                <div>
                  <div className="text-gray-400 font-medium">Payment Next</div>
                  <div className="font-bold text-gray-900">
                    {storage.formatCurrency(currentUser.paymentNextUSD, currency)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 font-medium">Payment Completed</div>
                  <div className="font-bold text-gray-900">
                    {storage.formatCurrency(currentUser.paymentCompletedUSD, currency)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  onClick={() => setIsSendOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition"
                >
                  Send Money
                </button>
                <button
                  onClick={() => setIsDepositOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Top Up Deposit
                </button>
              </div>
            </div>

            {/* Virtual Mastercard Controls */}
            <div className="bg-white rounded-3xl p-6 shadow-soft-card border border-gray-100">
              <div className="flex items-center justify-between pb-3">
                <h3 className="text-sm font-bold text-gray-900">Mastercard Settings</h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  currentUser.cardFrozen ? 'bg-blue-50 text-cyan-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {currentUser.cardFrozen ? 'Frozen' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4 font-mono">
                {currentUser.cardNumber}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => setIsCardDetailsOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-800 transition text-left flex items-center justify-between"
                >
                  <span>View Full Card Credentials</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsLimitsOpen(true)}
                  className="w-full py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-800 transition text-left flex items-center justify-between"
                >
                  <span>Adjust Card Spending Limits</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </button>
                <button
                  onClick={handleToggleFreeze}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition text-left flex items-center justify-between ${
                    currentUser.cardFrozen 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                  }`}
                >
                  <span>{currentUser.cardFrozen ? 'Unfreeze Card' : 'Freeze Card Temporarily'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Admin Direct Access Card */}
            <div className="bg-gradient-to-br from-[#121316] to-[#1e2026] text-white rounded-3xl p-6 shadow-xl border border-white/10">
              <div className="flex items-center space-x-2 pb-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold">Admin Management</h4>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Full administrative supervision over accounts, balance overrides, verification statuses, and transaction injection.
              </p>
              <button
                onClick={() => setCurrentRoute('admin')}
                className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <span>Open Admin Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE VIEWPORT (< 1024px): Seamless Swipeable / Tabbable Experience */}
        <div className="lg:hidden w-full max-w-md mx-auto bg-[#F5F7FA] min-h-screen pb-24 relative">
          <HeaderBar
            user={currentUser}
            currency={currency}
            onCurrencyChange={handleCurrencyChange}
            onOpenSupport={() => setIsSupportOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            unreadCount={unreadNotifications}
          />

          {/* Active Tab Screen Content */}
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
                transactions={transactions}
                currency={currency}
                onPayNow={handlePayNow}
                onSelectTransaction={() => {}}
              />
            </div>
          )}

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
                transactions={transactions}
                currency={currency}
                onSelectTransaction={() => {}}
              />
            </div>
          )}

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

          {activeTab === 'analytics' && (
            <div className="space-y-3 px-5 py-2 animate-fade-in">
              <div className="bg-white rounded-3xl p-5 shadow-soft-card">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Monthly Financial Inflow
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
                transactions={transactions}
                currency={currency}
                onSelectTransaction={() => {}}
              />
            </div>
          )}

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

          {/* Floating Navigation Dock */}
          <FloatingDock activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </main>

      {/* ALL INTERACTIVE MODALS */}
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
