import React, { useState } from 'react';
import { X, Copy, Check, ShieldCheck, Lock, Snowflake } from 'lucide-react';
import { UserAccount } from '../../types';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onToggleFreeze: () => void;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  onToggleFreeze,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
              MC
            </div>
            <h3 className="text-base font-bold text-gray-900">Virtual Card Details</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Graphical Preview */}
        <div className="py-4">
          <div className="w-full rounded-2xl bg-gradient-to-tr from-[#16171b] via-[#21232a] to-[#121316] p-5 text-white shadow-xl border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between pb-6">
              <span className="text-xs font-mono font-semibold tracking-widest text-gray-300">
                EUROPEAN TITANIUM
              </span>
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded-full bg-[#EB001B]"></div>
                <div className="w-5 h-5 rounded-full bg-[#F79E1B]"></div>
              </div>
            </div>

            <div className="font-mono text-lg font-bold tracking-wider py-2">
              {user.cardNumber}
            </div>

            <div className="flex items-center justify-between pt-4 text-xs font-mono text-gray-300">
              <div>
                <span className="text-[9px] text-gray-500 block uppercase">Cardholder</span>
                <span className="font-semibold">{user.cardHolder}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block uppercase">Expires</span>
                <span className="font-semibold">{user.cardExpiry}</span>
              </div>
              <div>
                <span className="text-[9px] text-gray-500 block uppercase">CVV</span>
                <span className="font-semibold">{user.cardCvv}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyable Field List */}
        <div className="space-y-3 pt-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <div className="text-gray-400 font-medium">Card Number</div>
              <div className="font-mono font-bold text-gray-900 text-sm">{user.cardNumber}</div>
            </div>
            <button
              onClick={() => handleCopy(user.cardNumber.replace(/\s+/g, ''), 'number')}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 transition flex items-center space-x-1"
            >
              {copiedField === 'number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-semibold">{copiedField === 'number' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <div className="text-gray-400 font-medium">Expiry</div>
                <div className="font-mono font-bold text-gray-900">{user.cardExpiry}</div>
              </div>
              <button
                onClick={() => handleCopy(user.cardExpiry, 'exp')}
                className="p-1 rounded-md text-gray-500 hover:text-blue-600"
              >
                {copiedField === 'exp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <div className="text-gray-400 font-medium">CVV CVC</div>
                <div className="font-mono font-bold text-gray-900">{user.cardCvv}</div>
              </div>
              <button
                onClick={() => handleCopy(user.cardCvv, 'cvv')}
                className="p-1 rounded-md text-gray-500 hover:text-blue-600"
              >
                {copiedField === 'cvv' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <div className="text-gray-400 font-medium">IBAN Account</div>
              <div className="font-mono font-bold text-gray-900">{user.iban}</div>
            </div>
            <button
              onClick={() => handleCopy(user.iban, 'iban')}
              className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-blue-600 transition flex items-center space-x-1"
            >
              {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-semibold">{copiedField === 'iban' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Freeze card switch button */}
        <div className="pt-4">
          <button
            onClick={onToggleFreeze}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${
              user.cardFrozen
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            {user.cardFrozen ? <Lock className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
            <span>{user.cardFrozen ? 'Unfreeze Card Instantly' : 'Freeze Card Temporarily'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
