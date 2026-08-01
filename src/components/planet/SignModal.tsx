import { motion } from 'framer-motion';
import { ContentSign as ContentSignType } from '@/data/planets';
import { X } from 'lucide-react';
import { HudCorners } from '@/components/HudCorners';
import { ScanlineReveal } from '@/components/ScanlineReveal';

interface SignModalProps {
  sign: ContentSignType;
  onClose: () => void;
}

const SignIcon = ({ type }: { type: ContentSignType['type'] }) => {
  const iconClass = "w-6 h-6";
  switch (type) {
    case 'console':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8M12 17v4" />
        </svg>
      );
    case 'tablet':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="18" x2="12" y2="18" />
        </svg>
      );
    case 'crate':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      );
  }
};

export const SignModal = ({ sign, onClose }: SignModalProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Modal */}
      <motion.div
        className="relative hud-panel rounded-lg p-6 max-w-lg w-full"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--background) / 0.95), hsl(var(--background) / 0.98))',
          boxShadow: '0 0 50px rgba(0,0,0,0.5), 0 0 0 1px hsl(var(--hud-line) / 0.3)',
        }}
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-primary">
            <SignIcon type={sign.type} />
          </div>
          <h3 className="font-heading text-xl tracking-mission text-primary">
            {sign.title}
          </h3>
        </div>

        <ScanlineReveal duration={0.4}>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {sign.content}
          </p>
        </ScanlineReveal>

        {/* Decorative elements */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-hud-line/50 to-transparent" />

        {/* Targeting frame corners */}
        <HudCorners active size="sm" />
      </motion.div>
    </motion.div>
  );
};
