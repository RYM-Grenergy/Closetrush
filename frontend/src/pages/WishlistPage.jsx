import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setWishlist(items);
    }, []);

    const removeFromWishlist = (id) => {
        const newWishlist = wishlist.filter(item => item._id !== id);
        localStorage.setItem("wishlist", JSON.stringify(newWishlist));
        setWishlist(newWishlist);
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-600 selection:text-white">
            <Navbar />

            <main className="pt-32 pb-24 px-6 max-w-[1600px] mx-auto">
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.5em] text-zinc-500 uppercase">Personal Archive</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
                        YOUR <span className="text-orange-600">WISHLIST.</span>
                    </h1>
                </motion.header>

                {wishlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-24 border-t border-white/5 flex flex-col items-center text-center"
                    >
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.5em] mb-12">No heat found in archive</p>
                        <Link
                            to="/explore"
                            className="px-12 py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.5em] hover:bg-orange-600 hover:text-white transition-all"
                        >
                            Explore Products
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AnimatePresence mode='popLayout'>
                            {wishlist.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={item._id}
                                    className="group relative"
                                >
                                    <Link to={`/product/${item._id}`} className="block aspect-[3/4] bg-zinc-900 border border-white/5 overflow-hidden rounded-2xl relative">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${item.bgClass || 'from-zinc-800 to-black'}`} />
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black to-transparent">
                                            <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{item.category}</div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white truncate">{item.name}</h3>
                                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                                <span className="text-orange-600 text-[10px] font-black uppercase tracking-widest">₹{item.price} / HR</span>
                                            </div>
                                        </div>
                                    </Link>

                                    <button
                                        onClick={() => removeFromWishlist(item._id)}
                                        className="absolute top-6 right-6 w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
