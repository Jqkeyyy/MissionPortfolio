import { useEffect, useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  getEventHorizonGeometryBudget,
  sampleEventHorizonMotion,
  type EventHorizonQuality,
} from './eventHorizonMath';

const ACCRETION_DISK_VERTEX_SHADER = /* glsl */ `
  varying vec2 vDiskPosition;

  void main() {
    vDiskPosition = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ACCRETION_DISK_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uHotColor;
  uniform vec3 uCoolColor;
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;
  uniform float uOpacity;
  varying vec2 vDiskPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    float radius = length(vDiskPosition);
    float angle = atan(vDiskPosition.y, vDiskPosition.x);
    float normalizedRadius = (radius - uInnerRadius) / (uOuterRadius - uInnerRadius);
    float edgeFade = smoothstep(0.0, 0.12, normalizedRadius)
      * (1.0 - smoothstep(0.72, 1.0, normalizedRadius));
    float spiral = sin(angle * 7.0 - normalizedRadius * 24.0 - uTime * 2.2) * 0.5 + 0.5;
    float filaments = sin(normalizedRadius * 92.0 + angle * 3.0 + uTime * 1.1) * 0.5 + 0.5;
    float grain = hash(floor(vDiskPosition * 18.0) + floor(uTime * 2.0));
    float heat = clamp((1.0 - normalizedRadius) * 0.75 + spiral * 0.3, 0.0, 1.0);
    vec3 color = mix(uCoolColor, uHotColor, heat);
    float alpha = edgeFade * (0.25 + spiral * 0.46 + filaments * 0.17 + grain * 0.08) * uOpacity;

    gl_FragColor = vec4(color, alpha);
  }
`;

