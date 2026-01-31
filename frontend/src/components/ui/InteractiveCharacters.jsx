import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- SVG Gradients for Depth ---
const Gradients = () => (
    <svg width="0" height="0" className="absolute">
        <defs>
            <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="grad-pink" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <linearGradient id="grad-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
        </defs>
    </svg>
);

// --- Advanced SVG Characters ---

const BlobCharacter = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-lg">
        {/* Soft Shadow Body */}
        <motion.path
            d="M20 60 C20 30 80 30 80 60 C80 90 20 90 20 60 Z"
            fill="url(#grad-cyan)"
            animate={{
                d: [
                    "M20 60 C20 30 80 30 80 60 C80 90 20 90 20 60 Z",
                    "M22 62 C22 35 78 25 78 62 C78 85 22 95 22 62 Z",
                    "M20 60 C20 30 80 30 80 60 C80 90 20 90 20 60 Z"
                ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Eyes with Blink */}
        <g transform="translate(0, 0)">
            <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}>
                <circle cx="35" cy="55" r="6" fill="#0b0220" />
                <circle cx="65" cy="55" r="6" fill="#0b0220" />
                <circle cx="38" cy="52" r="2" fill="white" opacity="0.8" />
                <circle cx="68" cy="52" r="2" fill="white" opacity="0.8" />
            </motion.g>
        </g>
    </svg>
);

const SpikeyCharacter = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-lg">
        <motion.path
            d="M50 20 L60 40 L80 30 L70 50 L90 60 L70 70 L80 90 L60 80 L50 100 L40 80 L20 90 L30 70 L10 60 L30 50 L20 30 L40 40 Z"
            fill="url(#grad-pink)"
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Wide Eyes */}
        <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
            <circle cx="40" cy="55" r="5" fill="#0b0220" />
            <circle cx="60" cy="55" r="5" fill="#0b0220" />
            <circle cx="42" cy="52" r="2" fill="white" />
            <circle cx="62" cy="52" r="2" fill="white" />
        </motion.g>
    </svg>
);

const HangerCharacter = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-lg">
        <path d="M30 40 C30 20 70 20 70 40 L70 80 C70 90 30 90 30 80 Z" fill="url(#grad-purple)" />
        {/* Arm holding on - slightly animated */}
        <motion.path
            d="M50 20 L50 0"
            stroke="#7e22ce" strokeWidth="6" strokeLinecap="round"
            animate={{ d: ["M50 20 L50 0", "M50 20 L50 2", "M50 20 L50 0"] }}
            transition={{ duration: 2, repeat: Infinity }}
        />
        <circle cx="50" cy="0" r="5" fill="#7e22ce" />

        <motion.g animate={{ scaleY: [1, 1, 0.1, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 2 }}>
            <circle cx="40" cy="50" r="4" fill="#0b0220" />
            <circle cx="60" cy="50" r="4" fill="#0b0220" />
            <circle cx="42" cy="48" r="1.5" fill="white" />
            <circle cx="62" cy="48" r="1.5" fill="white" />
        </motion.g>
    </svg>
);


// --- Advanced Chat Bubble ---

const ChatBubble = ({ text, position = "top", color = "cyan" }) => {
    const themes = {
        cyan: "border-cyan-200 text-cyan-950 shadow-cyan-500/20 bg-cyan-50",
        purple: "border-purple-200 text-purple-950 shadow-purple-500/20 bg-purple-50",
        pink: "border-pink-200 text-pink-950 shadow-pink-500/20 bg-pink-50",
    };

    const themeClass = themes[color] || themes.cyan;
    const arrowColor = color === "cyan" ? "border-t-cyan-50" : color === "purple" ? "border-b-purple-50" : "border-t-pink-50";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className={`absolute ${position === "top" ? "-top-16" : "-bottom-16"} left-1/2 -translate-x-1/2 
            px-3 py-1.5 rounded-xl text-xs font-extrabold z-[9999] 
            shadow-lg border-[1.5px] ${themeClass}
            min-w-max max-w-[140px] text-center pointer-events-none leading-snug tracking-wide`}
            style={{ transformOrigin: position === "top" ? "bottom center" : "top center" }}
        >
            {text}
            {/* Triangle Tail */}
            <div className={`absolute ${position === "top" ? "top-full" : "bottom-full"} left-1/2 -translate-x-1/2 
                border-[6px] border-transparent ${position === "top" ? `border-t-${color}-50` : `border-b-${color}-50`} drop-shadow-sm`}
                style={{
                    borderTopColor: position === "top" ? (color === 'cyan' ? '#ecfeff' : color === 'purple' ? '#faf5ff' : '#fdf2f8') : 'transparent',
                    borderBottomColor: position === "bottom" ? (color === 'cyan' ? '#ecfeff' : color === 'purple' ? '#faf5ff' : '#fdf2f8') : 'transparent'
                }}
            />
        </motion.div>
    );
};


