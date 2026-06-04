import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedPriceProps {
  value: number;
  children: React.ReactNode;
  className?: string;
  duration?: number;
  respectReducedMotion?: boolean;
}

/**
 * AnimatedPrice component that smoothly transitions price values
 * with a fade and slight scale animation.
 * 
 * Respects prefers-reduced-motion for accessibility.
 */
export function AnimatedPrice({
  value,
  children,
  className = "",
  duration = 0.4,
  respectReducedMotion = true,
}: AnimatedPriceProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    if (!respectReducedMotion) return;
    
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [respectReducedMotion]);

  if (prefersReducedMotion) {
    // No animation for users who prefer reduced motion
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      key={`price-${value}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
