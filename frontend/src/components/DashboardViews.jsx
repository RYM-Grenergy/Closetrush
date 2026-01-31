import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";

const MOCK_MESSAGES = [
    { id: 1, user: "sarah_xo", msg: "is this still avail strictly for weekend?", time: "2m", unread: true },
    { id: 2, user: "mike_drips", msg: "bet, shipping showing delivered.", time: "1h", unread: false },
    { id: 3, user: "jess_w", msg: "can i extend?? pls lmk", time: "1d", unread: false },
];

// --- BUYER VIEWS ---

export const Discover = () => {
    const { products, loading, error } = useProducts();

    if (loading) return <div className="p-10 text-center font-black italic text-gray-500 animate-pulse uppercase tracking-widest">Loading Feed...</div>;
    if (error) return <div className="p-10 text-center font-bold text-red-500 uppercase tracking-widest">Offline / API Error</div>;

    return (
        <div className="space-y-8 font-sans">
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <h2 className="text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600">The Feed</h2>
                <span className="font-mono text-xs text-cyan-400 blink">LIVE UPDATES</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {['LATEST DROPS', 'ARCHIVE', 'UNDER $30', 'Y2K', 'GORPCORE'].map((tag, i) => (
                    <button key={i} className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/20 border border-white/10 hover:border-cyan-400/50 text-xs font-bold tracking-widest transition-all uppercase whitespace-nowrap">
                        {tag}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((item, i) => (
                    <Link to={`/product/${item._id}`} key={i} className="group relative bg-[#0f0f11] rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] block">
                        <div className={`h-64 ${item.bgClass || 'bg-gray-800'} relative opacity-80 group-hover:opacity-100 transition-opacity`}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur border border-white/20 rounded text-xs font-bold font-mono text-cyan-400">
                                ${item.price}/DAY
                            </div>
                        </div>

                        <div className="p-5 relative -mt-12 bg-transparent z-10">
                            <div className="font-black text-lg leading-tight mb-2 uppercase italic">{item.name}</div>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Distance</span>
                                    <span className="text-xs font-bold text-gray-300">{item.distance || '0.8 MILES'}</span>
                                </div>
                                <button className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-wider hover:bg-cyan-400 hover:scale-105 transition-all">
                                    COP
                                </button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const SavedItems = () => {
    const { products } = useProducts();
    // Simulate saved items by taking a few from the feed
    const saved = products.slice(0, 3);

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">The Vault</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {saved.map((item, i) => (
                    <div key={i} className="relative bg-[#0f0f11] border border-white/10 hover:border-pink-500/50 transition-all p-4 rounded-xl flex gap-4 items-center group">
                        <div className={`w-24 h-24 ${item.bgClass || 'bg-gray-800'} rounded-lg opacity-80`} />
                        <div className="flex-1 min-w-0">
                            <div className="font-bold truncate uppercase text-sm">{item.name}</div>
                            <div className="text-gray-500 text-xs font-mono mt-1">${item.price} / DAY</div>
                            <button className="mt-3 text-xs font-bold text-pink-400 hover:text-white uppercase tracking-wider flex items-center gap-1">
                                Add to Bag <span className="text-lg leading-none">→</span>
                            </button>
                        </div>
                        <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const BuyerRentals = () => (
    <div className="space-y-8">
        <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">Current Rotation</h2>
        <div className="bg-[#0f0f11] rounded-xl border border-white/10 p-6 relative overflow-hidden group">
            {/* Abstract BG */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-purple-900/20 to-transparent pointer-events-none" />

            <div className="flex gap-6 items-start relative z-10">
                <div className="w-24 h-32 bg-stone-900 rounded-lg border border-white/5" />
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-black text-xl italic uppercase">Archive Helmut Lang Top</div>
                            <div className="text-xs font-mono text-gray-500 mt-1">ORDER ID: #8X922A</div>
                        </div>
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold tracking-widest uppercase rounded">
                            Active
                        </span>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-2">
                            <span>Time Remaining</span>
                            <span className="text-white">14H 22M</span>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-[75%] h-full" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-white/5 pt-4">
                <button className="px-6 py-2 border border-white/10 hover:bg-white hover:text-black text-xs font-bold uppercase tracking-wider transition-all">
                    Extend
                </button>
                <button className="px-6 py-2 bg-white text-black hover:bg-gray-200 text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Return Now
                </button>
            </div>
        </div>
    </div>
);

export const PurchaseHistory = () => (
    <div className="space-y-8">
        <h2 className="text-4xl font-black tracking-tighter italic uppercase text-gray-500">Receipts</h2>
        <div className="border-t-2 border-dashed border-white/10">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex justify-between items-center py-6 border-b border-white/5 hover:bg-white/5 transition-colors px-2 group cursor-pointer">
                    <div className="flex items-center gap-6">
                        <div className="font-mono text-xs text-gray-500">0{i}</div>
                        <div>
                            <div className="font-bold uppercase text-lg group-hover:text-cyan-400 transition-colors">Premium Vintage Bundle</div>
                            <div className="text-[10px] font-mono text-gray-500 mt-1">FEB {10 - i} • ID: 992-22{i}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-mono font-bold text-lg">$24.00</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 group-hover:text-green-400 transition-colors">Paid</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- SELLER VIEWS ---

export const SellerWardrobe = () => {
    const { products, loading } = useProducts();

    if (loading) return <div className="p-10 text-center font-bold animate-pulse">SYNCING INVENTORY...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end pb-4 border-b border-white/10">
                <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">Inventory</h2>
                <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center border border-white/20 hover:border-white rounded bg-white/5 text-xs transition-colors">+</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((item, i) => (
                    <div key={i} className="bg-[#0f0f11] rounded-lg border border-white/10 overflow-hidden group hover:border-white/30 transition-all">
                        <div className={`h-40 ${item.bgClass || 'bg-gray-800'} relative`}>
                            <div className={`absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur rounded text-[10px] font-mono font-bold uppercase ${item.available ? 'text-green-400' : 'text-yellow-400'}`}>
                                ● {item.available ? 'AVAILABLE' : 'RENTED'}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="font-bold uppercase text-sm truncate">{item.name}</div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                <div className="font-mono text-xs text-gray-400">${item.price}/dy</div>
                                <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                    <button className="hover:text-white transition-colors">Edit</button>
                                    <span>/</span>
                                    <button className="hover:text-red-400 transition-colors">Del</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SellerRentals = () => (
    <div className="space-y-8">
        <h2 className="text-4xl font-black tracking-tighter italic uppercase text-white">Active Moves</h2>
        <div className="space-y-3">
            {[1, 2].map((_, i) => (
                <div key={i} className="bg-[#0f0f11] p-4 rounded-xl border border-white/10 flex justify-between items-center hover:border-cyan-400/30 transition-all relative overflow-hidden">
                    <div className="absolute left-0 top-0 w-1 h-full bg-cyan-400" />
                    <div className="flex gap-4 pl-3">
                        <div className="w-12 h-12 bg-stone-800 rounded border border-white/5" />
                        <div>
                            <div className="font-bold text-white uppercase italic text-sm">Oversized Hoodie</div>
                            <div className="text-[10px] font-mono text-gray-500 mt-1">RENTER: <span className="text-cyan-400 underline">@josh_k</span></div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black uppercase text-white bg-white/10 px-2 py-1 rounded">Return Pending</div>
                        <div className="text-[10px] font-mono text-gray-500 mt-1">DUE: 04:00:00</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const SellerEarnings = () => (
    <div className="space-y-8">
        <h2 className="text-4xl font-black tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600">The Bag</h2>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0f0f11] border border-green-500/20 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl" />
                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Total Revenue</div>
                <div className="text-5xl font-black text-white font-mono tracking-tighter">$420.50</div>
                <div className="text-[10px] font-bold text-green-400 mt-2">+12% vs last week</div>
            </div>
            <div className="bg-[#0f0f11] border border-white/10 p-6 rounded-xl">
                <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Pending Payout</div>
                <div className="text-5xl font-black text-gray-400 font-mono tracking-tighter">$45.00</div>
                <div className="text-[10px] font-bold text-gray-600 mt-2">Payouts every Monday</div>
            </div>
        </div>

        {/* Graph */}
        <div className="bg-[#0f0f11] rounded-xl border border-white/10 p-6 h-64 flex items-end gap-2">
            {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-white/5 hover:bg-green-500 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300 relative group rounded-t" style={{ height: `${h}%` }}>
                </div>
            ))}
        </div>
    </div>
);

export const Messages = () => (
    <div className="h-[600px] flex bg-[#0f0f11] rounded-xl border border-white/10 overflow-hidden font-sans">
        {/* Chat List */}
        <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
            <div className="p-5 border-b border-white/10 font-black uppercase italic tracking-wider text-sm">Direct Messages</div>
            <div className="flex-1 overflow-y-auto">
                {MOCK_MESSAGES.map(msg => (
                    <div key={msg.id} className={`p-5 hover:bg-white/5 cursor-pointer border-b border-white/5 transition-colors group ${msg.unread ? 'bg-white/5 border-l-2 border-l-cyan-400' : 'border-l-2 border-l-transparent'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">@{msg.user}</span>
                            <span className="text-[10px] font-mono text-gray-600">{msg.time}</span>
                        </div>
                        <div className={`text-xs truncate ${msg.unread ? 'text-gray-300 font-bold' : 'text-gray-600'}`}>{msg.msg}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="font-bold uppercase text-sm">sarah_xo</div>
                </div>
                <button className="text-gray-500 hover:text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 space-y-2 overflow-y-auto bg-gradient-to-b from-[#0f0f11] to-[#020617]">
                <div className="flex justify-start">
                    <div className="bg-[#1a1a1d] text-gray-300 px-4 py-2 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-[60%] border border-white/5">
                        is this still avail strictly for weekend?
                    </div>
                </div>
                <div className="flex justify-end">
                    <div className="bg-cyan-600 text-black font-bold px-4 py-2 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[60%] shadow-[0_0_15px_rgba(8,145,178,0.4)]">
                        yea locked in. cop it now i'll ship tmrw
                    </div>
                </div>
                <div className="flex justify-start">
                    <div className="bg-[#1a1a1d] text-gray-300 px-4 py-2 rounded-2xl rounded-tl-none text-xs leading-relaxed max-w-[60%] border border-white/5">
                        bet sliding now
                    </div>
                </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-[#0f0f11] border-t border-white/10">
                <div className="relative">
                    <input type="text" placeholder="Send a message..." className="w-full bg-[#1a1a1d] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors uppercase placeholder:normal-case font-bold" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500 rounded hover:bg-cyan-400 text-black transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
);
