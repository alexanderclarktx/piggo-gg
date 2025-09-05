import { ShaderMaterial } from "three"

export const OutlineMaterial = () => new ShaderMaterial(
  {
    transparent: true,
    uniforms: {
      thickness: { value: 0.6 }
    },
    vertexShader,
    fragmentShader
  }
)

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;
  uniform float thickness;

  float edgeFactor(vec2 p){
    vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float d = min(grid.x, grid.y);
    return step(d, 1.0/thickness);
  }

  void main() {
    float edge = edgeFactor(vUv);
    vec3 c = mix(vec3(0.9, 0.9, 1.0), vec3(0), edge);
    gl_FragColor = vec4(c, edge);
  }
`
