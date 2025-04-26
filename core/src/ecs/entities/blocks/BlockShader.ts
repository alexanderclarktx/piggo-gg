import { Shader } from "pixi.js"

const vertexSrc = `
  precision mediump float;
  
  in float aFace;
  in vec2 aPosition;
  in vec3 aUV;
  in vec3 aOffset;

  in vec3 aInstancePos;
  in vec3 aInstanceColor;

  uniform vec2 uResolution;
  uniform vec2 uCamera;
  uniform float uZoom;

  out float vFace;
  out vec3 vUV;
  out vec3 vInstanceColor;
  out vec3 vWorldPos;

  void main() {
    vec2 pos2d = vec2(aInstancePos.x, aInstancePos.y - aInstancePos.z);

    vec2 worldPos = aPosition + pos2d - vec2(0, 12);
    vec2 screenPos = (worldPos - uCamera) * uZoom;

    vec2 clip = (screenPos / uResolution) * 2.0;
    clip.y *= -1.0;

    gl_Position = vec4(clip.x, clip.y, 0, 1);

    vFace = aFace;
    vInstanceColor = aInstanceColor;
    vUV = aUV;

    vWorldPos = aInstancePos + aOffset;    
  }
`

const fragmentSrc = `
  precision mediump float;

  in vec3 vUV;
  in float vFace;
  in vec3 vInstanceColor;

  in vec3 vWorldPos;

  uniform vec3[50] uTopBlocks;

  out vec4 fragColor;

  vec3 unpackRGB(float hex) {
    float r = floor(mod(hex / 65536.0, 256.0)) / 255.0;
    float g = floor(mod(hex / 256.0, 256.0)) / 255.0;
    float b = mod(hex, 256.0) / 255.0;
    return vec3(r, g, b);
  }

  float sdfToBlocks(vec3 p) {
    float minDist = 1e10;
    vec3 halfSize = vec3(18.0); // Assuming each block is 1x1x1

    for (int i = 0; i < 50; ++i) {
      vec3 blockPos = uTopBlocks[i];

      if (blockPos.x == 0.0 && blockPos.y == 0.0 && blockPos.z == 0.0) continue;

      vec3 d = abs(p - blockPos) - halfSize;
      float dist = length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);

      minDist = min(minDist, dist);
    }

    return minDist;
  }

  bool isInShadow(vec3 start) {
    vec3 sunDir = normalize(vec3(1.0, 0, 2.0)); // Sun direction (adjustable!)
    vec3 p = start;
    for (int i = 0; i < 32; ++i) { // max march steps
      float d = sdfToBlocks(p);
      if (d < 0.01) return true; // hit block
      if (d > 50.0) break; // escaped into space
      p += sunDir * d;
    }
    return false;
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

    // --- Raymarching for shadow ---
    bool shadowed = isInShadow(vWorldPos);

    if (shadowed) {
      color *= 0.4; // Darken if in shadow (adjust darkness factor as you like)
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
        uZoom: { value: 2.0, type: 'f32' },
        uTopBlocks: { value: [], type: 'vec3<f32>' }
      }
    }
  })

  // @ts-expect-error
  shader.glProgram.vertex = "#version 300 es\n" + vertexSrc

  // @ts-expect-error
  shader.glProgram.fragment = "#version 300 es\n" + fragmentSrc

  return shader
}
