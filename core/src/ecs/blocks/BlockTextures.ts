import { BlockMesh, ThreeRenderer } from "@piggo-gg/core"
import { LinearMipMapNearestFilter, NearestFilter, SRGBColorSpace, Texture } from "three"

type BlockTextureProps = {
  side: string
  top?: string
  bottom?: string
  norm?: string
}

export const BlockTexture = ({ side, top, bottom, norm }: BlockTextureProps) => (mesh: BlockMesh, three: ThreeRenderer) => {

  const { material } = mesh

  three.tLoader.load(`${side}.png`, (texture: Texture) => {
    for (let i = 0; i < 6; i++) {
      if (top && i === 2) continue
      if (bottom && i === 3) continue

      material[i].map = texture
      material[i].map!.colorSpace = SRGBColorSpace

      material[i].needsUpdate = true
      material[i].visible = true
    }

    texture.magFilter = NearestFilter
    texture.minFilter = LinearMipMapNearestFilter
  })

  if (top) three.tLoader.load(`${top}.png`, (texture: Texture) => {
    material[2].map = texture
    material[2].map!.colorSpace = SRGBColorSpace

    material[2].needsUpdate = true
    material[2].visible = true

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

export const SpruceTexture = BlockTexture({ side: "spruce-log", norm: "spruce-norm" })
export const OakTexture = BlockTexture({ side: "oak-log", norm: "spruce-norm" })
export const LeafTexture = BlockTexture({ side: "dirt", norm: "dirt-norm" })
export const GrassTexture = BlockTexture({ side: "grass", top: "grass-top", norm: "dirt-norm" })
export const MarbleTexture = BlockTexture({ side: "marble", norm: "dirt-norm" })
