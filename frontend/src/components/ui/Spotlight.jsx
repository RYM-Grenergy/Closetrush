import React, { useRef, useState, useEffect } from "react";

export default function Spotlight({
    children,
    className = "",
    spotlightColor = "rgba(255, 255, 255, 0.1)",
    radius = 350,
}) {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: -radius, y: -radius });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            className={`relative ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
                }}
            />
            {children}
        </div>
    );
}
