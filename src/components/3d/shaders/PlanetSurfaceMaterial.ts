import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlanetSurface } from '@/data/planets';

export const SURFACE_TYPES: Record<PlanetSurface, number> = {
  cratered: 0,
  banded: 1,
  earthlike: 2,
  venusAtmo: 3,
};

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform float uSeed;
  uniform float uSurfaceType;

  float hash13(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise3(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(
        mix(hash13(i + vec3(0.0, 0.0, 0.0)), hash13(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 0.0)), hash13(i + vec3(1.0, 1.0, 0.0)), f.x),
        f.y
      ),
      mix(
        mix(hash13(i + vec3(0.0, 0.0, 1.0)), hash13(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash13(i + vec3(0.0, 1.0, 1.0)), hash13(i + vec3(1.0, 1.0, 1.0)), f.x),
        f.y
      ),
      f.z
    );
  }

  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise3(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec3 p = normalize(vPosition) * 3.0 + uSeed;
    vec3 color = uBaseColor;

    if (uSurfaceType < 0.5) {
      float n = fbm(p * 2.0);
      float craters = smoothstep(0.35, 0.55, fbm(p * 5.0 + 10.0));
      color = mix(uBaseColor, uAccentColor, n);
      color = mix(color, color * 0.6, craters);
    } else if (uSurfaceType < 1.5) {
      float bandNoise = fbm(vec3(p.x * 0.6, p.y * 3.0 + uTime * 0.03, p.z * 0.6));
      float bands = sin((vPosition.y + bandNoise * 0.6) * 6.0);
      float bandMix = smoothstep(-0.2, 0.2, bands);
      color = mix(uBaseColor, uAccentColor, bandMix);
    } else if (uSurfaceType < 2.5) {
      float land = smoothstep(0.42, 0.5, fbm(p * 1.8));
      color = mix(uBaseColor, uAccentColor, land);
      vec3 cp = normalize(vPosition) * 2.5 + vec3(uTime * 0.02, 0.0, 0.0);
      float clouds = smoothstep(0.55, 0.7, fbm(cp * 3.0));
      color = mix(color, vec3(1.0), clouds * 0.8);
    } else {
      vec3 hp = p * 1.5 + vec3(uTime * 0.015, uTime * 0.01, 0.0);
      float haze = fbm(hp * 2.5);
      color = mix(uBaseColor, uAccentColor, haze);
    }

    float lightDot = max(dot(normalize(vNormal), normalize(vec3(0.6, 0.5, 0.7))), 0.0);
    vec3 lit = color * (0.35 + 0.65 * lightDot);

    gl_FragColor = vec4(lit, 1.0);
  }
`;

export const PlanetSurfaceMaterial = shaderMaterial(
  {
    uTime: 0,
    uBaseColor: new THREE.Color('#888888'),
    uAccentColor: new THREE.Color('#444444'),
    uSeed: 0,
    uSurfaceType: 0,
  },
  vertexShader,
  fragmentShader
) as unknown as new () => THREE.ShaderMaterial & {
  uTime: number;
  uBaseColor: THREE.Color;
  uAccentColor: THREE.Color;
  uSeed: number;
  uSurfaceType: number;
};

extend({ PlanetSurfaceMaterial });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      planetSurfaceMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        ref?: React.Ref<InstanceType<typeof PlanetSurfaceMaterial>>;
        uTime?: number;
        uBaseColor?: THREE.Color;
        uAccentColor?: THREE.Color;
        uSeed?: number;
        uSurfaceType?: number;
      };
    }
  }
}
