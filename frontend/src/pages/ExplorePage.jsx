import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import { motion } from "framer-motion";

export default function ExplorePage() {
    const { products, loading, error } = useProducts();

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500 selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block"
                    >
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-gray-500 mb-4">
                            Explore Heat
                        </h1>
                    </motion.div>
                    <p className="text-xl text-gray-400 font-mono tracking-widest uppercase">
                        Real-time feed • {products.length} Active Listings
                    </p>
                </div>

                {/* Filters */}
                <div className="flex justify-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    {['ALL DROPS', 'ARCHIVE', 'Y2K', 'STREETWEAR', 'ACCESSORIES'].map((tag, i) => (
                        <button key={i} className={`px-6 py-3 rounded-none border border-white/20 text-xs font-black uppercase tracking-[0.2em] transform transition-all hover:bg-white hover:text-black ${i === 0 ? 'bg-white text-black' : 'bg-transparent text-gray-500'}`}>
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 font-black text-2xl animate-pulse tracking-widest text-[#22d3ee]">LOADING FEED...</div>
                ) : error ? (
                    <div className="text-center py-20 font-black text-red-500 tracking-widest">ERROR LOADING FEED</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((item) => (
                            <Link to={`/product/${item._id}`} key={item._id} className="group block">
                                <div className="bg-[#0f0f11] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 relative overflow-hidden">
                                    <div className={`aspect-square ${item.bgClass || 'bg-gray-800'} relative`}>
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-white/20 px-3 py-1 text-xs font-mono font-bold text-cyan-400">
                                            ${item.price}/DAY
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-2xl font-black italic uppercase leading-none max-w-[80%]">
                                                {item.name}
                                            </h3>
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Seller</span>
                                                <span className="text-xs font-bold text-gray-300 hover:text-cyan-400 transition-colors">@{item.owner}</span>
                                            </div>
                                            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest border border-white/10 px-2 py-1 bg-white/5">
                                                {item.size || 'ONE SIZE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
