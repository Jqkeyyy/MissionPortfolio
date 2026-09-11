import { useFrame } from '@react-three/fiber';
import type { GravityGunBodyDescriptor } from '@/features/endgame/gravityGun';
import { useGravityGun } from '@/features/endgame/gravityGunStore';

export interface GravityGunFrameDriverProps {
  /** Return canonical (pre-Gravity-Gun-offset) body positions for contact effects. */
  getBodies?: () => readonly GravityGunBodyDescriptor[];
}

/** Mount once inside Canvas to advance all reversible Gravity Gun trajectories. */
export const GravityGunFrameDriver = ({ getBodies }: GravityGunFrameDriverProps) => {
  useFrame((_, deltaSeconds) => {
    const gravityGun = useGravityGun.getState();
    if (Object.keys(gravityGun.motions).length === 0) return;
    gravityGun.advance(deltaSeconds, getBodies?.() ?? []);
  });

  return null;
};
