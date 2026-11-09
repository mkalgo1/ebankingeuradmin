import React from 'react';
import { X, Bell, CheckCheck, Tag, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onClear,
}) => {
  if (!isOpen) return null;

  const alerts = [
    {
      id: 'a1',
      icon: Tag,
      color: 'text-blue-600 bg-blue-50',
      title: 'Amazon Sale Offer Credited',
      desc: 'Promotional discount applied to your Mac mini M4 checkout.',
      time: '1h ago',
    },
    {
      id: 'a2',
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50',
      title: 'Payment Reminder: PS5 Due Jan 18',
      desc: 'Amount of $836.94 scheduled for clearance. You can settle it early anytime.',
      time: '3h ago',
    },
    {
      id: 'a3',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
      title: 'Biometric Face ID Enrolled',
      desc: 'Hardware security enclave verified for European instant transfers.',
      time: 'Yesterday',
    },
    {
      id: 'a4',
      icon: Bell,
      color: 'text-purple-600 bg-purple-50',
      title: 'Daily Card Limit Active',
      desc: 'Your today limit is running smoothly at $659.49 of $43,865.00.',
      time: 'Yesterday',
    },
    {
      id: 'a5',
      icon: FileText,
      color: 'text-gray-600 bg-gray-100',
      title: 'Monthly Statement Generated',
      desc: 'Official certified ECB e-statement available for download.',
      time: '2 days ago',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-t-[28px] sm:rounded-[28px] max-h-[80vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              <span className="text-[10px] text-gray-400">5 Unread Bank Alerts</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClear}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 flex items-center"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" />
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200/60 flex items-center justify-center text-gray-600 hover:text-black transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {alerts.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.id}
                className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start space-x-3 hover:bg-gray-50 transition"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-gray-900">{a.title}</h5>
                    <span className="text-[10px] text-gray-400">{a.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{a.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
