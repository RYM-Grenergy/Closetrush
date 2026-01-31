import React from "react";
import { motion } from "framer-motion";

// A cute little geometric mascot
const MascotSVG = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Body */}
        <motion.path
            d="M20 60 C20 30 80 30 80 60 C80 90 20 90 20 60 Z"
            fill="currentColor"
        />
        {/* Eyes */}
        <circle cx="35" cy="55" r="5" fill="black" />
        <circle cx="65" cy="55" r="5" fill="black" />
        {/* Blinking Eyelids */}
        <motion.rect
            x="30" y="50" width="10" height="10" fill="currentColor"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 4, repeatDelay: Math.random() * 5 }}
        />
        <motion.rect
            x="60" y="50" width="10" height="10" fill="currentColor"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 4, repeatDelay: Math.random() * 5 }}
        />
        {/* Legs */}
        <motion.path
            d="M35 85 L35 95"
            stroke="currentColor" strokeWidth="8" strokeLinecap="round"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
            d="M65 85 L65 95"
            stroke="currentColor" strokeWidth="8" strokeLinecap="round"
            animate={{ y: [-5, 0, -5] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        />
    </svg>
);

export function WalkingMascot() {
    return (
        <div className="absolute top-[-40px] left-0 w-full h-[60px] pointer-events-none overflow-visible z-30">
            <motion.div
                className="absolute top-0 w-10 h-10 text-cyan-300"
                initial={{ left: "10%" }}
                animate={{ left: ["10%", "40%", "10%"] }}
                transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                style={{ filter: "drop-shadow(0px 0px 5px cyan)" }}
            >
                <MascotSVG className="w-full h-full" />
                {/* Chat Bubble */}
                <motion.div
                    className="absolute -top-6 -right-8 bg-white text-black text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0] }}
                    transition={{ duration: 4, repeat: Infinity, repeatDelay: 5 }}
                >
                    Sick fit! 🔥
                </motion.div>
            </motion.div>
        </div>
    );
}

export function ClimbingMascot() {
    return (
        <div className="absolute -right-4 -top-8 w-12 h-12 pointer-events-none z-30">
            <motion.div
                className="text-pink-400 w-full h-full"
                animate={{ rotate: [0, 10, 0, -10, 0], y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0px 0px 5px hotpink)" }}
            >
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Body hanging upside downish or clinging */}
                    <path d="M30 40 C30 20 70 20 70 40 L70 70 L30 70 Z" fill="currentColor" />
                    {/* Arms holding on */}
                    <path d="M25 60 L15 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    <path d="M75 60 L85 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    {/* Eyes */}
                    <circle cx="40" cy="50" r="4" fill="black" />
                    <circle cx="60" cy="50" r="4" fill="black" />
                    <path d="M45 60 Q50 65 55 60" stroke="black" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </motion.div>
        </div>
    );
}
