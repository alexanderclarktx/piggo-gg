import {
  BoxGeometry, BufferAttribute, Color, InstancedMesh,
  InstancedMeshEventMap, MeshPhysicalMaterial, Object3D
} from "three"
import { World, blocks, XYtoChunk } from "@piggo-gg/core"

export type TBlockMesh = InstancedMesh<BoxGeometry, MeshPhysicalMaterial, InstancedMeshEventMap>

export const TBlockMesh = (world: World): TBlockMesh => {
  const geometry = new BoxGeometry(0.3, 0.3, 0.3)
  const position = geometry.attributes.position
  const colorAttr = new Float32Array(position.count * 3)

  const faceColors = [
    new Color(0xaaaaaa), new Color(0xaaaaaa),
    new Color(0x00ee55), new Color(0xaaaaaa),
    new Color(0xaaaaaa), new Color(0xaaaaaa)
  ]

  for (let i = 0; i < position.count; i++) {
    const faceIndex = Math.floor(i / 4)
    const color = faceColors[faceIndex]
    colorAttr.set([color.r, color.g, color.b], i * 3)
  }

  geometry.setAttribute('color', new BufferAttribute(colorAttr, 3))

  const mesh = new InstancedMesh(geometry, new MeshPhysicalMaterial({
    vertexColors: true, visible: false, specularIntensity: 0.05
  }), 512)

  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.frustumCulled = false

  const dummy = new Object3D()

  const pc = world.client?.playerCharacter()
  // console.log("TBlockMesh pc", pc)
  // if (pc) {
  //   const { position } = pc.components

  //   const chunk = XYtoChunk(position.data)

  //   const chunkData = blocks.visible([chunk])
  //   console.log("chunkData", chunkData.length)

  //   for (const block of chunkData) {
  //     const { x, y, z } = block
  //     const index = Math.floor(x / 0.3) + Math.floor(y / 0.3) * 16 + Math.floor(z / 0.3) * 16 * 16
  //     dummy.position.set(x, y, z)
  //     dummy.updateMatrix()

  //     mesh.setMatrixAt(index, dummy.matrix)

  //     console.log(`Block at (${x}, ${y}, ${z}) set at index ${index}`)
  //     // mesh.setMatrixAt(index, dummy.setPosition(x, y, z).matrix)
  //   }
  // }

  return mesh
}
