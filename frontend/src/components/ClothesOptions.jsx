import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const TiltCard = ({ item }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXVal = e.clientX - rect.left;
    const mouseYVal = e.clientY - rect.top;
    const xPct = mouseXVal / width - 0.5;
    const yPct = mouseYVal / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative h-[420px] w-full rounded-3xl bg-white/5 border border-white/10 p-4 transition-colors hover:border-white/30 group"
    >
      <div
        style={{ transform: "translateZ(50px)" }}
        className="absolute inset-4 flex flex-col justify-between pointer-events-none"
      >
        {/* Top Tags */}
        <div className="flex justify-between items-start z-10">
          <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold text-white border border-white/10 shadow-lg">
            {item.tag || item.category}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-gray-300 bg-black/40 px-2 py-1 rounded-full">
            <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {item.distance}
          </span>
        </div>

        {/* Bottom details */}
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-white leading-tight group-hover:text-cyan-300 transition-colors">{item.name}</h3>
              <div className="text-xs text-gray-400 mt-1">@{item.owner}</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">${item.price}</div>
              <div className="text-[10px] text-gray-400">{item.period || '/day'}</div>
            </div>
          </div>

          <button
            disabled={!item.available}
            className={`w-full mt-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${item.available ? 'bg-white text-black hover:bg-cyan-300 active:scale-95' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            {item.available ? 'Rent Now' : 'Rented Out'}
            {item.available && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
          </button>
        </div>
      </div>

      {/* Image Background */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.bgClass} opacity-80 group-hover:opacity-100 transition-opacity`}
      />
      {!item.available && (
        <div className="absolute inset-0 bg-black/60 z-0 rounded-3xl" />
      )}
    </motion.div>
  );
};

export default function ClothesOptions() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fetch from backend
    const fetchProducts = async () => {
      try {
        // In a real environment, you'd use the actual API URL
        // const res = await fetch('http://localhost:5000/api/products');
        // const data = await res.json();

        // For demo without active backend connection, simulating API response
        // This ensures the site works immediately for the user
        const fallbackData = [
          {
            _id: 1,
            name: "Oversized Vintage Hoodie",
            tag: "Casual",
            price: 8,
            period: "/day",
            owner: "Ava",
            distance: "0.2 mi",
            bgClass: "from-pink-500 via-red-500 to-yellow-500",
            available: true,
          },
          {
            _id: 2,
            name: "Cyberpunk Bomber",
            tag: "Street",
            price: 15,
            period: "/day",
            owner: "Leo",
            distance: "0.8 mi",
            bgClass: "from-blue-400 via-indigo-500 to-purple-600",
            available: true,
          },
          {
            _id: 3,
            name: "Silver Metallic Skirt",
            tag: "Party",
            price: 12,
            period: "/day",
            owner: "Mia",
            distance: "Nearby",
            bgClass: "from-gray-200 via-gray-400 to-gray-600",
            available: false,
          },
          {
            _id: 4,
            name: "Neon Green Crop Top",
            tag: "Festival",
            price: 6,
            period: "/day",
            owner: "Zoe",
            distance: "1.2 mi",
            bgClass: "from-green-300 via-emerald-500 to-teal-600",
            available: true,
          }
        ];

        // Check if backend is actually reachable, else use fallback
        try {
          const res = await fetch('http://localhost:5000/api/products', { signal: AbortSignal.timeout(1000) });
          if (res.ok) {
            const data = await res.json();
            if (data.length > 0) {
              setProducts(data);
              return;
            }
          }
        } catch (e) {
          // console.log("Backend not reachable, utilizing local data");
        }

        setProducts(fallbackData);

      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section id="shop" className="py-32 relative overflow-visible">

      {/* Background Decor */}
      <div className="absolute right-0 top-1/3 w-[500px] h-[500px] bg-pink-600/10 blur-[120px] -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-widest text-pink-400 uppercase border border-pink-500/30 rounded-full bg-pink-500/10">
              New Arrivals
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Fresh Drops <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Trending Now.</span>
            </h2>
            <p className="text-gray-400 max-w-lg text-lg">
              Curated styles from creators near you. Verified fits, instant rentals.
            </p>
          </div>

          <div className="flex gap-2">
            {['All', 'Hoodies', 'Jackets', 'Dresses', 'Accessories'].map((cat, i) => (
              <button key={i} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${i === 0 ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/10 hover:border-white hover:text-white'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((item) => (
            <div key={item._id || item.id} className="perspective-1000">
              <TiltCard item={item} />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a href="#" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-0.5">
            View all 2,403 listings
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
