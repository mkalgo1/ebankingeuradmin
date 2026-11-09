import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Snowflake, Lock } from 'lucide-react';
import { UserAccount, CurrencyCode } from '../types';
import { storage } from '../lib/storage';

interface CardLeatherPouchProps {
  user: UserAccount;
  currency: CurrencyCode;
  onSelectCard?: () => void;
  onToggleFreeze?: () => void;
}

export const CardLeatherPouch: React.FC<CardLeatherPouchProps> = ({
  user,
  currency,
  onSelectCard,
  onToggleFreeze,
}) => {
  const [showLimit, setShowLimit] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const formattedLimit = storage.formatCurrency(user.cardLimitUSD, currency);

  return (
    <div className="w-full px-5 py-2">
      {/* Outer Leather Pouch Container */}
      <div 
        className="relative w-full rounded-[26px] bg-[#1a1c21] p-4 text-white shadow-2xl overflow-hidden transition-all duration-300 border border-white/10"
        style={{
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15)'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Leather grain texture overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 0.75px, transparent 0.75px)`,
            backgroundSize: '8px 8px'
          }}
        />

        {/* Realistic embossed curved stitch perimeter */}
        <div className="relative w-full rounded-[20px] bg-[#141519] p-4 border border-white/5 overflow-hidden">
          {/* Stitched holes simulation along top curve */}
          <div className="absolute top-2 left-4 right-4 flex justify-between pointer-events-none opacity-40">
            {Array.from({ length: 22 }).map((_, i) => (
              <span key={i} className="w-1 h-0.5 bg-gray-500 rounded-full inline-block"></span>
            ))}
          </div>

          {/* Inserted Physical Card */}
          <div 
            onClick={onSelectCard}
            className={`relative w-full rounded-2xl bg-gradient-to-br from-[#262830] via-[#1c1d23] to-[#121316] p-4 border border-white/10 cursor-pointer transition-transform duration-300 ${
              isHovered ? '-translate-y-1 shadow-lg' : ''
            }`}
          >
            {/* Frozen Overlay if Card is frozen */}
            {user.cardFrozen && (
              <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-[2px] rounded-2xl z-20 flex flex-col items-center justify-center border border-blue-400/50">
                <Snowflake className="w-8 h-8 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs font-bold text-cyan-200 mt-1 uppercase tracking-wider">Card Frozen</span>
              </div>
            )}

            {/* Top row: Mastercard logo & card number */}
            <div className="flex items-center justify-between pb-6">
              {/* Mastercard interlocking circles */}
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2.5 items-center">
                  <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-95"></div>
                  <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-95"></div>
                </div>
                <span className="text-[11px] font-medium tracking-wide text-gray-300">Master Card</span>
              </div>

              {/* Card number formatted like screenshot: 3745 6987 4096 3960 */}
              <div className="font-mono text-xs text-gray-300 tracking-wider font-semibold">
                {user.cardNumber}
              </div>
            </div>

            {/* Chip & NFC symbol */}
            <div className="flex items-center justify-between pt-2 pb-1">
              <div className="w-7 h-5 rounded-sm bg-gradient-to-r from-amber-200 to-amber-400 opacity-80 flex items-center justify-center border border-amber-500/30">
                <div className="w-4 h-2.5 border border-amber-700/40 rounded-xs"></div>
              </div>
              <span className="text-[10px] text-gray-400 font-mono uppercase">{user.cardHolder}</span>
            </div>
          </div>

          {/* Bottom Card Pocket Info: Limit Card & Eye Toggle */}
          <div className="flex items-center justify-between pt-4 px-1">
            <div>
              <div className="text-[11px] font-medium text-gray-400">Limit Card</div>
              <div className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
                <span>{showLimit ? formattedLimit : '••••••••'}</span>
                <button
                  type="button"
                  onClick={() => setShowLimit(!showLimit)}
                  className="text-gray-400 hover:text-white transition p-0.5"
                  title="Toggle Limit Visibility"
                >
                  {showLimit ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Quick Freeze Status Indicator */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onToggleFreeze}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition flex items-center space-x-1 ${
                  user.cardFrozen 
                    ? 'bg-blue-900/60 text-cyan-200 border-cyan-400/40' 
                    : 'bg-white/10 text-gray-300 border-white/15 hover:bg-white/20'
                }`}
              >
                {user.cardFrozen ? <Lock className="w-3 h-3 text-cyan-300" /> : <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                <span>{user.cardFrozen ? 'Unfreeze' : 'Active'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
