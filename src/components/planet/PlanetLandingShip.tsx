import { RefObject, useCallback, useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { PlanetData } from '@/data/planets';

interface PlanetLandingShipProps {
  planet: PlanetData;
  targetRef: RefObject<HTMLSpanElement>;
}

interface LandingPoint {
  x: number;
  y: number;
  width: number;
}

interface ContinuousLandingMotionProps {
  planet: PlanetData;
  landingPoint: LandingPoint;
  reducedMotion: boolean;
}

const getShipWidth = () => Math.min(260, Math.max(160, window.innerWidth * 0.2));

const cubicBezierPoint = (start: number, controlA: number, controlB: number, end: number, progress: number) => {
  const inverse = 1 - progress;
  return (
    inverse ** 3 * start
    + 3 * inverse ** 2 * progress * controlA
    + 3 * inverse * progress ** 2 * controlB
    + progress ** 3 * end
  );
};

const ContinuousLandingMotion = ({
  planet,
  landingPoint,
  reducedMotion,
}: ContinuousLandingMotionProps) => {
  const [landed, setLanded] = useState(false);
  const progress = useMotionValue(0);
  const shipHeight = landingPoint.width * (427 / 640);

  const destinationX = landingPoint.x + landingPoint.width * 0.5;
  const destinationY = landingPoint.y + shipHeight * 0.72;
  const startX = window.innerWidth + landingPoint.width * 0.45;
  const startY = -landingPoint.width * 0.32;
  const controlAX = window.innerWidth * 0.88;
  const controlAY = window.innerHeight * 0.03;
  const controlBX = destinationX + Math.max(
    landingPoint.width * 1.15,
    (startX - destinationX) * 0.22,
  );
  const controlBY = destinationY - Math.max(
    landingPoint.width * 0.82,
    window.innerHeight * 0.24,
  );

  const x = useTransform(progress, (value) => (
    cubicBezierPoint(startX, controlAX, controlBX, destinationX, value) - landingPoint.width * 0.5
  ));
  const y = useTransform(progress, (value) => (
    cubicBezierPoint(startY, controlAY, controlBY, destinationY, value) - shipHeight * 0.72
  ));
  const scale = useTransform(progress, [0, 1], [0.48, 0.88]);
  const rotate = useTransform(progress, [0, 1], [8, 0]);
  const opacity = useTransform(progress, (value) => Math.min(1, value * 12));

  useEffect(() => {
    progress.set(0);
    setLanded(false);

    const playback = animate(progress, 1, {
      duration: reducedMotion ? 0.45 : 4.4,
      ease: reducedMotion ? 'easeOut' : [0.16, 0.72, 0.18, 1],
      onComplete: () => setLanded(true),
    });

    return () => playback.stop();
  }, [progress, reducedMotion]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9] overflow-hidden"
      data-planet-landing={planet.id}
      data-landing-state={landed ? 'landed' : 'descending'}
      aria-hidden="true"
    >
      {!reducedMotion && (
        <>
          <motion.div
            className="absolute h-7 rounded-[50%] border border-amber-200/65"
            style={{
              left: landingPoint.x + landingPoint.width * 0.12,
              top: landingPoint.y + landingPoint.width * 0.57,
              width: landingPoint.width * 0.78,
              boxShadow: `0 0 22px ${planet.color}35`,
            }}
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: [0, 0.72, 0], scale: [0.35, 1, 1.45] }}
            transition={{ delay: 3.55, duration: 1.15, times: [0, 0.45, 1], ease: 'easeOut' }}
          />
          <motion.div
            className="absolute h-10 rounded-[50%] bg-gradient-to-r from-transparent via-amber-100/25 to-transparent blur-md"
            style={{
              left: landingPoint.x + landingPoint.width * 0.04,
              top: landingPoint.y + landingPoint.width * 0.5,
              width: landingPoint.width * 0.94,
            }}
            initial={{ opacity: 0, scaleX: 0.35 }}
            animate={{ opacity: [0, 0.7, 0], scaleX: [0.35, 1.25, 1.6] }}
            transition={{ delay: 3.55, duration: 1.2, times: [0, 0.45, 1], ease: 'easeOut' }}
          />
        </>
      )}

      <motion.div
        className="absolute left-0 top-0"
        style={{ width: landingPoint.width, x, y, scale, rotate, opacity }}
      >
        <div
          className="relative"
          data-flight-facing="left"
          style={{ transform: 'scaleX(-1)' }}
        >
          <motion.span
            className="ship-engine-glow absolute left-[1%] top-[42%] h-[18%] w-[32%] -translate-x-1/2 rounded-full"
            animate={{ opacity: landed ? 0 : [0.55, 1, 0.6] }}
            transition={{ duration: landed ? 0.35 : 0.55, repeat: landed ? 0 : Infinity }}
          />
          <img
            src="/mission-shuttle.png"
            alt=""
            draggable={false}
            decoding="async"
            className="relative block h-auto w-full select-none drop-shadow-[0_16px_16px_rgba(0,0,0,0.55)]"
          />
        </div>
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-5 -translate-x-1/2 rounded border border-primary/30 bg-background/70 px-4 py-2 font-mono text-[10px] tracking-mission text-primary backdrop-blur-sm"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: landed ? 0 : [0, 1, 1], y: 0 }}
        transition={{ duration: landed ? 0.4 : 0.8 }}
      >
        CONTINUOUS DESCENT • {planet.displayName.toUpperCase()}
      </motion.div>
    </div>
  );
};

export const PlanetLandingShip = ({ planet, targetRef }: PlanetLandingShipProps) => {
  const reducedMotion = Boolean(useReducedMotion());
  const [landingPoint, setLandingPoint] = useState<LandingPoint | null>(null);

  const measureLandingTarget = useCallback(() => {
    const target = targetRef.current;
    if (!target) return;

    const targetRect = target.getBoundingClientRect();
    const width = getShipWidth();
    const shipHeight = width * (427 / 640);

    setLandingPoint({
      x: targetRect.left - width * 0.5,
      y: targetRect.top - shipHeight * 0.72,
      width,
    });
  }, [targetRef]);

  useEffect(() => {
    const settleTimer = window.setTimeout(measureLandingTarget, 1350);
    window.addEventListener('resize', measureLandingTarget);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('resize', measureLandingTarget);
    };
  }, [measureLandingTarget]);

  if (!landingPoint) return null;

  return (
    <ContinuousLandingMotion
      planet={planet}
      landingPoint={landingPoint}
      reducedMotion={reducedMotion}
    />
  );
};
