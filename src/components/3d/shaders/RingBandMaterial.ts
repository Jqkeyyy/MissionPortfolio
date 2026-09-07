import { shaderMaterial } from '@react-three/drei/core/shaderMaterial.js';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vPos;

  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vPos;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uSeed;
  uniform float uInnerRadius;
  uniform float uOuterRadius;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  void main() {
    float r = length(vPos.xy);
    float t = clamp((r - uInnerRadius) / max(uOuterRadius - uInnerRadius, 0.0001), 0.0, 1.0);

    float bandFreq = 34.0;
    float cell = floor(t * bandFreq);
    float n = hash11(cell + uSeed);
    float wave = sin(t * bandFreq * 3.14159265 + n * 6.2831853) * 0.5 + 0.5;
    float band = smoothstep(0.15, 0.85, wave);

    vec3 color = mix(uColorA, uColorB, band);
    float edgeFade = smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.9, t);
    float alpha = mix(0.25, 0.75, band) * edgeFade;

    gl_FragColor = vec4(color, alpha);
  }
`;

export const RingBandMaterial = shaderMaterial(
  {
    uColorA: new THREE.Color('#B79B6B'),
    uColorB: new THREE.Color('#E8D4A8'),
    uSeed: 0,
    uInnerRadius: 1,
    uOuterRadius: 2,
  },
  vertexShader,
  fragmentShader
) as unknown as new () => THREE.ShaderMaterial & {
  uColorA: THREE.Color;
  uColorB: THREE.Color;
  uSeed: number;
  uInnerRadius: number;
  uOuterRadius: number;
};

extend({ RingBandMaterial });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      ringBandMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        uColorA?: THREE.Color;
        uColorB?: THREE.Color;
        uSeed?: number;
        uInnerRadius?: number;
        uOuterRadius?: number;
      };
    }
  }
}
