import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import config from '../../config';

const API_URL = config.API_URL;

export default function SellerWallet() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const res = await fetch(`${API_URL}/wallet/${user._id}/summary`);
            const data = await res.json();
            setWallet(data.wallet);
            setTransactions(data.recentTransactions || []);
        } catch (err) {
            console.error('Error fetching wallet:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        if (amount > (wallet?.withdrawableBalance || 0)) {
            alert('Amount exceeds withdrawable balance');
            return;
        }

        setWithdrawing(true);
        try {
            const res = await fetch(`${API_URL}/wallet/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, amount })
            });

            if (res.ok) {
                alert('Withdrawal successful!');
                setWithdrawAmount('');
                fetchWalletData();
            } else {
                const data = await res.json();
                alert(data.message || 'Withdrawal failed');
            }
        } catch (err) {
            alert('Error processing withdrawal');
        } finally {
            setWithdrawing(false);
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'rental_earning': return 'text-green-400';
            case 'withdrawal': return 'text-red-400';
            case 'refund': return 'text-yellow-400';
            case 'damage_deduction': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'rental_earning': return 'Earning';
            case 'withdrawal': return 'Withdrawal';
            case 'refund': return 'Refund';
            case 'damage_deduction': return 'Damage';
            case 'security_deposit_hold': return 'Deposit Hold';
            case 'security_deposit_release': return 'Deposit Release';
            default: return type;
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center font-bold animate-pulse uppercase tracking-widest text-gray-500">
                Loading Wallet...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">
                Wallet
            </h2>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f0f11] border border-green-500/20 p-6 rounded-xl relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Balance</div>
                    <div className="text-4xl font-black text-white font-mono tracking-tighter">
                        ₹{(wallet?.totalBalance || 0).toFixed(2)}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0f0f11] border border-yellow-500/20 p-6 rounded-xl relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl" />
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending</div>
                    <div className="text-4xl font-black text-yellow-400 font-mono tracking-tighter">
                        ₹{(wallet?.pendingBalance || 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">Active rentals in progress</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0f0f11] border border-cyan-500/20 p-6 rounded-xl relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Withdrawable</div>
                    <div className="text-4xl font-black text-cyan-400 font-mono tracking-tighter">
                        ₹{(wallet?.withdrawableBalance || 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">Available now</div>
                </motion.div>
            </div>

            {/* Withdrawal Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0f0f11] border border-white/10 rounded-xl p-6"
            >
                <h3 className="text-lg font-bold uppercase text-white mb-4">Withdraw Funds</h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount (₹)</label>
                        <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="Enter amount"
                            max={wallet?.withdrawableBalance || 0}
                            className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                        />
                    </div>
                    <button
                        onClick={handleWithdraw}
                        disabled={withdrawing || !wallet?.withdrawableBalance}
                        className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {withdrawing ? 'Processing...' : 'Withdraw'}
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-2">
                    Withdrawals are processed within 24-48 hours to your linked bank account.
                </p>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#0f0f11] rounded-xl border border-white/10 p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold uppercase text-white">Recent Transactions</h3>
                    <span className="text-xs text-gray-500 font-mono">Last 10</span>
                </div>

                {transactions.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                        No transactions yet
                    </div>
                ) : (
                    <div className="space-y-4">
                        {transactions.map((tx, i) => (
                            <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-bold text-white text-sm flex items-center gap-2">
                                        <span className={`text-xs px-2 py-0.5 rounded ${getTypeColor(tx.type)} bg-white/5`}>
                                            {getTypeLabel(tx.type)}
                                        </span>
                                        {tx.productId?.name || tx.description}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wide mt-1">
                                        {new Date(tx.createdAt).toLocaleDateString()} • {tx.status}
                                    </div>
                                </div>
                                <div className={`font-mono font-bold text-lg ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f0f11] border border-white/10 p-4 rounded-xl">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Lifetime Earnings</div>
                    <div className="text-2xl font-black text-white font-mono">₹{(wallet?.totalEarnings || 0).toFixed(2)}</div>
                </div>
                <div className="bg-[#0f0f11] border border-white/10 p-4 rounded-xl">
                    <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Withdrawn</div>
                    <div className="text-2xl font-black text-white font-mono">₹{(wallet?.totalWithdrawn || 0).toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
}
