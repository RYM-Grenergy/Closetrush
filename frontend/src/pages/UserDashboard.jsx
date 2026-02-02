import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    BuyerRentals, PurchaseHistory,
    SellerWardrobe, SellerRentals, SellerEarnings, Messages, AccountSettings
} from "../components/DashboardViews";
import SellerWallet from "../components/seller/SellerWallet";
import SellerChat from "../components/seller/SellerChat";
import AddProductModal from "../components/AddProductModal";
import BecomeSellerModal from "../components/BecomeSellerModal";
import Footer from "../components/Footer";

import config from '../config';

const API_URL = config.API_URL;

const BUYER_MENU = [
    { label: 'My Rentals', component: <BuyerRentals /> },
    { label: 'History', component: <PurchaseHistory /> },
    { label: 'Settings', component: <AccountSettings /> }
];

export default function UserDashboard() {
    const [mode, setMode] = useState("buying");
    const [activeTab, setActiveTab] = useState(0);

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [isSeller, setIsSeller] = useState(false);
    const [sellerStatus, setSellerStatus] = useState(null);
    const [canList, setCanList] = useState(false);
    const [listingRequirements, setListingRequirements] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showSellerModal, setShowSellerModal] = useState(false);

    // Refresh user data on mount
    useEffect(() => {
        if (user._id) {
            refreshUserData();
        }
    }, []);

    const refreshUserData = async () => {
        try {
            const res = await fetch(`${API_URL}/users/${user._id}`);
            if (res.ok) {
                const updatedUser = await res.json();
                const newUserData = { ...user, ...updatedUser };
                setUser(newUserData);
                localStorage.setItem('user', JSON.stringify(newUserData));
                setIsSeller(!!updatedUser.isSeller && updatedUser.sellerStatus === 'approved');
                setSellerStatus(updatedUser.sellerStatus);
            }
        } catch (err) {
            console.error('Error refreshing user data:', err);
            // Fallback to localStorage data
            setIsSeller(!!user.isSeller && user.sellerStatus === 'approved');
            setSellerStatus(user.sellerStatus);
        }
    };

    // Build seller menu dynamically
    const SELLER_MENU = [
        { label: 'Inventory', component: <SellerWardrobe /> },
        { label: 'Active Rentals', component: <SellerRentals /> },
        { label: 'Wallet', component: <SellerWallet /> },
        { label: 'Messages', component: <SellerChat /> },
        { label: 'Settings', component: <AccountSettings /> }
    ];

    // Check listing eligibility
    useEffect(() => {
        if (user._id && isSeller) {
            checkCanList();
        }
    }, [user._id, isSeller]);

    const checkCanList = async () => {
        try {
            const res = await fetch(`${API_URL}/users/${user._id}/can-list`);
            const data = await res.json();
            setCanList(data.canList);
            setListingRequirements(data.requirements);
        } catch (err) {
            console.error('Error checking listing eligibility:', err);
        }
    };

    const toggleMode = (newMode) => {
        setMode(newMode);
        setActiveTab(0);
    };

    const handleSellerSuccess = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSellerStatus(updatedUser.sellerStatus);

        // Only set as seller if actually approved
        if (updatedUser.isSeller && updatedUser.sellerStatus === 'approved') {
            setIsSeller(true);
            toggleMode('selling');
        }
    };

    const currentMenu = mode === 'buying' ? BUYER_MENU : SELLER_MENU;
    const ActiveComponent = currentMenu[activeTab]?.component;

    const renderVerificationBanner = () => {
        if (!isSeller || mode !== 'selling' || canList) return null;

        return (
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
            >
                <div className="flex items-start gap-4">
                    <div className="text-orange-400 text-2xl">⚠</div>
                    <div className="flex-1">
                        <h3 className="font-bold text-orange-400 mb-1">Complete Your Verification</h3>
                        <p className="text-sm text-gray-400 mb-3">
                            You need to complete the following before listing products:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {listingRequirements && !listingRequirements.isAadhaarVerified && (
                                <Link
                                    to="/verify-aadhaar"
                                    className="px-4 py-2 bg-orange-500 text-black text-xs font-bold uppercase rounded-lg hover:bg-orange-400 transition-colors"
                                >
                                    Verify Aadhaar →
                                </Link>
                            )}
                            {listingRequirements && listingRequirements.sellerStatus !== 'approved' && (
                                <span className="px-4 py-2 bg-white/10 text-gray-400 text-xs font-bold uppercase rounded-lg">
                                    Seller Status: {listingRequirements.sellerStatus}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderAadhaarStatus = () => {
        if (!isSeller || mode !== 'selling') return null;

        const status = listingRequirements?.aadhaarVerificationStatus;
        if (!status || status === 'verified') return null;

        const statusConfig = {
            not_submitted: { color: 'gray', text: 'Aadhaar Not Submitted' },
            pending: { color: 'yellow', text: 'Aadhaar Pending Verification' },
            rejected: { color: 'red', text: 'Aadhaar Rejected' }
        };

        const config = statusConfig[status] || statusConfig.not_submitted;

        return (
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-${config.color}-500/20 text-${config.color}-400 border border-${config.color}-500/30`}>
                <span className={`w-2 h-2 rounded-full bg-${config.color}-400 ${status === 'pending' ? 'animate-pulse' : ''}`}></span>
                {config.text}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
            <Navbar />

            {/* Header / Sub-Nav Section */}
            <div className="pt-28 pb-4 bg-[#0f0f11] border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-2xl font-black text-white uppercase shadow-lg">
                                    {(user.username || 'U').charAt(0)}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none">
                                        Hi, {user.username || 'Guest'}
                                    </h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">
                                            {mode === 'buying' ? 'Member • Shopper' : 'Verified Seller • Boss'}
                                        </p>
                                        {renderAadhaarStatus()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mode Switcher */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                            <button
                                onClick={() => toggleMode('buying')}
                                className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${mode === 'buying' ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'text-gray-500 hover:text-white'}`}
                            >
                                <span className="hidden sm:inline">Buyer</span> Mode
                            </button>
                            {isSeller ? (
                                <button
                                    onClick={() => toggleMode('selling')}
                                    className={`px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${mode === 'selling' ? 'bg-green-500/20 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <span className="hidden sm:inline">Seller</span> Mode
                                </button>
                            ) : sellerStatus === 'pending' ? (
                                <button
                                    onClick={() => setShowSellerModal(true)}
                                    className="px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2"
                                >
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                    <span className="hidden sm:inline">Seller</span> Pending
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSellerModal(true)}
                                    className="px-6 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all text-gray-500 hover:text-green-400 hover:bg-green-500/10"
                                >
                                    Become Seller
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Horizontal Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1">
                        {currentMenu.map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(i)}
                                className={`px-6 py-3 rounded-t-lg font-bold text-xs uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${activeTab === i
                                    ? (mode === 'buying' ? 'border-cyan-500 text-white bg-white/5' : 'border-green-500 text-white bg-white/5')
                                    : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 bg-[#020617] relative">
                <div className="bg-gradient-to-b from-[#0f0f11] to-transparent h-20 absolute inset-x-0 top-0 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 transition-all">
                    {/* Verification Banner */}
                    {renderVerificationBanner()}

                    {/* Action Bar for Sellers */}
                    {isSeller && mode === 'selling' && (
                        <div className="mb-8 flex justify-end">
                            <button
                                onClick={() => setShowAddModal(true)}
                                disabled={!canList}
                                className={`px-8 py-3 font-black uppercase tracking-widest text-xs transition-all hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)] ${canList
                                    ? 'bg-white text-black hover:bg-green-400'
                                    : 'bg-gray-700 text-gray-400 cursor-not-allowed hover:scale-100'
                                    }`}
                                title={!canList ? 'Complete verification to list products' : ''}
                            >
                                + List New Item
                            </button>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode + activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {ActiveComponent}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Modals */}
            <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
            <BecomeSellerModal
                isOpen={showSellerModal}
                onClose={() => setShowSellerModal(false)}
                onSuccess={handleSellerSuccess}
            />

            {Footer ? <Footer /> : (
                <footer className="py-12 border-t border-white/10 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
                    ClosetRush © 2026 • Build Your Empire
                </footer>
            )}
        </div>
    );
}
