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
    <div className="w-full flex flex-col pt-2 pb-3 px-5">
      {/* Dynamic Status Bar (iOS style) */}
      <div className="flex items-center justify-between text-xs font-semibold text-gray-900 pb-2 px-1">
        <span>9:41</span>
        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
          <span className="text-[9px] text-white font-mono tracking-tight">E-BANK EU</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {/* Signal bars */}
          <div className="flex items-end space-x-0.5 h-3">
            <span className="w-0.5 h-1 bg-black rounded-sm"></span>
            <span className="w-0.5 h-1.5 bg-black rounded-sm"></span>
            <span className="w-0.5 h-2 bg-black rounded-sm"></span>
            <span className="w-0.5 h-2.5 bg-black rounded-sm"></span>
          </div>
          {/* WiFi icon */}
          <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z"/>
          </svg>
          {/* Battery */}
          <div className="w-5 h-2.5 border border-black rounded-sm p-0.5 flex items-center">
            <div className="h-full w-full bg-black rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="flex items-center justify-between pt-1">
        {/* User Profile Avatar with verified ring */}
        <div className="flex items-center space-x-3">
          <div className="relative group cursor-pointer">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-400 p-0.5 bg-white shadow-sm transition hover:scale-105"
            />
            {user.status === 'verified' && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
            {user.status === 'suspended' && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="hidden xs:block">
            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Account Holder</div>
            <div className="text-sm font-bold text-gray-900 tracking-tight">{user.fullName}</div>
          </div>
        </div>

        {/* Currency Switcher & Action Icons */}
        <div className="flex items-center space-x-2.5">
          {/* Currency Pill Dropdown */}
          <div className="relative flex items-center bg-white border border-gray-200/80 rounded-full px-2.5 py-1 shadow-xs hover:border-gray-300 transition">
            <Globe className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
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
    </div>
  );
};
