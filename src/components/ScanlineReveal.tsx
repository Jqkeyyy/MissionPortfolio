import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScanlineRevealProps {
  children: ReactNode;
  active?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

export const ScanlineReveal = ({
  children,
  active = true,
  delay = 0,
  duration = 0.4,
  className,
}: ScanlineRevealProps) => {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: active ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)' }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
