import React, { useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export default function FloatingShapes() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = e.clientX / innerWidth - 0.5;
            const y = e.clientY / innerHeight - 0.5;
            mouseX.set(x * 100);
            mouseY.set(y * 100);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Decorative Star 1 */}
            <Shape
                x={springX}
                y={springY}
                factor={-2}
                className="top-[15%] left-[10%]"
            >
                <svg w="40" h="40" viewBox="0 0 24 24" fill="none" className="w-12 h-12 text-pink-500/20 animate-spin-slow">
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" />
                </svg>
            </Shape>

            {/* Decorative Circle/Ring */}
            <Shape
                x={springX}
                y={springY}
                factor={1.5}
                className="top-[25%] right-[15%]"
            >
                <svg width="60" height="60" viewBox="0 0 100 100" className="w-20 h-20 text-cyan-500/10">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="10 5" />
                </svg>
            </Shape>

            {/* Fashion Tag */}
            <Shape
                x={springX}
                y={springY}
                factor={3}
                className="bottom-[20%] left-[20%]"
            >
                <div className="rotate-[-12deg] bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-lg shadow-xl">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                </div>
            </Shape>

            {/* Plus Signs Grid */}
            <div className="absolute top-1/2 right-10 grid grid-cols-3 gap-4 opacity-20">
                {[...Array(9)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                    />
                ))}
            </div>
        </div>
    );
}

function Shape({ x, y, factor, children, className }) {
    const moveX = useTransform(x, (val) => val * factor);
    const moveY = useTransform(y, (val) => val * factor);

    return (
        <motion.div
            style={{ x: moveX, y: moveY }}
            className={`absolute ${className}`}
        >
            {children}
        </motion.div>
    );
}
