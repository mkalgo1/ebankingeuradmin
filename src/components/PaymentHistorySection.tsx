import React from 'react';
import { Monitor, Keyboard, Gamepad2, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { BankTransaction, CurrencyCode } from '../types';
import { storage } from '../lib/storage';

interface PaymentHistorySectionProps {
  transactions: BankTransaction[];
  currency: CurrencyCode;
  onPayNow: (transactionId: string) => void;
  onSelectTransaction: (txn: BankTransaction) => void;
}

export const PaymentHistorySection: React.FC<PaymentHistorySectionProps> = ({
  transactions,
  currency,
  onPayNow,
  onSelectTransaction,
}) => {
  // Filter history transactions or items
  const historyItems = transactions.filter(t => t.groupDate === 'History' || t.title.includes('Mac') || t.title.includes('Keyboard') || t.title.includes('PS5'));

  const getProductIcon = (iconType: string) => {
    switch (iconType) {
      case 'mac':
        return (
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center p-2 text-neutral-800 shadow-xs border border-gray-100">
            <Monitor className="w-6 h-6 text-gray-700" />
          </div>
        );
      case 'keyboard':
        return (
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center p-2 text-white shadow-xs border border-gray-800">
            <Keyboard className="w-6 h-6 text-emerald-400" />
          </div>
        );
      case 'ps5':
        return (
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center p-2 text-neutral-900 shadow-xs border border-gray-100">
            <Gamepad2 className="w-6 h-6 text-indigo-600" />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center p-2 text-blue-600 shadow-xs border border-blue-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="w-full px-5 py-3">
      {/* Section Title */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">Payment History</h3>
        <span className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center">
          View All <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </span>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {historyItems.map((item) => {
          const isPending = item.status === 'Pending';
          const formattedAmount = storage.formatCurrency(item.amountUSD, currency);

          return (
            <div
              key={item.id}
              onClick={() => onSelectTransaction(item)}
              className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-soft-card hover:border-gray-200 transition cursor-pointer"
            >
              <div className="flex items-start justify-between">
                {/* Left: Product Icon & Titles */}
                <div className="flex items-center space-x-3">
                  {getProductIcon(item.iconType)}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 tracking-tight">{item.title}</h4>
                    <p className="text-xs text-gray-400 font-medium">{item.subtitle}</p>
                  </div>
                </div>

                {/* Right: Amount & Date */}
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 tracking-tight">{formattedAmount}</div>
                  <div className="text-[11px] text-gray-400 font-medium">{item.dateDisplay}</div>
                </div>
              </div>

              {/* Badges / CTA Row */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-50">
                <div className="flex items-center space-x-2">
                  {item.badgeText && (
                    <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full">
                      {item.badgeText}
                    </span>
                  )}
                  {item.status === 'Paid Successfully' && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      Paid Successfully
                    </span>
                  )}
                </div>

                {/* If Pending / Pay Now is needed */}
                {isPending && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPayNow(item.id);
                    }}
                    className="text-xs font-bold text-white bg-black hover:bg-neutral-800 active:scale-95 px-3.5 py-1.5 rounded-full transition shadow-xs flex items-center space-x-1"
                  >
                    <span>Pay Now</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
