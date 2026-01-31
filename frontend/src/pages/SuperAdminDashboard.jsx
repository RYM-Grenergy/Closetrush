import React from "react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, color }) => (
    <div className="bg-[#1a1a1d] p-6 rounded-2xl border border-white/5">
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
);

export default function SuperAdminDashboard() {
    const [stats, setStats] = React.useState(null);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/stats/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.log("Using fallback stats");
            }
        };
        fetchStats();
    }, []);

    const data = stats || {
        totalUsers: 12403,
        activeListings: 8200,
        monthlyRevenue: 45290,
        pendingReports: 12,
        recentTransactions: [
            { id: 202391, item: "Cyberpunk Jacket", price: 15, status: "Completed" },
            { id: 202392, item: "Vintage Hoodie", price: 8, status: "Pending" },
            { id: 202393, item: "Silver Skirt", price: 12, status: "Completed" },
            { id: 202394, item: "Neon Crop Top", price: 6, status: "Completed" },
            { id: 202395, item: "Platform Boots", price: 20, status: "Completed" },
        ]
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0f0f11] border-r border-white/10 p-6 flex flex-col gap-6 fixed h-full">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500">
                    SuperAdmin
                </div>

                <nav className="flex flex-col gap-2">
                    {['Overview', 'User Management', 'All Listings', 'Financials', 'Settings'].map((item, i) => (
                        <button key={i} className={`p-3 rounded-xl text-left font-medium transition-all ${i === 0 ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                            {item}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-10">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold">Platform Overview</h1>
                        <p className="text-gray-400">Welcome back, Supreme Commander.</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600" />
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-6 mb-10">
                    <StatCard title="Total Users" value={data.totalUsers.toLocaleString()} color="text-cyan-400" />
                    <StatCard title="Active Listings" value={data.activeListings.toLocaleString()} color="text-purple-400" />
                    <StatCard title="Monthly Revenue" value={`$${data.monthlyRevenue.toLocaleString()}`} color="text-green-400" />
                    <StatCard title="Pending Reports" value={data.pendingReports} color="text-red-400" />
                </div>

                {/* Recent Activity Table Mockup */}
                <div className="bg-[#0f0f11] rounded-3xl border border-white/5 p-8">
                    <h2 className="text-xl font-bold mb-6">Live Transactions</h2>
                    <div className="space-y-4">
                        {data.recentTransactions.map((tx, i) => (
                            <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-700" />
                                    <div>
                                        <div className="font-bold">Transaction #{tx.id || 202390 + i}</div>
                                        <div className="text-sm text-gray-400">Rental: {tx.item}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white">${tx.price.toFixed(2)}</div>
                                    <div className={`text-xs ${tx.status === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>{tx.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
