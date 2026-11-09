import React, { useState } from 'react';
import { X, SlidersHorizontal, Check } from 'lucide-react';
import { UserAccount, CurrencyCode } from '../../types';
import { storage } from '../../lib/storage';

interface CardLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  currency: CurrencyCode;
  onSave: (updatedUser: UserAccount) => void;
}

export const CardLimitsModal: React.FC<CardLimitsModalProps> = ({
  isOpen,
  onClose,
  user,
  currency,
  onSave,
}) => {
  const [limitUSD, setLimitUSD] = useState(user.cardLimitUSD);

  if (!isOpen) return null;

  const handleSave = () => {
    const updatedUser: UserAccount = {
      ...user,
      cardLimitUSD: limitUSD,
    };
    storage.updateUser(updatedUser);
    onSave(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Configure Card Limits</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-5">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Monthly Spending Limit
            </div>
            <div className="text-3xl font-extrabold text-gray-900 font-mono">
              {storage.formatCurrency(limitUSD, currency)}
            </div>
          </div>

          <div>
            <input
              type="range"
              min="5000"
              max="150000"
              step="1000"
              value={limitUSD}
              onChange={(e) => setLimitUSD(parseFloat(e.target.value))}
              className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[11px] text-gray-400 font-mono mt-2">
              <span>{storage.formatCurrency(5000, currency, true)}</span>
              <span>{storage.formatCurrency(75000, currency, true)}</span>
              <span>{storage.formatCurrency(150000, currency, true)}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl text-blue-900 text-xs flex items-start space-x-2">
            <span className="font-bold">Info:</span>
            <span>Card limits protect your funds. Limits adjust immediately across all physical, contactless, and virtual online payments.</span>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 transition flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply New Limits</span>
          </button>
        </div>
      </div>
    </div>
  );
};
