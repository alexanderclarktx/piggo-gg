import { BlockMesh, ThreeRenderer } from "@piggo-gg/core"
import { LinearMipMapNearestFilter, NearestFilter, SRGBColorSpace, Texture } from "three"

export const GrassTexture = (mesh: BlockMesh, three: ThreeRenderer) => {

  const materials = mesh.material

  three.tLoader.load("grass.png", (texture: Texture) => {
    for (let i = 0; i < 6; i++) {
      if (i === 2) continue
      materials[i].map = texture
      materials[i].map!.colorSpace = SRGBColorSpace

      materials[i].visible = true
      materials[i].needsUpdate = true
    }
    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  three.tLoader.load("grass-top.png", (texture: Texture) => {
    materials[2].map = texture
    materials[2].map.colorSpace = SRGBColorSpace
    materials[2].visible = true
    materials[2].needsUpdate = true

    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

}
