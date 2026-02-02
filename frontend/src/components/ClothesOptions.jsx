import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import config from '../config';

const TiltCard = ({ item }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-8deg", "8deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const isAvailable = item.status === 'active' || item.available;

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="relative h-[340px] w-full rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden group"
    >
      {/* Image */}
      <div className="absolute inset-0 z-0">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${item.bgClass || 'from-zinc-800 to-black'}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Price Tag */}
      <div className="absolute top-3 left-3 z-20">
        <div className="px-2 py-1 bg-black/80 backdrop-blur-md rounded border border-white/10">
          <span className="text-[10px] font-black tracking-tighter text-white">₹{item.price}/DAY</span>
        </div>
      </div>

      {/* Rented Status */}
      {!isAvailable && (
        <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
          <span className="text-[10px] font-black tracking-[0.2em] text-white/50 border border-white/20 px-3 py-1 uppercase">Rented Out</span>
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="text-sm font-black text-white leading-none mb-1 truncate">{item.name}</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-bold text-gray-400 border border-white/5">
              {(item.owner || 'U')[0]}
            </div>
            <span className="text-[10px] font-medium text-gray-400">@{item.owner}</span>
          </div>
          <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{item.distance}</span>
        </div>

        <button
          disabled={!isAvailable}
          className={`w-full mt-3 py-2 rounded font-black text-[10px] tracking-widest uppercase transition-all ${isAvailable ? 'bg-white text-black hover:bg-orange-500 hover:text-white' : 'bg-transparent text-gray-700 border border-white/5'}`}
        >
          {isAvailable ? 'Rent Now' : 'Closed'}
        </button>
      </div>
    </motion.div>
  );
};

export default function ClothesOptions() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL DROPS');
  const [loading, setLoading] = useState(true);

  const categories = ['ALL DROPS', 'ARCHIVE', 'Y2K', 'STREETWEAR', 'ACCESSORIES'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const catMap = { 'ALL DROPS': 'All', 'ARCHIVE': 'Dresses', 'Y2K': 'Casual', 'STREETWEAR': 'Jackets', 'ACCESSORIES': 'Accessories' };
        const backendCat = catMap[selectedCategory] || 'All';
        const res = await fetch(`${config.API_URL}/products${backendCat !== 'All' ? `?category=${backendCat}` : ''}`);
        if (res.ok) setProducts(await res.json());
      } catch (error) {
        console.error("Fetch failed", error);
        setProducts([]);
      } finally { setLoading(false); }
    };
    fetchProducts();
  }, [selectedCategory]);

  return (
    <section id="shop" className="py-24 relative bg-[#050505]">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase">Real-time feed</span>
              <span className="text-[10px] text-zinc-800">•</span>
              <span className="text-[10px] font-bold text-zinc-500">{products.length} Active Listings</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none">
              EXPLORE <span className="text-orange-600">HEAT.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-4 border-b border-white/5 pb-4 md:pb-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`text-[11px] font-black tracking-[0.2em] transition-all uppercase ${selectedCategory === cat ? 'text-white border-b-2 border-white pb-2' : 'text-zinc-600 hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
            {products.map((item) => <TiltCard key={item._id} item={item} />)}
          </div>
        )}

        <div className="mt-20 border-t border-white/5 pt-10 text-center">
          <a href="/explore" className="text-[10px] font-black tracking-[0.5em] text-zinc-600 hover:text-white transition-all uppercase">View all collections</a>
        </div>
      </div>
    </section>
  );
}
