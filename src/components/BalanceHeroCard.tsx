import React, { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Send } from 'lucide-react';
import { UserAccount, CurrencyCode } from '../types';
import { storage } from '../lib/storage';

interface BalanceHeroCardProps {
  user: UserAccount;
  currency: CurrencyCode;
  onOpenSend: () => void;
  onOpenDeposit: () => void;
}

export const BalanceHeroCard: React.FC<BalanceHeroCardProps> = ({
  user,
  currency,
  onOpenSend,
  onOpenDeposit,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const formattedTotal = storage.formatCurrency(user.totalBalanceUSD, currency);
  const formattedNext = storage.formatCurrency(user.paymentNextUSD, currency);
  const formattedCompleted = storage.formatCurrency(user.paymentCompletedUSD, currency);

  return (
    <div className="w-full px-5 py-2">
      <div className="w-full bg-white rounded-[26px] p-5 shadow-soft-card border border-gray-100">
        {/* Label & Eye Toggle */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Balance</span>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="text-gray-400 hover:text-gray-700 p-1 transition"
            title="Toggle Balance Privacy"
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Big Balance Amount */}
        <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight pb-5">
          {showBalance ? formattedTotal : '••••••••••••'}
        </div>

        {/* Split Metrics (Twin Rounded Boxes) */}
        <div className="grid grid-cols-2 gap-3 pb-4">
          {/* Payment Next */}
          <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100">
            <div className="text-[11px] font-medium text-gray-400 mb-1">Payment Next</div>
            <div className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              {showBalance ? formattedNext : '••••••'}
            </div>
          </div>

          {/* Payment Completed */}
          <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-gray-100">
            <div className="text-[11px] font-medium text-gray-400 mb-1">Payment Completed</div>
            <div className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
              {showBalance ? formattedCompleted : '••••••'}
            </div>
          </div>
        </div>

        {/* Quick Transfer / Deposit Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onOpenSend}
            className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 active:scale-95 transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Money</span>
          </button>
          <button
            onClick={onOpenDeposit}
            className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition shadow-xs"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
