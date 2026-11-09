import React, { useState } from 'react';
import { X, Send, CheckCircle2, ScanFace, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, CurrencyCode } from '../../types';
import { storage } from '../../lib/storage';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currency: CurrencyCode;
  onSuccess: (updatedUser: UserAccount) => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  user,
  currency,
  onSuccess,
}) => {
  const [recipient, setRecipient] = useState('');
  const [iban, setIban] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'form' | 'biometric' | 'success'>('form');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  // Convert user entered amount in active currency back to base USD for storage
  const rate = storage.convertAmount(1, currency);
  const amountUSD = numAmount / (rate || 1);

  const handleStartSend = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid transfer amount.');
      return;
    }
    if (amountUSD > user.totalBalanceUSD) {
      setErrorMsg('Insufficient balance for this transfer.');
      return;
    }
    if (!recipient.trim()) {
      setErrorMsg('Recipient name or business is required.');
      return;
    }

    setStep('biometric');
    setIsVerifying(true);

    // Simulate authentic European Bank Face ID scan
    setTimeout(() => {
      setIsVerifying(false);

      // Perform deduction
      const updatedUser: UserAccount = {
        ...user,
        totalBalanceUSD: user.totalBalanceUSD - amountUSD,
        todaySpentUSD: user.todaySpentUSD + amountUSD,
      };

      storage.updateUser(updatedUser);

      // Add transaction to history
      storage.addTransaction({
        id: `txn_${Date.now()}`,
        userId: user.id,
        type: 'transfer',
        title: recipient.trim(),
        subtitle: note || 'SEPA Instant Transfer',
        amountUSD: -amountUSD,
        currency,
        status: 'Paid Successfully',
        badgeText: 'Instant Transfer',
        iconType: 'transfer',
        groupDate: 'Today',
        dateDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setStep('success');
      onSuccess(updatedUser);
    }, 1800);
  };

  const handleReset = () => {
    setRecipient('');
    setIban('');
    setAmount('');
    setNote('');
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Transfer & Send</h3>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === 'form' && (
          <form onSubmit={handleStartSend} className="space-y-4 pt-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Recipient Name / Company
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Elena Rostova or Amazon EU"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:border-blue-600 focus:outline-none bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                IBAN or Account Number
              </label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                placeholder="e.g. DE89 3704 0044 0532 0130 00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-medium focus:border-blue-600 focus:outline-none bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Amount ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-gray-200 text-lg font-bold font-mono focus:border-blue-600 focus:outline-none bg-gray-50/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {currency}
                </span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">
                Available: {storage.formatCurrency(user.totalBalanceUSD, currency)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Payment Reference (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Invoice #8492 or Personal transfer"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:border-blue-600 focus:outline-none bg-gray-50/50"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-black text-white text-sm font-bold hover:bg-neutral-800 active:scale-95 transition shadow-md flex items-center justify-center space-x-2"
            >
              <span>Continue with Biometrics</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'biometric' && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center animate-pulse">
                <ScanFace className="w-10 h-10 text-blue-600 animate-bounce" />
              </div>
              <div className="absolute inset-0 border-4 border-blue-400 rounded-full animate-ping opacity-25"></div>
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Verifying Face ID</h4>
              <p className="text-xs text-gray-400 mt-1">European Secure Banking Biometric Authorization...</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-gray-900">Transfer Successful!</h4>
              <p className="text-xs text-gray-500 mt-1">
                Sent {storage.formatCurrency(amountUSD, currency)} to <span className="font-semibold text-gray-900">{recipient}</span>
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