// --- Interactive Components ---

export const Walker = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [showMsg, setShowMsg] = useState(false);
    const messages = ["ClosetRush is lit! 🔥", "Sick fits only 🧢", "Why buy new? ♻️", "Daily drip 💧"];

    useEffect(() => {
        let timeouts = [];
        const loop = () => {
            const delay = Math.random() * 4000 + 4000; // 4-8s
            const t1 = setTimeout(() => {
                setShowMsg(true);
                const t2 = setTimeout(() => {
                    setShowMsg(false);
                    setMsgIndex(prev => (prev + 1) % messages.length);
                    loop();
                }, 3000);
                timeouts.push(t2);
            }, delay);
            timeouts.push(t1);
        };
        loop();
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="absolute -top-16 left-0 w-full h-16 pointer-events-none z-50">
            <Gradients />
            <motion.div
                className="absolute w-14 h-14"
                animate={{
                    x: ["5%", "90%", "5%"],
                    y: [0, -8, 0, -8, 0],
                    rotate: [0, 5, 0, -5, 0]
                }}
                transition={{
                    x: { duration: 20, ease: "linear", repeat: Infinity },
                    y: { duration: 0.6, repeat: Infinity, ease: "circOut" }, // Bouncy walk
                    rotate: { duration: 0.6, repeat: Infinity }
                }}
            >
                <BlobCharacter />
                <AnimatePresence mode="wait">
                    {showMsg && <ChatBubble key="walker-chat" text={messages[msgIndex]} position="top" color="cyan" />}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export const Climber = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [showMsg, setShowMsg] = useState(false);
    const messages = ["Hanging out... 🤙", "Need a jacket? 🧥", "Swap styles! 🔄"];

    useEffect(() => {
        let timeouts = [];
        const loop = () => {
            const delay = Math.random() * 5000 + 5000;
            const t1 = setTimeout(() => {
                setShowMsg(true);
                const t2 = setTimeout(() => {
                    setShowMsg(false);
                    setMsgIndex(prev => (prev + 1) % messages.length);
                    loop();
                }, 2500);
                timeouts.push(t2);
            }, delay);
            timeouts.push(t1);
        };
        loop();
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="absolute -right-6 -top-2 w-14 h-14 z-40 pointer-events-none">
            <motion.div
                className="w-full h-full origin-top"
                animate={{ rotate: [8, -8, 8] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <HangerCharacter />
                <AnimatePresence mode="wait">
                    {showMsg && <ChatBubble key="climber-chat" text={messages[msgIndex]} position="bottom" color="purple" />}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

export const Floater = () => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [showMsg, setShowMsg] = useState(false);
    const messages = ["Choices everywhere! 👗", "Verified ✅", "Save $$ 💸"];

    useEffect(() => {
        let timeouts = [];
        const loop = () => {
            const delay = Math.random() * 6000 + 4000;
            const t1 = setTimeout(() => {
                setShowMsg(true);
                const t2 = setTimeout(() => {
                    setShowMsg(false);
                    setMsgIndex(prev => (prev + 1) % messages.length);
                    loop();
                }, 2500);
                timeouts.push(t2);
            }, delay);
            timeouts.push(t1);
        };
        loop();
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <motion.div
            className="absolute -left-20 bottom-0 w-12 h-12 pointer-events-none z-40"
            animate={{
                y: [0, -25, 0],
                x: [0, 8, 0],
                rotate: [0, 10, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
            <SpikeyCharacter />
            <AnimatePresence mode="wait">
                {showMsg && <ChatBubble key="floater-chat" text={messages[msgIndex]} position="top" color="pink" />}
            </AnimatePresence>
        </motion.div>
    );
}
