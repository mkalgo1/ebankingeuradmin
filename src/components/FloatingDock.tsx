import React from 'react';
import { Home, Wallet, CreditCard, PieChart, User } from 'lucide-react';

export type TabType = 'home' | 'wallet' | 'cards' | 'analytics' | 'profile';

interface FloatingDockProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'wallet' as TabType, label: 'Wallet', icon: Wallet },
    { id: 'cards' as TabType, label: 'Cards', icon: CreditCard },
    { id: 'analytics' as TabType, label: 'Stats', icon: PieChart },
    { id: 'profile' as TabType, label: 'Account', icon: User },
  ];

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="bg-[#141519] text-white rounded-full p-1.5 shadow-floating-dock border border-white/10 flex items-center space-x-1 pointer-events-auto backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-2 py-2 px-3.5 rounded-full transition-all duration-300 active:scale-95 ${
                isActive
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {isActive && (
                <span className="text-xs font-bold tracking-tight animate-fade-in">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
