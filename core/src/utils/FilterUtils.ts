import { Filter } from 'pixi.js'

const vertex = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;

  void main() {
    vTextureCoord = (aPosition + 1.0) * 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`

const fragment = `
  precision mediump float;

  varying vec2 vTextureCoord;

  uniform sampler2D uSampler;
  uniform vec2 shadowOffset;
  uniform float shadowAlpha;

  void main() {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`

export const ShadeFilter = Filter.from({
  gl: { vertex, fragment }, resources: {
    uniforms: {
      shadowOffset: { value: [0.05, 0.05], type: 'vec2<f32>' },
      shadowAlpha: { value: 0.3, type: 'f32' }
    }
  }
})
