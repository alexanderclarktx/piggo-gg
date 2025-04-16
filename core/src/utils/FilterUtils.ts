import { Filter } from 'pixi.js'

const vertex = `
  in vec2 aPosition;
  out vec2 vTextureCoord;

  uniform vec4 uInputSize;
  uniform vec4 uOutputFrame;
  uniform vec4 uOutputTexture;

  vec4 filterVertexPosition( void )
  {
      vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
      
      position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
      position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

      return vec4(position, 0.0, 1.0);
  }

  vec2 filterTextureCoord( void )
  {
      return aPosition * (uOutputFrame.zw * uInputSize.zw);
  }

  void main(void)
  {
      gl_Position = filterVertexPosition();
      vTextureCoord = filterTextureCoord();
  }
`

const fragment = `
  precision mediump float;

  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;

  uniform vec2 shadowOffset;
  uniform float shadowAlpha;

  void main() {
    // Sample original and shadow
    vec4 texColor = texture2D(uSampler, vTextureCoord);
    vec4 shadowTex = texture2D(uSampler, vTextureCoord + shadowOffset);

    // Shadow is black with some transparency from the source texture
    vec4 shadowColor = vec4(0.0, 0.0, 0.0, shadowTex.a * shadowAlpha);

    // Combine shadow and original sprite
    gl_FragColor = shadowColor + texColor;
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

// {
//   shadowOffset: [0.05, 0.05], // tweak as needed
//   shadowAlpha: 0.3,
// }
// )

// blockSprite.filters = [shadowFilter]