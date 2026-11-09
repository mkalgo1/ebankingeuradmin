import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Eye, EyeOff, ScanFace, ArrowRight, Building, Globe, CheckCircle2 } from 'lucide-react';
import { CurrencyCode, SUPPORTED_CURRENCIES, UserAccount } from '../types';
import { storage } from '../lib/storage';

interface AuthPageProps {
  onLoginSuccess: (user: UserAccount) => void;
  onNavigateAdminDirectly: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  onNavigateAdminDirectly,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [showPassword, setShowPassword] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle standard Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const user = storage.getUserByEmail(email);
    if (!user) {
      setErrorMsg('No European account found with this email. Try Demo Account or Sign Up.');
      return;
    }

    if (user.password && user.password !== password) {
      setErrorMsg('Invalid PIN / Password for this account.');
      return;
    }

    if (user.status === 'suspended') {
      setErrorMsg('This account has been suspended by the Bank Compliance Department. Contact your account manager.');
      return;
    }

    storage.setCurrentSession(user);
    onLoginSuccess(user);
  };

  // Handle instant Biometric Face ID login
  const handleBiometricLogin = () => {
    setIsBiometricScanning(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsBiometricScanning(false);
      // Log into the verified screenshot demo account
      const demoUser = storage.getUserByEmail('client@ebanking.eu') || storage.getUsers()[0];
      storage.setCurrentSession(demoUser);
      onLoginSuccess(demoUser);
    }, 1500);
  };

  // Fast demo account shortcuts
  const handleQuickDemoClient = () => {
    const demo = storage.getUserByEmail('client@ebanking.eu') || storage.getUsers()[0];
    storage.setCurrentSession(demo);
    onLoginSuccess(demo);
  };

  const handleQuickDemoAdmin = () => {
    const admin = storage.getUserByEmail('admin@ebanking.eu') || storage.getUsers()[1];
    storage.setCurrentSession(admin);
    onLoginSuccess(admin);
  };

  // Handle New Account Registration
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('All fields are required.');
      return;
    }

    const existing = storage.getUserByEmail(email);
    if (existing) {
      setErrorMsg('An account with this email address is already registered.');
      return;
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const newAccount: UserAccount = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      password: password.trim(),
      fullName: fullName.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'user',
      status: 'verified',
      currency: selectedCurrency,
      totalBalanceUSD: 50000.00, // complimentary European opening balance
      paymentNextUSD: 2500.00,
      paymentCompletedUSD: 47500.00,
      cardLimitUSD: 25000.00,
      todaySpentUSD: 0.00,
      cardNumber: `3745 ${randomDigits} 4096 ${randomDigits + 12}`,
      cardHolder: fullName.toUpperCase(),
      cardExpiry: '10/30',
      cardCvv: '682',
      cardFrozen: false,
      iban: `EU24 BKEU 0088 ${randomDigits} 1920 44`,
      bicSwift: 'BKEUEU2X',
      createdAt: new Date().toISOString(),
    };

    const users = [...storage.getUsers(), newAccount];
    storage.saveUsers(users);
    storage.setCurrentSession(newAccount);
    onLoginSuccess(newAccount);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Auth Container */}
      <div className="relative w-full max-w-md bg-white rounded-[32px] p-6 sm:p-8 shadow-soft-card border border-gray-100 z-10 animate-fade-in">
        {/* Brand Crest */}
        <div className="flex flex-col items-center text-center pb-6">
          <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg mb-3 border border-white/10">
            <Building className="w-7 h-7 text-blue-400" />
          </div>
          <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase mb-0.5">
            European E-Banking System
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {mode === 'login' ? 'Private Portal Login' : 'Open European Account'}
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Institutional & Individual High-Net-Worth Neo-Banking
          </p>
        </div>

        {/* Tab Switcher: Login / Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'login'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Open Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Biometric Scanning Overlay */}
        {isBiometricScanning && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center animate-pulse">
                <ScanFace className="w-10 h-10 text-blue-600" />
              </div>
              <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Authenticating Face ID...</h4>
              <p className="text-[11px] text-gray-400">Secure European Enclave Handshake</p>
            </div>
          </div>
        )}

        {!isBiometricScanning && (
          <>
            {mode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    European Account / Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@ebanking.eu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none bg-gray-50/50"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Security PIN / Password
                    </label>
                    <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                      Forgot PIN?
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter pass or PIN"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none bg-gray-50/50"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 active:scale-95 transition shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Authorize & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Biometric Face ID Button */}
                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  className="w-full py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 text-blue-700 text-xs font-bold hover:bg-blue-100/60 active:scale-95 transition flex items-center justify-center space-x-2"
                >
                  <ScanFace className="w-4 h-4 text-blue-600" />
                  <span>Quick Sign-In with Face ID</span>
                </button>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none bg-gray-50/50"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.eu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-600 focus:outline-none bg-gray-50/50"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Base Currency Preference
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:border-blue-600 focus:outline-none bg-gray-50/50 appearance-none"
                    >
                      {Object.keys(SUPPORTED_CURRENCIES).map((cur) => (
                        <option key={cur} value={cur}>
                          {cur} - {SUPPORTED_CURRENCIES[cur as CurrencyCode].name} ({SUPPORTED_CURRENCIES[cur as CurrencyCode].symbol})
                        </option>
                      ))}
                    </select>
                    <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Create 4-Digit Security PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      maxLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:border-blue-600 focus:outline-none bg-gray-50/50"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition shadow-md flex items-center justify-center space-x-2"
                >
                  <span>Open Account & Issue Virtual Mastercard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Instant Demo One-Click Access Buttons */}
            <div className="pt-6 mt-6 border-t border-gray-100">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-2.5">
                Instant One-Click Demo Access
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleQuickDemoClient}
                  className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Demo Client ($548K)</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickDemoAdmin}
                  className="py-2 px-3 rounded-xl bg-neutral-900 hover:bg-black text-white text-[11px] font-bold transition flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin Control Panel</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Regulatory Badge */}
        <div className="pt-5 flex items-center justify-center space-x-1.5 text-[10px] text-gray-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Regulated European Banking • ECB & EBA Compliant</span>
        </div>
      </div>
    </div>
  );
};