export interface EventHorizonProps {
  position?: [number, number, number];
  radius?: number;
  quality?: EventHorizonQuality;
  decorativeMotion?: boolean;
  reducedMotion?: boolean;
  disabled?: boolean;
  label?: string;
  description?: string;
  ariaLabel?: string;
  onActivate?: () => void;
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * A procedural endgame anomaly for placement inside an existing R3F Canvas.
 * The parent owns unlock state and navigation; activating this object only calls
 * `onActivate`, allowing the destination/transition to remain app-specific.
 */
export const EventHorizon = ({
  position = [0, 15, -72],
  radius = 2.6,
  quality = 'balanced',
  decorativeMotion = true,
  reducedMotion = false,
  disabled = false,
  label = 'EVENT HORIZON',
  description = 'Unknown destination',
  ariaLabel = 'Enter the event horizon',
  onActivate,
  onHoverChange,
}: EventHorizonProps) => {
  const rootRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const counterDiskRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const diskMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const counterDiskMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const [pointerHovered, setPointerHovered] = useState(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const hovered = pointerHovered || keyboardFocused;
  const motionEnabled = decorativeMotion && !reducedMotion;
  const geometry = getEventHorizonGeometryBudget(quality);
  const innerRadius = radius * 1.08;
  const outerRadius = radius * 2.75;

  const primaryUniforms = useMemo(() => ({
    uHotColor: { value: new THREE.Color('#fff1b8') },
    uCoolColor: { value: new THREE.Color('#ff5a1f') },
    uTime: { value: 0 },
    uInnerRadius: { value: innerRadius },
    uOuterRadius: { value: outerRadius },
    uOpacity: { value: 0.94 },
  }), [innerRadius, outerRadius]);

  const secondaryUniforms = useMemo(() => ({
    uHotColor: { value: new THREE.Color('#d7f7ff') },
    uCoolColor: { value: new THREE.Color('#7357ff') },
    uTime: { value: 0 },
    uInnerRadius: { value: innerRadius * 1.02 },
    uOuterRadius: { value: outerRadius * 0.86 },
    uOpacity: { value: 0.42 },
  }), [innerRadius, outerRadius]);

  useEffect(() => () => {
    if (pointerHovered) document.body.style.cursor = 'default';
  }, [pointerHovered]);

  useEffect(() => {
    onHoverChange?.(hovered);
  }, [hovered, onHoverChange]);

  useFrame((state) => {
    const motion = sampleEventHorizonMotion(state.clock.elapsedTime, motionEnabled);

    if (rootRef.current) rootRef.current.position.y = position[1] + motion.verticalDrift;
    if (diskRef.current) diskRef.current.rotation.z = motion.diskRotation;
    if (counterDiskRef.current) counterDiskRef.current.rotation.z = motion.counterRotation;
    if (haloRef.current) haloRef.current.scale.setScalar(motion.haloPulse * (hovered ? 1.08 : 1));
    if (diskMaterialRef.current) diskMaterialRef.current.uniforms.uTime.value = motion.shaderTime;
    if (counterDiskMaterialRef.current) {
      counterDiskMaterialRef.current.uniforms.uTime.value = motion.shaderTime * -0.72;
    }
  });

  const activate = () => {
    if (!disabled) onActivate?.();
  };

  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (disabled) return;
    setPointerHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setPointerHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleMeshClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    activate();
  };

  return (
    <group ref={rootRef} position={position} name="event-horizon">
      <group scale={hovered && !disabled ? 1.04 : 1}>
        <mesh
          onClick={handleMeshClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <sphereGeometry args={[radius, geometry.coreSegments, geometry.coreSegments]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        <mesh ref={haloRef}>
          <torusGeometry args={[radius * 1.08, radius * 0.08, 8, geometry.haloSegments]} />
          <meshBasicMaterial
            color="#dffaff"
            transparent
            opacity={hovered ? 0.95 : 0.72}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <mesh ref={diskRef} rotation={[Math.PI / 2.55, 0, 0]}>
          <ringGeometry args={[innerRadius, outerRadius, geometry.diskSegments]} />
          <shaderMaterial
            ref={diskMaterialRef}
            uniforms={primaryUniforms}
            vertexShader={ACCRETION_DISK_VERTEX_SHADER}
            fragmentShader={ACCRETION_DISK_FRAGMENT_SHADER}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh ref={counterDiskRef} rotation={[Math.PI / 2.15, 0.13, 0]}>
          <ringGeometry args={[innerRadius * 1.02, outerRadius * 0.86, geometry.diskSegments]} />
          <shaderMaterial
            ref={counterDiskMaterialRef}
            uniforms={secondaryUniforms}
            vertexShader={ACCRETION_DISK_VERTEX_SHADER}
            fragmentShader={ACCRETION_DISK_FRAGMENT_SHADER}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {quality !== 'low' && (
          <pointLight
            color="#7766ff"
            intensity={hovered ? 2.2 : 1.1}
            distance={radius * 11}
            decay={2}
          />
        )}
      </group>

      <Html
        position={[0, radius * 2.15, 0]}
        center
        style={{ pointerEvents: 'auto', whiteSpace: 'nowrap' }}
      >
        <button
          type="button"
          data-testid="event-horizon-control"
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={activate}
          onFocus={() => setKeyboardFocused(true)}
          onBlur={() => setKeyboardFocused(false)}
          style={{
            appearance: 'none',
            border: `1px solid ${hovered ? '#dffaff' : 'rgba(167, 139, 250, 0.65)'}`,
            borderRadius: 2,
            background: 'rgba(3, 7, 18, 0.82)',
            color: disabled ? '#64748b' : '#f8fafc',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '0.16em',
            padding: '7px 11px',
            textAlign: 'left',
            textTransform: 'uppercase',
            boxShadow: hovered ? '0 0 18px rgba(167, 139, 250, 0.58)' : 'none',
            transition: reducedMotion ? 'none' : 'border-color 160ms ease, box-shadow 160ms ease',
          }}
        >
          <span style={{ display: 'block', fontSize: 10, fontWeight: 700 }}>{label}</span>
          <span style={{ display: 'block', color: '#a5b4fc', fontSize: 8, marginTop: 2 }}>
            {description}
          </span>
        </button>
      </Html>
    </group>
  );
};
