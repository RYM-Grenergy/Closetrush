import { motion } from "framer-motion";
import React from "react";

export function ShinyText({ children, className = "" }) {
    return (
        <motion.span
            className={`relative inline-block bg-clip-text text-transparent ${className}`}
            style={{
                backgroundImage:
                    "linear-gradient(120deg, rgba(255,255,255,0.4) 40%, white 50%, rgba(255,255,255,0.4) 60%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
            }}
            animate={{
                backgroundPosition: ["200% center", "-200% center"],
            }}
            transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
            }}
        >
            {children}
        </motion.span>
    );
}

export default ShinyText;
