import { Shader } from "pixi.js"

const vertexSrc = `
  precision mediump float;

  in vec2 aPosition;
  in vec3 aUV;
  in float aFace;

  in vec2 aInstance;
  in vec3 aInstanceColor;

  uniform vec2 uResolution;
  uniform vec2 uCamera;
  uniform float uZoom;

  out float vFace;
  out vec3 vUV;
  out vec3 vInstanceColor;

  void main() {
    vec2 worldPos = aPosition + aInstance - vec2(0, 12);
    vec2 screenPos = (worldPos - uCamera) * uZoom;

    vec2 clip = (screenPos / uResolution) * 2.0;
    clip.y *= -1.0;

    gl_Position = vec4(clip.x, clip.y, 0, 1);

    vFace = aFace;
    vInstanceColor = aInstanceColor;
    vUV = aUV;
  }
`

const fragmentSrc = `
  precision mediump float;

  in vec3 vUV;
  in float vFace;
  in vec3 vInstanceColor;

  out vec4 fragColor;

  vec3 unpackRGB(float hex) {
    float r = floor(mod(hex / 65536.0, 256.0)) / 255.0;
    float g = floor(mod(hex / 256.0, 256.0)) / 255.0;
    float b = mod(hex, 256.0) / 255.0;
    return vec3(r, g, b);
  }

  void main() {
    int face = int(vFace + 0.5);

    vec3 color;

    if (face == 0) {
      color = unpackRGB(vInstanceColor[0]);
    } else if (face == 1) {
      color = unpackRGB(vInstanceColor[1]);
    } else if (face == 2) {
      color = unpackRGB(vInstanceColor[2]);
    }

    fragColor = vec4(color, 1.0);
  }
`

export const BlockShader = (): Shader => {
  const shader = Shader.from({
    gl: {
      vertex: vertexSrc,
      fragment: fragmentSrc
    },
    resources: {
      uniforms: {
        uCamera: { value: [0, 0], type: 'vec2<f32>' },
        uResolution: { value: [window.innerWidth, window.innerWidth], type: 'vec2<f32>' },
        uZoom: { value: 2.0, type: 'f32' }
      }
    }
  })

  // @ts-expect-error
  shader.glProgram.vertex = "#version 300 es\n" + vertexSrc
  // @ts-expect-error
  shader.glProgram.fragment = "#version 300 es\n" + fragmentSrc

  return shader
}
