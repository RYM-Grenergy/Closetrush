import { useRef, useLayoutEffect, useState } from "react";

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export default function CountUp({
    to,
    duration = 2,
    separator = ",",
    decimals = 0,
}) {
    const [count, setCount] = useState(0);
    const elementRef = useRef(null);
    const frameRef = useRef(0);
    const startTimeRef = useRef(null);
    const hasAnimated = useRef(false);

    useLayoutEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const animate = (time) => {
                        if (!startTimeRef.current) startTimeRef.current = time;
                        const progress = (time - startTimeRef.current) / (duration * 1000);

                        if (progress < 1) {
                            setCount(to * easeOutExpo(progress));
                            frameRef.current = requestAnimationFrame(animate);
                        } else {
                            setCount(to);
                        }
                    };
                    frameRef.current = requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) observer.observe(elementRef.current);

        return () => {
            cancelAnimationFrame(frameRef.current);
            observer.disconnect();
        }
    }, [to, duration]);

    const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(count);

    return <span ref={elementRef}>{formatted}</span>;
}
