import { Shader } from "pixi.js"

const vertex = `
  precision mediump float;

  in vec2 aPosition;
  in vec3 aOffset;
  in vec3 aBary;

  uniform mat4 uModelViewProjection;

  out vec3 vBary;
  out float vDepth;

  void main() {
    vec4 worldPosition = vec4(aPosition + aOffset.xy, aOffset.z, 1.0);
    vec4 clipPosition = uModelViewProjection * worldPosition;

    vBary = aBary;
    vDepth = clipPosition.z / clipPosition.w; // NDC depth
    gl_Position = clipPosition;
  }
`

const fragment = `
  precision mediump float;

  in vec2 vPosition;
  in vec3 vOffset;
  in vec3 vBary;

  uniform vec3 uLightColor;
  uniform float uLightIntensity;
  
  out vec4 fragColor;

  void main() {
    // Calculate light effect based on position and barycentric coordinates
    float lightEffect = max(0.0, dot(vBary, vec3(1.0))) * uLightIntensity;
    fragColor = vec4(uLightColor * lightEffect, 1.0);
  }
`

export const SunShader = (): Shader => {
  const shader = Shader.from({
    gl: { vertex, fragment },
    resources: {
      uniforms: {
        
      }
    }
  })

  // @ts-expect-error
  shader.glProgram.vertex = "#version 300 es\n" + vertex

  // @ts-expect-error
  shader.glProgram.fragment = "#version 300 es\n" + fragment

  return shader
}
