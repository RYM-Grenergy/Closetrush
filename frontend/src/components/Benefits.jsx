import React from "react";
import { motion } from "framer-motion";

const benefits = [
  {
    title: "Identity Verified",
    desc: "Secure ID verification. Safe, trusted community.",
    icon: (
      <svg className="w-6 h-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    colSpan: "md:col-span-1",
    bgClass: "bg-purple-900/10 border-purple-500/20 hover:border-purple-500/50"
  },
  {
    title: "Sustainability Hero",
    desc: "Reduce fashion waste. Buying new is so 2020.",
    icon: (
      <svg className="w-6 h-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    colSpan: "md:col-span-2",
    bgClass: "bg-green-900/10 border-green-500/20 hover:border-green-500/50"
  },
  {
    title: "Express Delivery",
    desc: "Same-day local meetups. No shipping delays.",
    icon: (
      <svg className="w-6 h-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    colSpan: "md:col-span-2",
    bgClass: "bg-pink-900/10 border-pink-500/20 hover:border-pink-500/50"
  },
  {
    title: "Affordable Flex",
    desc: "Wear designer brands for the price of a coffee.",
    icon: (
      <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08-.402-2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    colSpan: "md:col-span-1",
    bgClass: "bg-blue-900/10 border-blue-500/20 hover:border-blue-500/50"
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-32 relative overflow-hidden bg-[#020617]/50">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-center text-white mb-16 tracking-tight">
          Why <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">ClosetRush</span>?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group rounded-3xl p-8 border backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] ${b.colSpan} ${b.bgClass}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {b.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{b.title}</h3>
              <p className="text-gray-400 text-lg leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
