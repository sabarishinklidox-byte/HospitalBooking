import React from "react";
import { motion } from "framer-motion";

export default function DocBookAnimatedTitle() {
  const text = "DocBook";

  const container = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08, 
        delayChildren: 0.3 
      },
    },
  };

  const letter = {
    hidden: { 
      opacity: 0, 
      y: 20, // Slide up instead of left for a more modern "pop"
      scale: 0.8,
      filter: "blur(8px)" 
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { 
        duration: 0.7, 
        ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for a "snap" effect
      },
    },
  };

  return (
    <>
      <style>{`
        .brandShine {
          /* Sleeker gradient: Deep Blue -> Sky Blue -> White highlight -> Deep Blue */
          background-image: linear-gradient(
            120deg,
            #003366 0%,
            #003366 40%,
            #87CEEB 50%,
            #ffffff 55%,
            #87CEEB 60%,
            #003366 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: brandShine 6s ease-in-out infinite;
        }

        @keyframes brandShine {
          0% { background-position: 150% 50%; }
          100% { background-position: -50% 50%; }
        }

        /* Subtle floating animation for the whole title */
        .float-slow {
          animation: float 5s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="flex justify-center items-center py-10">
        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none select-none float-slow"
        >
          <span className="sr-only">{text}</span>

          <motion.span aria-hidden className="brandShine">
            {text.split("").map((ch, i) => (
              <motion.span 
                key={i} 
                variants={letter} 
                className="inline-block hover:scale-110 transition-transform cursor-default"
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
        </motion.h1>
      </div>
    </>
  );
}