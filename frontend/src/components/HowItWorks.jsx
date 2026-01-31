import React from "react";
import { motion } from "framer-motion";

const steps = [
  {
    id: "01",
    title: "Snap & List",
    desc: "Upload photos of your fit, set a price, and get it approved in seconds.",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
    color: "from-pink-500 to-rose-500"
  },
  {
    id: "02",
    title: "Share the Link",
    desc: "Post your closet link on socials or let our campus algorithm find renters.",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
    ),
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: "03",
    title: "Get Paid",
    desc: "Rental fees go straight to your wallet once the item is picked up.",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    color: "from-cyan-400 to-blue-500"
  },
  {
    id: "04",
    title: "Safe Return",
    desc: "We ensure items are returned clean and on time. No stress.",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    color: "from-green-400 to-emerald-500"
  },
];

const StepCard = ({ step, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative p-1 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 transition-all duration-300 h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 pointer-events-none" />

      <div className="relative h-full bg-[#0f172a] rounded-[22px] p-8 overflow-hidden z-10 flex flex-col items-start gap-6 border border-white/5 group-hover:border-white/20 transition-colors">

        {/* Number Watermark */}
        <div className="absolute -right-4 -top-8 text-[120px] font-black text-white/5 select-none leading-none z-0 group-hover:text-white/10 transition-colors">
          {step.id}
        </div>

        {/* Icon */}
        <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {step.icon}
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{step.title}</h3>
          <p className="text-gray-400 leading-relaxed text-lg">
            {step.desc}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how" className="py-32 bg-[#020617]/30 relative overflow-hidden">
      {/* Connecting Line (Mobile Hidden) */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden lg:block" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-bold text-cyan-300 mb-6"
          >
            Start Earning Today
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Turn your closet into <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient-x">Cash.</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-xl leading-relaxed">
            Stop letting your clothes gather dust. Join thousands of fashion lovers making money from their wardrobe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
