import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Discover, SavedItems, BuyerRentals, PurchaseHistory,
    SellerWardrobe, SellerRentals, SellerEarnings, Messages
} from "../components/DashboardViews";

const BUYER_MENU = [
    {
        label: 'Discover', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        ), component: <Discover />
    },
    {
        label: 'Saved Items', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        ), component: <SavedItems />
    },
    {
        label: 'My Rentals', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        ), component: <BuyerRentals />
    },
    {
        label: 'Purchase History', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ), component: <PurchaseHistory />
    }
];

const SELLER_MENU = [
    {
        label: 'My Wardrobe', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
        ), component: <SellerWardrobe />
    },
    {
        label: 'Active Rentals', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        ), component: <SellerRentals />
    },
    {
        label: 'Earnings', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ), component: <SellerEarnings />
    },
    {
        label: 'Messages', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        ), component: <Messages />
    }
];

export default function UserDashboard() {
    const [mode, setMode] = useState("buying"); // 'buying' or 'selling'
    const [activeTab, setActiveTab] = useState(0);
    const [isSeller, setIsSeller] = useState(false); // OPTIONAL SELLER MODE

    // Reset tab when switching modes to avoid index overflow or confusion
    const toggleMode = (newMode) => {
        setMode(newMode);
        setActiveTab(0);
    };

    const activateSellerMode = () => {
        setIsSeller(true);
        toggleMode('selling');
    };

    const currentMenu = mode === 'buying' ? BUYER_MENU : SELLER_MENU;
    const ActiveComponent = currentMenu[activeTab].component;

    return (
        <div className="min-h-screen bg-[#020617] text-white flex">
            {/* Sidebar */}
            <aside className="w-72 bg-[#0f0f11] border-r border-white/10 p-6 flex flex-col gap-8 fixed h-full z-20 font-sans">
                <div className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-tr from-white to-gray-500 mb-2">
                    CLOSETRUSH
                </div>

                {/* View Switcher - ONLY SHOW IF USER IS A SELLER */}
                {isSeller ? (
                    <div className="p-1.5 bg-black border border-white/10 rounded-lg flex relative h-14 items-center">
                        <motion.div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-md border ${mode === 'buying' ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-green-500 bg-green-900/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]'} z-0`}
                            animate={{ left: mode === 'buying' ? '6px' : 'calc(50%)' }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        <button
                            onClick={() => toggleMode('buying')}
                            className={`flex-1 relative z-10 h-full flex items-center justify-center text-xs font-black uppercase tracking-widest transition-colors ${mode === 'buying' ? 'text-cyan-400' : 'text-gray-500 hover:text-white'}`}
                        >
                            Buying
                        </button>
                        <button
                            onClick={() => toggleMode('selling')}
                            className={`flex-1 relative z-10 h-full flex items-center justify-center text-xs font-black uppercase tracking-widest transition-colors ${mode === 'selling' ? 'text-green-400' : 'text-gray-500 hover:text-white'}`}
                        >
                            Selling
                        </button>
                    </div>
                ) : (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-gray-900 to-black border border-white/10 text-center">
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">Account Status</div>
                        <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Shopper</div>
                    </div>
                )}

                <div>
                    <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-4 pl-2">
                        {mode === 'buying' ? 'Main Menu' : 'Seller Tools'}
                    </div>

                    <nav className="flex flex-col gap-2">
                        {currentMenu.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`group p-4 rounded-lg text-left font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-4 relative overflow-hidden ${activeTab === i ? 'text-white border border-white/20 bg-white/5' : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                            >
                                {activeTab === i && (
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${mode === 'buying' ? 'bg-cyan-500' : 'bg-green-500'}`} />
                                )}
                                <span className={`transition-colors ${activeTab === i ? (mode === 'buying' ? 'text-cyan-400' : 'text-green-400') : 'text-gray-600 group-hover:text-white'}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {!isSeller && (
                    <button
                        onClick={activateSellerMode}
                        className="mt-auto w-full py-4 border border-white/20 hover:border-green-400 hover:bg-green-400/10 hover:text-green-400 font-black uppercase tracking-widest text-xs transition-all text-white group"
                    >
                        + Become a Seller
                    </button>
                )}

                {isSeller && mode === 'selling' && (
                    <button className="mt-auto w-full py-4 border border-white/20 hover:border-green-400 hover:bg-green-400/10 hover:text-green-400 font-black uppercase tracking-widest text-xs transition-all text-white">
                        + List New Item
                    </button>
                )}
            </aside>

            {/* Main Content */}
            <main className="ml-72 flex-1 p-10 bg-[#020617] relative flex flex-col min-h-screen">
                {/* Background ambient glow */}
                <div className={`fixed top-0 right-0 w-[500px] h-[500px] blur-[150px] pointer-events-none rounded-full transition-colors duration-1000 ${mode === 'buying' ? 'bg-cyan-600/10' : 'bg-green-600/10'}`} />

                <header className="flex justify-between items-center mb-10 relative z-10">
                    <div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter transition-all">
                            {currentMenu[activeTab].label}
                        </h1>
                        <p className="text-gray-400 text-sm font-mono tracking-wide mt-1">
                            {mode === 'buying' ? '/// FIND YOUR NEXT FIT.' : '/// MANAGE YOUR EMPIRE.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <div className="font-bold uppercase tracking-wider text-sm">Alex Chen</div>
                            <div className="text-[10px] font-mono text-cyan-400 uppercase">Verified {isSeller ? 'Seller' : 'Shopper'}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-stone-800 border-2 border-white/10" />
                    </div>
                </header>

                <div className="relative z-10 flex-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode + activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {ActiveComponent}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

