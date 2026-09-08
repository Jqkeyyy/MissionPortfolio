import { useFrame } from '@react-three/fiber';
import { useSimulationState } from '@/hooks/useSimulationState';

export const SimulationClock = () => {
  useFrame((_state, deltaSeconds) => {
    useSimulationState.getState().advance(deltaSeconds);
  });

  return null;
};
