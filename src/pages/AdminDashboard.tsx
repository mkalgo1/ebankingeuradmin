import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Users, DollarSign, CreditCard, 
  Plus, Edit2, Trash2, Snowflake, CheckCircle2, XCircle, 
  RefreshCw, LogOut, ExternalLink, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { UserAccount, BankTransaction, AccountStatus, CurrencyCode } from '../types';
import { storage } from '../lib/storage';

interface AdminDashboardProps {
  onBackToClient?: () => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToClient,
  onLogout,
}) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isInjectTxnModalOpen, setIsInjectTxnModalOpen] = useState(false);

  // Balance edit state
  const [editBalanceUSD, setEditBalanceUSD] = useState('');
  const [editCardLimitUSD, setEditCardLimitUSD] = useState('');

  // Transaction inject state
  const [txnTitle, setTxnTitle] = useState('');
  const [txnSubtitle, setTxnSubtitle] = useState('');
  const [txnAmountUSD, setTxnAmountUSD] = useState('');
  const [txnType, setTxnType] = useState<'payment' | 'transfer' | 'deposit'>('deposit');
  const [txnStatus, setTxnStatus] = useState<'Paid Successfully' | 'Pending'>('Paid Successfully');

  const loadData = () => {
    setUsers(storage.getUsers());
    setTransactions(storage.getTransactions());
  };

  useEffect(() => {
    loadData();
    const unsub = storage.subscribe(loadData);
    return () => unsub();
  }, []);

  // Quick Status Toggle: verified <-> suspended
  const handleToggleStatus = (user: UserAccount) => {
    const nextStatus: AccountStatus = user.status === 'verified' ? 'suspended' : 'verified';
    const updated: UserAccount = { ...user, status: nextStatus };
    storage.updateUser(updated);
    loadData();
  };

  // Toggle Remote Card Freeze
  const handleToggleFreeze = (user: UserAccount) => {
    const updated: UserAccount = { ...user, cardFrozen: !user.cardFrozen };
    storage.updateUser(updated);
    loadData();
  };

  // Save Balance & Limits
  const handleSaveBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const newBal = parseFloat(editBalanceUSD);
    const newLimit = parseFloat(editCardLimitUSD);

    const updated: UserAccount = {
      ...selectedUser,
      totalBalanceUSD: !isNaN(newBal) ? newBal : selectedUser.totalBalanceUSD,
      cardLimitUSD: !isNaN(newLimit) ? newLimit : selectedUser.cardLimitUSD,
    };

    storage.updateUser(updated);
    setIsBalanceModalOpen(false);
    loadData();
  };

  // Inject New Transaction
  const handleInjectTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const numAmount = parseFloat(txnAmountUSD) || 0;
    const isCredit = txnType === 'deposit';
    const finalAmountUSD = isCredit ? Math.abs(numAmount) : -Math.abs(numAmount);

    const newTxn: BankTransaction = {
      id: `adm_txn_${Date.now()}`,
      userId: selectedUser.id,
      type: txnType,
      title: txnTitle.trim() || 'Admin Adjustment',
      subtitle: txnSubtitle.trim() || 'Central Clearing Directive',
      amountUSD: finalAmountUSD,
      currency: selectedUser.currency,
      status: txnStatus,
      badgeText: isCredit ? 'Admin Credit' : 'Direct Charge',
      iconType: isCredit ? 'deposit' : 'transfer',
      groupDate: 'Today',
      dateDisplay: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    // Update user balance accordingly
    const updatedUser: UserAccount = {
      ...selectedUser,
      totalBalanceUSD: selectedUser.totalBalanceUSD + finalAmountUSD
    };

    storage.updateUser(updatedUser);
    storage.addTransaction(newTxn);

    // Reset
    setTxnTitle('');
    setTxnSubtitle('');
    setTxnAmountUSD('');
    setIsInjectTxnModalOpen(false);
    loadData();
  };

  // Delete transaction
  const handleDeleteTxn = (txnId: string) => {
    const list = storage.getTransactions().filter(t => t.id !== txnId);
    localStorage.setItem('ebanking_txns_v2', JSON.stringify(list));
    loadData();
  };

  // Calculations
  const totalAUM = users.reduce((acc, u) => acc + (u.totalBalanceUSD || 0), 0);
  const totalVerified = users.filter(u => u.status === 'verified').length;
  const totalSuspended = users.filter(u => u.status === 'suspended').length;

  return (
    <div className="min-h-screen w-full bg-[#0F1115] text-white p-4 sm:p-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Executive Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">
                  ECB SUPERVISORY PORTAL
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                  LIVE REST / REALTIME
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white mt-0.5">
                European Banking Compliance & Account Control
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onBackToClient && (
              <button
                onClick={onBackToClient}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center space-x-1.5 border border-white/10"
              >
                <ExternalLink className="w-4 h-4 text-blue-400" />
                <span>Open Client Area</span>
              </button>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold transition flex items-center space-x-1 border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Metric KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#171920] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="uppercase tracking-wider font-semibold">Total Assets Managed</span>
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              ${totalAUM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
              +4.8% ECB Reserve Liquidity
            </span>
          </div>

          <div className="bg-[#171920] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="uppercase tracking-wider font-semibold">Verified Accounts</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {totalVerified} Active
            </div>
            <span className="text-[11px] text-gray-400 mt-1 inline-block">
              100% KYC / AML Verified
            </span>
          </div>

          <div className="bg-[#171920] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="uppercase tracking-wider font-semibold">Suspended Accounts</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {totalSuspended} Blocked
            </div>
            <span className="text-[11px] text-rose-400 mt-1 inline-block">
              Compliance Hold Enabled
            </span>
          </div>

          <div className="bg-[#171920] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
              <span className="uppercase tracking-wider font-semibold">Card Limits Buffer</span>
              <CreditCard className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              $43,865.00
            </div>
            <span className="text-[11px] text-purple-400 mt-1 inline-block">
              Instant Auto-Clearing Cap
            </span>
          </div>
        </div>

        {/* Client Accounts Management Table */}
        <div className="bg-[#171920] rounded-2xl p-6 border border-white/5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Registered Client Accounts</h3>
              <p className="text-xs text-gray-400">Manage account status (Verified / Suspended) and edit balances</p>
            </div>
            <button
              onClick={loadData}
              className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 flex items-center space-x-1.5 w-max"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Live Sync</span>
            </button>
          </div>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Client</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Total Balance</th>
                  <th className="pb-3 px-3">Card Limit</th>
                  <th className="pb-3 px-3">Card Number</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    {/* User info */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-white/20"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{u.fullName}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title="Click to toggle status"
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition flex items-center space-x-1 w-max ${
                          u.status === 'verified'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                      >
                        {u.status === 'verified' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Total Balance */}
                    <td className="py-3 px-3 font-mono font-bold text-white text-sm">
                      ${u.totalBalanceUSD?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Card Limit */}
                    <td className="py-3 px-3 font-mono text-gray-300">
                      ${u.cardLimitUSD?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Card Number & Freeze State */}
                    <td className="py-3 px-3 font-mono text-gray-400">
                      <div className="flex items-center space-x-2">
                        <span>{u.cardNumber}</span>
                        {u.cardFrozen && (
                          <span className="text-[9px] bg-blue-500/30 text-cyan-300 px-1.5 py-0.5 rounded-sm font-semibold uppercase">
                            Frozen
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Edit Balance & Limits */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditBalanceUSD(u.totalBalanceUSD.toString());
                            setEditCardLimitUSD(u.cardLimitUSD.toString());
                            setIsBalanceModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition"
                          title="Override Balances & Limits"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Freeze Card Remotely */}
                        <button
                          onClick={() => handleToggleFreeze(u)}
                          className={`p-1.5 rounded-lg transition ${
                            u.cardFrozen
                              ? 'bg-cyan-500/30 text-cyan-300 hover:bg-cyan-500/50'
                              : 'bg-white/5 hover:bg-white/10 text-gray-400'
                          }`}
                          title={u.cardFrozen ? 'Unfreeze Card' : 'Freeze Card'}
                        >
                          <Snowflake className="w-4 h-4" />
                        </button>

                        {/* Inject Transaction */}
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsInjectTxnModalOpen(true);
                          }}
                          className="py-1 px-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-[11px] transition flex items-center space-x-1"
                          title="Add / Inject Transaction"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Txn</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Transactions Audit Log */}
        <div className="bg-[#171920] rounded-2xl p-6 border border-white/5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Recent Financial Transactions</h3>
              <p className="text-xs text-gray-400">Live ledger of purchases, transfers, and clearance events</p>
            </div>
            <span className="text-xs font-mono text-gray-400 font-bold">
              {transactions.length} Total Records
            </span>
          </div>

          <div className="overflow-x-auto pt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-3">Title / Merchant</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.slice(0, 10).map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white">{t.title}</div>
                      <div className="text-[11px] text-gray-400">{t.subtitle}</div>
                    </td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-gray-400">
                      {t.type}
                    </td>
                    <td className={`py-2.5 px-3 font-mono font-bold ${
                      t.amountUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {t.amountUSD >= 0 ? `+$${Math.abs(t.amountUSD).toFixed(2)}` : `-$${Math.abs(t.amountUSD).toFixed(2)}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Paid Successfully' 
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-[11px]">
                      {t.dateDisplay}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteTxn(t.id)}
                        className="text-gray-500 hover:text-rose-400 p-1 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Override Balance & Limits */}
      {isBalanceModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-[#181A20] text-white rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-base font-bold pb-2 border-b border-white/10">
              Override Balances: {selectedUser.fullName}
            </h3>
            <form onSubmit={handleSaveBalance} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase">Total Balance (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editBalanceUSD}
                  onChange={(e) => setEditBalanceUSD(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-mono font-bold text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase">Card Spending Limit (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editCardLimitUSD}
                  onChange={(e) => setEditCardLimitUSD(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-mono font-bold text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Save Overrides
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Inject Custom Transaction */}
      {isInjectTxnModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-[#181A20] text-white rounded-2xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-base font-bold pb-2 border-b border-white/10">
              Inject Transaction for {selectedUser.fullName}
            </h3>
            <form onSubmit={handleInjectTxn} className="space-y-3.5 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase">Type</label>
                  <select
                    value={txnType}
                    onChange={(e) => setTxnType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="deposit">Credit (+) Deposit</option>
                    <option value="payment">Debit (-) Purchase</option>
                    <option value="transfer">Transfer Out (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-1 font-semibold uppercase">Status</label>
                  <select
                    value={txnStatus}
                    onChange={(e) => setTxnStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-semibold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Paid Successfully">Paid Successfully</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase">Title / Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UBS Wire Transfer or Hermes Paris"
                  value={txnTitle}
                  onChange={(e) => setTxnTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase">Subtitle / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Special Clearance or Corporate Dividend"
                  value={txnSubtitle}
                  onChange={(e) => setTxnSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="5000.00"
                  value={txnAmountUSD}
                  onChange={(e) => setTxnAmountUSD(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white font-mono font-bold text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsInjectTxnModalOpen(false)}
                  className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Inject Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
