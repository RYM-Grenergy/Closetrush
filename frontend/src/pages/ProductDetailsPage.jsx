import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import config from '../config';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsInWishlist(wishlist.some(item => item._id === id));
  }, [id]);

  const toggleWishlist = () => {
    if (!product) return;
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    let newWishlist;
    if (isInWishlist) {
      newWishlist = wishlist.filter(item => item._id !== id);
    } else {
      newWishlist = [...wishlist, product];
    }
    localStorage.setItem("wishlist", JSON.stringify(newWishlist));
    setIsInWishlist(!isInWishlist);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);

    fetch(`${config.API_URL}/products/find/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Product not found");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
        return fetch(`${config.API_URL}/products`);
      })
      .then((res) => res.json())
      .then((allProducts) => {
        if (allProducts) {
          const filtered = allProducts
            .filter((p) => p._id !== id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 4);
          setRecommendations(filtered);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Item not found");
        setLoading(false);
      });
  }, [id]);

  const [duration, setDuration] = useState(6);

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-white/5 border-t-orange-600 rounded-full animate-spin" />
        <span className="text-[10px] font-black tracking-[0.5em] text-zinc-600 animate-pulse uppercase">Retrieving Archive...</span>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-black text-red-500 flex items-center justify-center font-black tracking-widest uppercase">
      {error || "Archive missing"}
    </div>
  );

  const isAvailable = product.status === 'active' || product.available;
  const totalPrice = (product.price * duration).toFixed(2);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-600 selection:text-white">
      <Navbar />

      <main className="pt-32 pb-24 px-6 max-w-[1600px] mx-auto">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link to="/explore" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            Back to feed
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-32 items-start">

          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-5 xl:col-span-5">
            <div className="flex flex-col gap-6 sticky top-32">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative aspect-[3/4] bg-zinc-900 overflow-hidden border border-white/5 rounded-2xl shadow-2xl"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${product.bgClass || 'from-zinc-800 to-black'}`} />
                )}

                {/* Badges */}
                <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
                  <span className="px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                    {product.category || 'Archive'}
                  </span>
                  {!isAvailable && (
                    <span className="px-4 py-2 bg-red-600/20 backdrop-blur-md border border-red-600/50 text-[10px] font-black uppercase tracking-widest text-red-500">
                      ⏱ Rented Out
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Feature Grid Icons Under Image */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-6 bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center">
                  <span className="text-xl mb-2">🚀</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Fast Delivery</span>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center">
                  <span className="text-xl mb-2">🛡️</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Secure Protected</span>
                </div>
                <div className="p-6 bg-zinc-900/50 border border-white/5 flex flex-col items-center text-center">
                  <span className="text-xl mb-2">✨</span>
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Clean verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-7 xl:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-10"
            >
              {/* Header */}
              <header>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Archive ID: {id.slice(-6).toUpperCase()}</span>
                </div>
                <h1 className="text-6xl xl:text-8xl font-black italic tracking-tighter uppercase leading-none mb-6">
                  {product.name}
                </h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-white/5">
                      {(product.owner || 'S')[0]}
                    </div>
                    <span className="text-xs font-bold text-zinc-400">@{product.owner}</span>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{product.distance || 'Nearby'}</span>
                  <div className="h-4 w-px bg-white/10" />
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Like New (9/10)</span>
                </div>
              </header>

              {/* Rental Module */}
              <div className="p-10 bg-zinc-900 border border-white/5 rounded-sm">
                <div className="flex justify-between items-baseline mb-12">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black">₹{product.price}</span>
                    <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">/ Hour</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-1 h-3 bg-orange-600/40 rounded-full" />
                    ))}
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="space-y-8 mb-12">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Selection Duration</span>
                    <span className="text-2xl font-black italic text-orange-500">{duration}h</span>
                  </div>
                  <div className="relative h-1 bg-zinc-800 w-full group">
                    <input
                      type="range"
                      min="6"
                      max="24"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-orange-600 transition-all duration-150"
                      style={{ width: `${((duration - 6) / 18) * 100}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-orange-600 scale-0 group-hover:scale-100 transition-transform duration-200"
                      style={{ left: `${((duration - 6) / 18) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-zinc-600 uppercase tracking-widest">
                    <span>6h MIN</span>
                    <span>24h MAX</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-white/5 mb-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Estimated Total</span>
                  <span className="text-3xl font-black italic">₹{totalPrice}</span>
                </div>

                <div className="flex flex-col gap-4">
                  {isAvailable ? (
                    <Link
                      to={`/checkout?productId=${product._id}&duration=${duration}`}
                      className="w-full py-6 bg-white text-black text-[11px] font-black uppercase tracking-[0.3em] hover:bg-orange-600 hover:text-white transition-all text-center"
                    >
                      Process Rental
                    </Link>
                  ) : (
                    <button disabled className="w-full py-6 bg-white/5 text-zinc-700 text-[11px] font-black uppercase tracking-[0.3em] cursor-not-allowed border border-white/5">
                      Archived / Rented
                    </button>
                  )}
                  <button
                    onClick={toggleWishlist}
                    className={`w-full py-4 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] transition-all ${isInWishlist ? "bg-orange-600/20 text-orange-500 border-orange-600/50" : "text-zinc-500 hover:text-white hover:border-white"
                      }`}
                  >
                    {isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  </button>
                </div>
              </div>

              {/* Specs & Info */}
              <div className="space-y-12">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6 border-b border-white/5 pb-2">Description</h3>
                  <p className="text-xs leading-loose text-zinc-400 font-medium lowercase">
                    {product.description || "NO ARCHIVE DESCRIPTION PROVIDED."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Manufacturer</h3>
                    <p className="text-sm font-black uppercase">{product.brand || 'Grails'}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Fit</h3>
                    <p className="text-sm font-black uppercase">{product.size || 'L'}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Category</h3>
                    <p className="text-sm font-black uppercase">{product.category || 'Archive'}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-4">Verified Status</h3>
                    <p className="text-sm font-black uppercase text-orange-500 italic">Authentic</p>
                  </div>
                </div>

                {/* Pricing Breakdown Dropdown Style */}
                <div className="p-8 border border-white/5 bg-zinc-900/30">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Financial Transparency</h3>
                  <div className="space-y-4 text-[10px] font-bold tracking-widest uppercase">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Hourly Rate</span>
                      <span>₹{product.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Retail Value</span>
                      <span className="line-through text-zinc-700">₹{product.retailPrice || 5000}</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t border-white/5">
                      <span className="text-orange-500 italic">Security Deposit</span>
                      <span className="text-orange-500 italic">₹{product.securityDeposit || 500}</span>
                    </div>
                  </div>
                  <p className="mt-6 text-[8px] text-zinc-700 font-bold uppercase tracking-widest text-center">Protected By ClosetRush Guarantee • 24/7 Intel</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Similar Drops */}
        <section className="mt-40">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">SIMILAR <span className="text-zinc-800">HEAT.</span></h2>
            <div className="flex-1 h-px bg-white/5" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map((item) => (
              <Link to={`/product/${item._id}`} key={item._id} className="group relative aspect-[3/4] bg-zinc-900 border border-white/5 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${item.bgClass || 'from-zinc-800 to-black'} opacity-20`} />
                )}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-[10px] font-black uppercase tracking-widest mb-1 truncate">{item.name}</h3>
                  <p className="text-[10px] font-bold text-orange-600">₹{item.price}/DAY</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
