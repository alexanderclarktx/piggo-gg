import { Shader } from "pixi.js"

const vertex = `
  precision mediump float;
  
  in vec2 aPosition;
  in vec3 aOffset;
  in vec3 aBary;
  
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

export const LightShader = (): Shader => {
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