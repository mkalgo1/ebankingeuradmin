import React from 'react';
import { CreditCard, Snowflake, ShieldAlert, MoreHorizontal } from 'lucide-react';
import { UserAccount } from '../types';

interface QuickActionPillsProps {
  user: UserAccount;
  onOpenCardDetails: () => void;
  onToggleFreeze: () => void;
  onOpenMore: () => void;
}

export const QuickActionPills: React.FC<QuickActionPillsProps> = ({
  user,
  onOpenCardDetails,
  onToggleFreeze,
  onOpenMore,
}) => {
  return (
    <div className="w-full px-5 py-2.5">
      <div className="grid grid-cols-3 gap-3">
        {/* Card Details */}
        <button
          onClick={onOpenCardDetails}
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-gray-100 shadow-soft-card hover:bg-gray-50 active:scale-95 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-800 group-hover:text-blue-600 transition mb-2">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-800 tracking-tight">Card Details</span>
        </button>

        {/* Freeze Card */}
        <button
          onClick={onToggleFreeze}
          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border shadow-soft-card active:scale-95 transition group ${
            user.cardFrozen
              ? 'bg-blue-50 border-blue-200'
              : 'bg-white border-gray-100 hover:bg-gray-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition mb-2 ${
            user.cardFrozen 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-50 text-gray-800 group-hover:text-cyan-600'
          }`}>
            {user.cardFrozen ? <ShieldAlert className="w-5 h-5" /> : <Snowflake className="w-5 h-5" />}
          </div>
          <span className={`text-xs font-semibold tracking-tight ${
            user.cardFrozen ? 'text-blue-700' : 'text-gray-800'
          }`}>
            {user.cardFrozen ? 'Unfreeze Card' : 'Freeze Card'}
          </span>
        </button>

        {/* More */}
        <button
          onClick={onOpenMore}
          className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-gray-100 shadow-soft-card hover:bg-gray-50 active:scale-95 transition group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-800 group-hover:text-blue-600 transition mb-2">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-gray-800 tracking-tight">More</span>
        </button>
      </div>
    </div>
  );
};
