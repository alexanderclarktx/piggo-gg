import { BlockMesh, ThreeRenderer } from "@piggo-gg/core"
import { LinearMipMapNearestFilter, NearestFilter, SRGBColorSpace, Texture } from "three"

export const BlockTexture = (texture: string, norm?: string) => (mesh: BlockMesh, three: ThreeRenderer) => {

  const { material } = mesh

  three.tLoader.load(`${texture}.png`, (texture: Texture) => {
    for (let i = 0; i < 6; i++) {
      material[i].map = texture
      material[i].map!.colorSpace = SRGBColorSpace

      material[i].needsUpdate = true
      material[i].visible = true
    }

    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  if (norm) three.tLoader.load(`${norm}.png`, (map: Texture) => {
    for (let i = 0; i < 6; i++) {
      material[i].roughnessMap = map
    }
  })

  return mesh
}

export const SpruceTexture = BlockTexture("spruce-log", "spruce-norm")
export const OakTexture = BlockTexture("oak-log", "spruce-norm")
export const LeafTexture = BlockTexture("dirt", "dirt-norm")

export const GrassTexture = (mesh: BlockMesh, three: ThreeRenderer) => {

  const { material } = mesh

  three.tLoader.load("grass.png", (texture: Texture) => {
    for (let i = 0; i < 6; i++) {
      if (i === 2) continue
      material[i].map = texture
      material[i].map!.colorSpace = SRGBColorSpace

      material[i].visible = true
      material[i].needsUpdate = true
    }
    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  three.tLoader.load("grass-top.png", (texture: Texture) => {
    material[2].map = texture
    material[2].map.colorSpace = SRGBColorSpace
    material[2].visible = true
    material[2].needsUpdate = true

    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  return mesh
}
