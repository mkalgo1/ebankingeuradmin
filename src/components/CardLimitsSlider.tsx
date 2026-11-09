import React from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { UserAccount, CurrencyCode } from '../types';
import { storage } from '../lib/storage';

interface CardLimitsSliderProps {
  user: UserAccount;
  currency: CurrencyCode;
  onOpenSetLimits: () => void;
}

export const CardLimitsSlider: React.FC<CardLimitsSliderProps> = ({
  user,
  currency,
  onOpenSetLimits,
}) => {
  const percentage = Math.min(100, Math.max(0, (user.todaySpentUSD / (user.cardLimitUSD || 1)) * 100));
  const formattedToday = storage.formatCurrency(user.todaySpentUSD, currency);
  const formattedLimit = storage.formatCurrency(user.cardLimitUSD, currency);

  return (
    <div className="w-full px-5 py-2">
      <div className="w-full bg-white rounded-[24px] p-4 shadow-soft-card border border-gray-100">
        <div className="flex items-center justify-between pb-3">
          <span className="text-sm font-bold text-gray-900 tracking-tight">Card Limits</span>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>

        {/* Custom Pill Slider matching image */}
        <div className="relative w-full h-5 rounded-full bg-gray-100 p-0.5 overflow-hidden flex items-center">
          {/* Diagonal striped pattern in the background */}
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #94a3b8, #94a3b8 2px, transparent 2px, transparent 6px)'
            }}
          />

          {/* Active Electric Blue Progress Bar */}
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500 relative flex items-center justify-end"
            style={{ width: `${Math.max(8, percentage)}%` }}
          >
            {/* Draggable-styled thumb ring */}
            <div className="w-4 h-4 bg-white rounded-full shadow-md border-2 border-blue-600 mr-0.5"></div>
          </div>
        </div>

        {/* Limit Subtext */}
        <div className="flex items-center justify-between pt-3 text-xs">
          <span className="text-gray-400 font-medium">Today Limits</span>
          <span className="font-bold text-gray-900 font-mono tracking-tight">
            {formattedToday} <span className="text-gray-400 font-normal">/ {formattedLimit}</span>
          </span>
        </div>

        {/* Set Card Limits Action */}
        <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between">
          <button
            onClick={onOpenSetLimits}
            className="w-full py-1.5 flex items-center justify-between text-xs font-semibold text-gray-800 hover:text-blue-600 transition group"
          >
            <span className="flex items-center">
              <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-gray-400 group-hover:text-blue-600" />
              Set card limits
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
