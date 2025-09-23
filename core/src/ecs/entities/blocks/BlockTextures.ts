import { BlockMesh, ThreeRenderer } from "@piggo-gg/core"
import { LinearMipMapNearestFilter, NearestFilter, SRGBColorSpace, Texture } from "three"

export const SpruceTexture = (mesh: BlockMesh, three: ThreeRenderer) => {

  const { material } = mesh

  three.tLoader.load("oak-log.png", (texture: Texture) => {
    for (let i = 0; i < 6; i++) {
      material[i].map = texture
      material[i].map!.colorSpace = SRGBColorSpace

      material[i].needsUpdate = true
      material[i].visible = true
    }

    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  return mesh
}

export const OakTexture = (mesh: BlockMesh, three: ThreeRenderer) => {

  const { material } = mesh

  three.tLoader.load("oak-log.png", (texture: Texture) => {
    for (let i = 0; i < 6; i++) {
      material[i].map = texture
      material[i].map!.colorSpace = SRGBColorSpace

      material[i].needsUpdate = true
      material[i].visible = true
    }

    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  return mesh
}

export const LeafTexture = (mesh: BlockMesh, three: ThreeRenderer) => {

  const { material } = mesh

  three.tLoader.load("dirt.png", (texture: Texture) => {
    for (let i = 0; i < 6; i++) {
      material[i].map = texture
      material[i].map!.colorSpace = SRGBColorSpace

      material[i].needsUpdate = true
      material[i].visible = true
    }

    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  return mesh
}

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
