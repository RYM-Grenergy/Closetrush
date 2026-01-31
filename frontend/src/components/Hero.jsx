import React from "react";
import Magnet from "./ui/Magnet";
import BlurText from "./ui/BlurText";
import CountUp from "./ui/CountUp";
import Spotlight from "./ui/Spotlight";
import { ShinyText } from "./ui/ShinyText";
import { Walker, Climber, Floater } from "./ui/InteractiveCharacters";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden text-white pt-40 pb-20">

      {/* Background Animated Blobs */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.9, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[120px] pointer-events-none z-0"
      />
      <motion.div
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none z-0"
      />

      <Spotlight className="relative w-full z-10 flex flex-col items-center" spotlightColor="rgba(255, 255, 255, 0.05)">
        <div className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-shadow cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            The fashion marketplace for everyone
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-6 relative z-20">
            {/* Walker Character patrols this area */}
            <div className="relative">
              <div className="hidden lg:block">
                <Walker />
              </div>
              <BlurText text="Wear the Trends." className="block mb-2" delay={0.1} />
            </div>

            <div className="relative inline-block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
                Own the Moment.
              </span>
              {/* Climber Character hangs off the end of this line */}
              <div className="hidden lg:block">
                <Climber />
              </div>
            </div>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-6 text-xl text-gray-400 max-w-2xl font-medium relative z-20"
          >
            ClosetRush is the peer-to-peer fashion platform where trendsetters rent, buy, and list clothes.
            Affordable, sustainable, and <ShinyText className="font-bold text-white">100% on-trend.</ShinyText>
          </motion.p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center relative z-20">
            <Magnet padding={50}>
              <div className="relative">
                <a
                  href="#rent"
                  className="relative px-10 py-5 rounded-full bg-white text-black font-bold text-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] transition-all block text-center min-w-[180px]"
                >
                  Rent Now
                </a>
                {/* Floater Character hovers near the Rent button */}
                <div className="hidden lg:block">
                  <Floater />
                </div>
              </div>
            </Magnet>

            <Magnet padding={40} disabled={false}>
              <a
                href="#list"
                className="px-10 py-5 rounded-full bg-white/5 border border-white/10 text-white font-bold text-xl backdrop-blur-md hover:bg-white/10 hover:border-white/30 transition-all block text-center min-w-[180px]"
              >
                List Item
              </a>
            </Magnet>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl border-t border-white/5 pt-10 relative z-20"
          >
            <StatItem value={500} label="Active Closets" suffix="+" />
            <StatItem value={100} label="Verified Users" suffix="%" />
            <StatItem value={25} label="Avg. Saving" prefix="$" />
            <div className="text-center group">
              <div className="text-4xl font-bold text-white font-[Space_Grotesk] group-hover:text-cyan-300 transition-colors">24/7</div>
              <div className="text-sm text-gray-400 font-medium uppercase tracking-wider mt-1">Support</div>
            </div>
          </motion.div>
        </div>
      </Spotlight>
    </div>
  );
}

function StatItem({ value, label, suffix = "", prefix = "" }) {
  return (
    <div className="text-center group cursor-default">
      <div className="text-4xl font-bold text-white font-[Space_Grotesk] group-hover:text-cyan-300 transition-colors">
        {prefix}<CountUp to={value} />{suffix}
      </div>
      <div className="text-sm text-gray-400 font-medium uppercase tracking-wider mt-1 group-hover:text-gray-200 transition-colors">
        {label}
      </div>
    </div>
  )
}
