import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { motion, AnimatePresence } from "framer-motion";
import config from '../config';

export default function ExplorePage() {
    const [selectedCategory, setSelectedCategory] = useState("ALL DROPS");

    const catMap = {
        'ALL DROPS': 'All',
        'ARCHIVE': 'ARCHIVE',
        'Y2K': 'Y2K',
        'STREETWEAR': 'STREETWEAR',
        'ACCESSORIES': 'ACCESSORIES'
    };

    const backendCat = catMap[selectedCategory] || 'All';
    const apiUrl = `${config.API_URL}/products${backendCat !== 'All' ? `?category=${backendCat}` : ''}`;
    const { products, loading, error } = useProducts(apiUrl);

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500 selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                        <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Real-time feed</span>
                        <span className="text-[10px] text-zinc-700 mx-1">•</span>
                        <span className="text-[10px] font-bold text-zinc-400">{products.length} Active Listings</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase text-white mb-8">
                            EXPLORE <span className="text-orange-600">HEAT.</span>
                        </h1>
                    </motion.div>

                    {/* Filters */}
                    <div className="flex flex-wrap justify-center gap-3 mb-12">
                        {Object.keys(catMap).map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedCategory(tag)}
                                className={`px-6 py-3 border text-[10px] font-black uppercase tracking-[0.2em] transition-all transform hover:scale-105 active:scale-95 ${selectedCategory === tag ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent text-zinc-500 border-white/10 hover:border-white hover:text-white'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feed Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-12 h-12 border-2 border-white/5 border-t-orange-600 rounded-full animate-spin" />
                        <div className="text-[10px] font-black tracking-[0.5em] text-zinc-600 animate-pulse">SYNCING FEED...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-32 font-black text-red-500 tracking-widest uppercase border border-red-500/20 bg-red-500/5 rounded-3xl">
                        ERROR LOADING FEED
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-32 border border-white/5 bg-white/[0.02] rounded-3xl">
                        <div className="text-4xl mb-4 opacity-20">📦</div>
                        <div className="text-[10px] font-black tracking-[0.4em] text-zinc-700 uppercase">No drops found in this sector.</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {products.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={item._id}
                                >
                                    <Link to={`/product/${item._id}`} className="group block">
                                        <div className="bg-[#08080a] border border-white/5 group-hover:border-orange-600/50 transition-all duration-500 relative overflow-hidden rounded-sm">
                                            {/* Image Layer */}
                                            <div className="aspect-square relative overflow-hidden bg-zinc-900">
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full bg-gradient-to-br ${item.bgClass || 'from-zinc-900 to-black'} opacity-40`} />
                                                )}

                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                                {/* Rented Overlay */}
                                                {item.status !== 'active' && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                                        <span className="text-xl font-black italic text-white/20 uppercase tracking-widest -rotate-12 border-4 border-white/20 p-4">RENTED OUT</span>
                                                    </div>
                                                )}

                                                {/* Price Badge */}
                                                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 text-[10px] font-black text-white tracking-tighter">
                                                    {item.status === 'active' ? (
                                                        <><span className="text-orange-600 mr-1">₹</span>{item.price}/DAY</>
                                                    ) : (
                                                        <span className="text-red-500">RENTED OUT</span>
                                                    )}
                                                </div>

                                                {/* Condition Tag */}
                                                <div className="absolute top-4 left-4">
                                                    <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest bg-white/5 backdrop-blur px-2 py-1 border border-white/5">
                                                        {item.condition || 'VINTAGE'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Info Layer */}
                                            <div className="p-8">
                                                <div className="mb-6">
                                                    <h3 className="text-3xl font-black italic uppercase leading-none tracking-tighter group-hover:text-orange-500 transition-colors">
                                                        {item.name}
                                                    </h3>
                                                </div>

                                                <div className="flex justify-between items-end border-t border-white/5 pt-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-zinc-600">
                                                            {(item.owner || 'S')[0]}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Seller</span>
                                                            <span className="text-xs font-black text-zinc-300">@{item.owner}</span>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.3em] block mb-1">Status</span>
                                                        <span className={`text-[10px] font-black uppercase ${item.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {item.status === 'active' ? 'ACTIVE' : 'RENTED'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hover Interaction Overlay */}
                                            <div className="absolute bottom-0 left-0 h-1 bg-orange-600 w-0 group-hover:w-full transition-all duration-500" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Visual Decor */}
                <div className="fixed bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
