import { Shader } from "pixi.js"

const vertex = `
  precision mediump float;

  in vec2 aPosition;
  in vec3 aOffset;
  in vec3 aInstancePos;

  uniform mat4 uModelViewProjection;

  out float vDepth;

  void main() {
    vec4 worldPosition = vec4(aInstancePos + aOffset + vec3(aPosition, 0.0), 1.0);
    vec4 clipPosition = uModelViewProjection * worldPosition;

    gl_Position = clipPosition;

    // vDepth = clipPosition.z / clipPosition.w; // NDC depth

    // gl_Position = vec4(aPosition / 1000.0, 0.0, 1.0);
  }
`

const fragment = `
  precision mediump float;

  // in float vDepth;

  out vec4 fragColor;

  // These should match the values used in your ortho projection matrix
  // uniform float uNear;
  // uniform float uFar;

  void main() {
    // Convert linear depth to [0, 1] range
    // float normalizedDepth = (vDepth - uNear) / (uFar - uNear);

    // Clamp to be safe (optional)
    // normalizedDepth = clamp(normalizedDepth, 0.0, 1.0);

    // Store depth in red channel
    // fragColor = vec4(normalizedDepth, 0.0, 0.0, 1.0);
    fragColor = vec4(1.0, 0.0, 1.0, 1.0);
  }
`

export const SunShader = (): Shader => {
  const shader = Shader.from({
    gl: { vertex, fragment },
    resources: {
      uniforms: {
        uModelViewProjection: { type: "mat4x4<f32>", value: null }
      }
    }
  })

  // @ts-expect-error
  shader.glProgram.vertex = "#version 300 es\n" + vertex

  // @ts-expect-error
  shader.glProgram.fragment = "#version 300 es\n" + fragment

  return shader
}
