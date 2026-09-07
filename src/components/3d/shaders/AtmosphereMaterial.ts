import { shaderMaterial } from '@react-three/drei/core/shaderMaterial.js';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  uniform vec3 uColor;
  uniform float uIntensity;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 3.0);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

export const AtmosphereMaterial = shaderMaterial(
  {
    uColor: new THREE.Color('#4B7BE5'),
    uIntensity: 1.0,
  },
  vertexShader,
  fragmentShader
) as unknown as new () => THREE.ShaderMaterial & {
  uColor: THREE.Color;
  uIntensity: number;
};

extend({ AtmosphereMaterial });

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      atmosphereMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        uColor?: THREE.Color;
        uIntensity?: number;
      };
    }
  }
}
