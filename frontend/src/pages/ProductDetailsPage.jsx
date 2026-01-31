import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MOCK_PRODUCTS } from "../data/mockData";

export default function ProductDetailsPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                // Fallback to mock data search
                const mockItem = MOCK_PRODUCTS.find(p => p._id === id);
                if (mockItem) {
                    setProduct(mockItem);
                    setLoading(false);
                } else {
                    setError("Item not found");
                    setLoading(false);
                }
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-black animate-pulse tracking-widest uppercase">LOADING ITEM DATA...</div>;
    if (error) return <div className="min-h-screen bg-[#020617] text-red-500 flex items-center justify-center font-bold uppercase tracking-widest">{error}</div>;

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500 selection:text-black">
            <Navbar />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="relative">
                    <div className={`aspect-[4/5] rounded-lg ${product.bgClass || 'bg-gray-800'} relative overflow-hidden group shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4">
                            <Link to="/dashboard" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-cyan-400 transition-colors">
                                ← Back to Feed
                            </Link>
                        </div>
                    </div>

                    <div className="absolute -bottom-6 -right-6 z-10 hidden md:block">
                        <div className="w-48 h-48 bg-black border border-white/10 p-4 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                            <svg className="w-full h-full text-white/20" viewBox="0 0 100 100">
                                <path id="curve" d="M 50 50 m -37 0 a 37 37 0 1 1 74 0 a 37 37 0 1 1 -74 0" fill="transparent" />
                                <text width="500" fill="white">
                                    <textPath xlinkHref="#curve" className="uppercase font-mono font-bold text-[10px] tracking-[0.2em]" fill="white">
                                        • Verified Authentic • ClosetRush • Verified Authentic • ClosetRush •
                                    </textPath>
                                </text>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col justify-center relative">
                    <div className="mb-2 flex items-center gap-3">
                        <span className="px-3 py-1 bg-white/10 border border-white/20 rounded text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                            {product.category}
                        </span>
                        <span className={`px-3 py-1 border rounded text-[10px] font-mono font-bold uppercase tracking-widest ${product.available ? 'border-green-500/50 text-green-400' : 'border-red-500/50 text-red-400'}`}>
                            {product.available ? 'Available Now' : 'Currently Rented'}
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] mb-6">
                        {product.name}
                    </h1>

                    <div className="flex items-baseline gap-4 mb-8">
                        <span className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            ${product.price}
                        </span>
                        <span className="text-xl font-black uppercase text-gray-500">/ Day</span>
                    </div>

                    <div className="space-y-6 border-t border-white/10 pt-8 mb-10">
                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                            <span className="text-gray-500">Owner</span>
                            <span className="text-white hover:text-cyan-400 transition-colors cursor-pointer">@{product.owner}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                            <span className="text-gray-500">Distance</span>
                            <span className="text-white">{product.distance}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest">
                            <span className="text-gray-500">Condition</span>
                            <span className="text-white">Like New (9/10)</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-white text-black font-black uppercase tracking-widest text-lg hover:bg-cyan-400 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                            Rent Now
                        </button>
                        <button className="px-6 py-4 border border-white/20 hover:border-white hover:bg-white/5 transition-all">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                    </div>

                    <div className="mt-8 text-xs font-mono text-gray-600 text-center uppercase tracking-widest">
                        Protected by ClosetRush Guarantee • Instant Delivery
                    </div>
                </div>
            </div>
        </div>
    );
}
