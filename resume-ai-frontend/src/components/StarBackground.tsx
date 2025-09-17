import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Star {
  id: number;
  size: number;
  x: number;
  y: number;
  opacity: number;
  twinkleDuration: number;
}

const NUM_STARS = 150;

const StarBackground: React.FC<{ darkMode: boolean }> = ({ darkMode }) => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generatedStars: Star[] = [];
    for (let i = 0; i < NUM_STARS; i++) {
      generatedStars.push({
        id: i,
        size: Math.random() * 2 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleDuration: Math.random() * 3 + 2,
      });
    }
    setStars(generatedStars);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Background changes with darkMode */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          darkMode
            ? "bg-gradient-to-b from-black via-gray-900 to-gray-800"
            : "bg-gradient-to-b from-white via-gray-100 to-gray-200"
        }`}
      />
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className={`absolute rounded-full ${
            darkMode ? "bg-white" : "bg-black"
          }`}
          style={{
            width: star.size,
            height: star.size,
            top: `${star.y}%`,
            left: `${star.x}%`,
            opacity: star.opacity,
          }}
          animate={{
            opacity: [star.opacity, star.opacity + 0.3, star.opacity],
          }}
          transition={{
            duration: star.twinkleDuration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default StarBackground;
