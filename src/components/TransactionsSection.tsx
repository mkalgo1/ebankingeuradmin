import React from 'react';
import { BankTransaction, CurrencyCode } from '../types';
import { storage } from '../lib/storage';

interface TransactionsSectionProps {
  transactions: BankTransaction[];
  currency: CurrencyCode;
  onSelectTransaction: (txn: BankTransaction) => void;
}

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  currency,
  onSelectTransaction,
}) => {
  // Group transactions by date
  const todayTxns = transactions.filter(t => t.groupDate === 'Today');
  const yesterdayTxns = transactions.filter(t => t.groupDate === 'Yesterday');

  const renderBrandIcon = (iconType: string, title: string) => {
    if (iconType === 'amazon' || title.toLowerCase().includes('amazon')) {
      return (
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm tracking-tighter shadow-xs">
          a
        </div>
      );
    }
    if (iconType === 'flipkart' || title.toLowerCase().includes('flipkart')) {
      return (
        <div className="w-10 h-10 rounded-full bg-[#FFD200] text-black flex items-center justify-center font-bold text-xs shadow-xs">
          <svg className="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z"/>
          </svg>
        </div>
      );
    }
    if (iconType === 'apple' || title.toLowerCase().includes('apple')) {
      return (
        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.92.04-2.02.62-2.67 1.37-.56.65-1.06 1.7-0.93 2.71 1.02.08 2.06-.49 2.68-1.23z"/>
          </svg>
        </div>
      );
    }
    // Generic fallback
    return (
      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
        {title.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  const renderList = (items: BankTransaction[], label: string) => {
    if (items.length === 0) return null;

    return (
      <div className="pt-2 pb-1">
        <div className="text-xs font-semibold text-gray-400 pb-2">{label}</div>
        <div className="space-y-3">
          {items.map((txn) => {
            const formattedAmount = storage.formatCurrency(Math.abs(txn.amountUSD), currency);
            return (
              <div
                key={txn.id}
                onClick={() => onSelectTransaction(txn)}
                className="flex items-center justify-between py-1 cursor-pointer hover:bg-gray-50/50 rounded-xl px-1 transition"
              >
                {/* Brand Logo & Merchant Name */}
                <div className="flex items-center space-x-3">
                  {renderBrandIcon(txn.iconType, txn.title)}
                  <div>
                    <h5 className="text-sm font-bold text-gray-900 tracking-tight">{txn.title}</h5>
                    <p className="text-xs text-gray-400 font-medium">{txn.subtitle || txn.dateDisplay}</p>
                  </div>
                </div>

                {/* Amount & Time */}
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 tracking-tight">
                    {txn.amountUSD > 0 ? `+${formattedAmount}` : formattedAmount}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium">{txn.dateDisplay}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full px-5 py-3">
      <div className="w-full bg-white rounded-[24px] p-5 shadow-soft-card border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-50">
          <h4 className="text-base font-bold text-gray-900 tracking-tight">Transactions</h4>
          <span className="text-xs font-semibold text-blue-600 cursor-pointer">Filter</span>
        </div>

        {renderList(todayTxns, 'Today')}
        {renderList(yesterdayTxns, 'Yesterday')}
      </div>
    </div>
  );
};
