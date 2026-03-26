'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function ScrollReveal({ children, width = "100%", delay = 0, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref} style={{ width, overflow: 'hidden' }} className={`h-full ${className}`}>
      <motion.div
        className="h-full"
        variants={{ hidden: { opacity: 0, y: 75 }, visible: { opacity: 1, y: 0 } }}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
