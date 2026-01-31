import { motion } from "framer-motion";

export default function BlurText({
    text,
    className = "",
    delay = 0,
    animateBy = "words", // 'words' or 'letters'
}) {
    const elements = animateBy === "words" ? text.split(" ") : text.split("");

    return (
        <span className={`inline-block ${className}`}>
            {elements.map((el, i) => (
                <motion.span
                    key={i}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 10 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.8,
                        delay: delay + i * 0.05,
                        ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    className="inline-block"
                >
                    {el}
                    {animateBy === "words" && i < elements.length - 1 && "\u00A0"}
                </motion.span>
            ))}
        </span>
    );
}
