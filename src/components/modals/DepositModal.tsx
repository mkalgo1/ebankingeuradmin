import React, { useState } from 'react';
import { X, ArrowDownLeft, CheckCircle2, Building, CreditCard, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, CurrencyCode } from '../../types';
import { storage } from '../../lib/storage';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currency: CurrencyCode;
  onSuccess: (updatedUser: UserAccount) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  user,
  currency,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'sepa' | 'card' | 'crypto'>('card');
  const [amount, setAmount] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const rate = storage.convertAmount(1, currency);
  const amountUSD = numAmount / (rate || 1);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      const updatedUser: UserAccount = {
        ...user,
        totalBalanceUSD: user.totalBalanceUSD + amountUSD,
        paymentCompletedUSD: user.paymentCompletedUSD + amountUSD,
      };

      storage.updateUser(updatedUser);

      storage.addTransaction({
        id: `txn_dep_${Date.now()}`,
        userId: user.id,
        type: 'deposit',
        title: method === 'sepa' ? 'SEPA Direct Credit' : method === 'card' ? 'Debit Card Top-Up' : 'USDT Crypto Deposit',
        subtitle: 'European Central Bank Clearance',
        amountUSD: amountUSD,
        currency,
        status: 'Paid Successfully',
        badgeText: 'Deposit Cleared',
        iconType: 'deposit',
        groupDate: 'Today',
        dateDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });

      setIsSuccess(true);
      onSuccess(updatedUser);
    }, 1200);
  };

  const handleDone = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Deposit Funds</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleDeposit} className="space-y-4 pt-4">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-xl border text-center transition ${
                  method === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px]">Instant Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('sepa')}
                className={`p-3 rounded-xl border text-center transition ${
                  method === 'sepa'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px]">SEPA Wire</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('crypto')}
                className={`p-3 rounded-xl border text-center transition ${
                  method === 'crypto'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <QrCode className="w-4 h-4 mx-auto mb-1" />
                <span className="text-[11px]">Crypto USDT</span>
              </button>
            </div>

            {/* Quick Amounts */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Select or Enter Amount ({currency})
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['250', '500', '1000', '5000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      amount === preset
                        ? 'bg-black text-white border-black'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-4 pr-16 py-2.5 rounded-xl border border-gray-200 text-lg font-bold font-mono focus:border-blue-600 focus:outline-none bg-gray-50/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                  {currency}
                </span>
              </div>
            </div>

            {/* Simulated IBAN reference */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs">
              <div className="text-gray-400 font-medium">Designated Virtual IBAN</div>
              <div className="font-mono font-bold text-gray-800">{user.iban}</div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:scale-95 transition shadow-md flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <span>Confirming Clearance...</span>
              ) : (
                <span>Deposit {storage.formatCurrency(amountUSD, currency)}</span>
              )}
            </button>
          </form>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-gray-900">Deposit Complete!</h4>
              <p className="text-xs text-gray-500 mt-1">
                Added {storage.formatCurrency(amountUSD, currency)} to your European account.
              </p>
            </div>
            <button
              onClick={handleDone}
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
