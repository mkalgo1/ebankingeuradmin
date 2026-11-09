import React from 'react';
import { Headphones, Bell, Globe } from 'lucide-react';
import { UserAccount, CurrencyCode, SUPPORTED_CURRENCIES } from '../types';

interface HeaderBarProps {
  user: UserAccount;
  currency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  user,
  currency,
  onCurrencyChange,
  onOpenSupport,
  onOpenNotifications,
  unreadCount = 5,
}) => {
  return (
    <div className="w-full flex items-center justify-between pt-3 pb-3 px-5 sticky top-0 z-30 bg-[#F5F7FA]/95 backdrop-blur-md">
      {/* User Profile Avatar with verified ring & Greeting */}
      <div className="flex items-center space-x-3">
        <div className="relative group cursor-pointer">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400 p-0.5 bg-white shadow-xs transition hover:scale-105"
          />
          {user.status === 'verified' && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          )}
          {user.status === 'suspended' && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
          )}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Account Active</div>
          <div className="text-sm font-bold text-gray-900 tracking-tight leading-tight">{user.fullName}</div>
        </div>
      </div>

      {/* Currency Switcher & Action Icons */}
      <div className="flex items-center space-x-2">
        {/* Currency Pill Dropdown */}
        <div className="relative flex items-center bg-white border border-gray-200/80 rounded-full px-2.5 py-1.5 shadow-xs hover:border-gray-300 transition">
          <Globe className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
            className="text-xs font-bold text-gray-800 bg-transparent outline-none cursor-pointer pr-1"
            aria-label="Change currency"
          >
            {Object.keys(SUPPORTED_CURRENCIES).map((cur) => (
              <option key={cur} value={cur} className="text-gray-900 font-medium">
                {cur} ({SUPPORTED_CURRENCIES[cur as CurrencyCode].symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Customer Support Headset */}
        <button
          onClick={onOpenSupport}
          title="European Private Concierge"
          className="w-10 h-10 rounded-full bg-white border border-gray-200/70 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-50 active:scale-95 transition shadow-xs"
        >
          <Headphones className="w-4 h-4" />
        </button>

        {/* Notifications Bell with 5 badge */}
        <button
          onClick={onOpenNotifications}
          title="Notifications"
          className="relative w-10 h-10 rounded-full bg-white border border-gray-200/70 flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-50 active:scale-95 transition shadow-xs"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
