import { RenderTexture } from "pixi.js"

const shadowMapSize = 1024
const shadowRenderTexture = RenderTexture.create({ width: shadowMapSize, height: shadowMapSize })

const vertexSrc = `
  in vec3 aPosition;

  uniform mat4 uLightMatrix;

  void main() {
      gl_Position = uLightMatrix * vec4(aPosition, 1.0);
  }
`

const fragmentSrc = `
  out vec4 fragColor;

  void main() {}
`
