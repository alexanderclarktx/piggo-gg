import { Shader } from "pixi.js"

const vertexSrc = `
  precision mediump float;
  
  in float aFace;
  in vec2 aPosition;
  in vec3 aOffset;
  in vec3 aBary;

  in vec3 aInstancePos;
  in vec3 aInstanceColor;

  uniform vec2 uResolution;
  uniform vec2 uCamera;
  uniform float uZoom;

  out float vFace;
  out vec3 vInstancePos;
  out vec3 vInstanceColor;
  out vec3 vWorldPos;
  out vec3 vBary;
  out vec3 vOffset;

  void main() {
    vec2 pos2d = vec2(aInstancePos.x, aInstancePos.y - aInstancePos.z);

    vec2 worldPos = aPosition + pos2d - vec2(0, 12);
    vec2 screenPos = (worldPos - uCamera) * uZoom;

    vec2 clip = (screenPos / uResolution) * 2.0;
    clip.y *= -1.0;

    gl_Position = vec4(clip.x, clip.y, 0, 1);

    vFace = aFace;
    vInstancePos = aInstancePos;
    vInstanceColor = aInstanceColor;
    vBary = aBary;
    vOffset = aOffset;

    vWorldPos = aInstancePos + aOffset;
  }
`

const fragmentSrc = `
  precision mediump float;

  in float vFace;
  in vec3 vInstancePos;
  in vec3 vInstanceColor;
  in vec3 vWorldPos;
  in vec3 vBary;
  in vec3 vOffset;

  uniform vec3[1] uTopBlocks;
  uniform float uTime;
  uniform vec3 uPlayer;
  uniform vec4 uHighlight;

  out vec4 fragColor;

  float shadeUnderPlayer(vec3 p) {
    if (uPlayer.x == 0.0 && uPlayer.y == 0.0 && uPlayer.z == 0.0) return 0.0;

    float zDist = p.z - uPlayer.z;
    if (zDist > 0.0) return 0.0;

    float dist = length(vec2(p.x - uPlayer.x, (p.y - uPlayer.y) * 2.0));
    if (dist > 10.0) return 0.0;

    float factor = abs(zDist) / 400.0 + 0.6;

    if (dist > 8.0) {
      factor += (dist - 8.0) / 4.0;
    }

    return factor;
  }

  vec3 unpackRGB(float hex) {
    float r = floor(mod(hex / 65536.0, 256.0)) / 255.0;
    float g = floor(mod(hex / 256.0, 256.0)) / 255.0;
    float b = mod(hex, 256.0) / 255.0;
    return vec3(r, g, b);
  }

  void main() {
    int face = int(vFace + 0.5);

    vec3 color;

    if (vInstancePos.x == uHighlight.x &&
        vInstancePos.y == uHighlight.y &&
        vInstancePos.z == uHighlight.z &&
        face == int(uHighlight.w + 0.5)
    ) {
      if (face == 0) {
        bool isEdge = vBary.x < 0.02 || vBary.y < 0.02 || vBary.z < 0.02;
        bool isCenter = abs(vOffset.x) < 0.4 && abs(vOffset.y) < 8.6;

        if (!isCenter && isEdge) {
          fragColor = vec4(0.0, 0.0, 0.3, 1.0);
          return;
        }
      } else {

        bool isCenter = abs(vOffset.x) < 0.4;
        bool isSide = abs(vOffset.x) > 17.6;
        bool isTop = abs(vOffset.z) > 20.6;
        bool isBottom = abs(vOffset.z) < 0.4;

        if (isCenter || isSide || isTop || isBottom) {
          fragColor = vec4(0.0, 0.0, 0.3, 1.0);
          return;
        }
      }
    }

    if (face == 0) {
      color = unpackRGB(vInstanceColor[0]);
      if (mod(vInstancePos.z, 42.0) == 0.0) {
        if (vInstanceColor[0] == 577536.0) {
          color.y *= 0.9;
          color.z = 0.3;
        } else if (vInstanceColor[0] == 9145227.0) {
          color.x = 0.6;
          color.y = 0.6;
        }
      }
    } else if (face == 1) {
      color = unpackRGB(vInstanceColor[1]);
    } else if (face == 2) {
      color = unpackRGB(vInstanceColor[2]);
    }

    float shade = shadeUnderPlayer(vWorldPos);
    if (shade > 0.0) {
      color *= min(0.9, shade);
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
        uPlayer: { value: [0, 0, 0], type: 'vec3<f32>' }, // just used for player shadow
        uResolution: { value: [window.innerWidth, window.innerWidth], type: 'vec2<f32>' },
        uZoom: { value: 2.0, type: 'f32' },
        uTopBlocks: { value: [], type: 'vec3<f32>' },
        uTime: { value: 0, type: 'f32' },
        uHighlight: { value: [0, 0, 0, 0], type: 'vec4<f32>' },
      }
    }
  })

  // @ts-expect-error
  shader.glProgram.vertex = "#version 300 es\n" + vertexSrc

  // @ts-expect-error
  shader.glProgram.fragment = "#version 300 es\n" + fragmentSrc

  return shader
}
