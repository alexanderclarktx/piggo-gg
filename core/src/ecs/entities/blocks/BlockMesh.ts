import { BlockTypeString, ClientSystemBuilder, GrassTexture, logPerf, ThreeRenderer } from "@piggo-gg/core"
import {
  BoxGeometry, Color, InstancedMesh, InstancedMeshEventMap, LinearMipMapNearestFilter,
  MeshPhysicalMaterial, NearestFilter, Object3D, SRGBColorSpace, Texture
} from "three"

export const BlockMeshSysten = ClientSystemBuilder({
  id: "BlockMeshSystem",
  init: (world) => {
    const { three } = world
    if (!three) return

    let grass = BlockMesh(88000, three)
    let leaf = BlockMesh(5000, three)
    let oak = BlockMesh(5000, three)
    let spruce = BlockMesh(5000, three)

    let rendered = false

    three.scene.add(grass, leaf, oak, spruce)

    // three.tLoader.load("grass.png", (texture: Texture) => {
    //   for (let i = 0; i < 6; i++) {
    //     if (i === 2) continue
    //     grass.material[i].map = texture
    //     grass.material[i].map!.colorSpace = SRGBColorSpace

    //     grass.material[i].visible = true
    //     grass.material[i].needsUpdate = true
    //   }
    //   texture.magFilter = NearestFilter
    //   texture.minFilter = LinearMipMapNearestFilter
    // })

    // three.tLoader.load("grass-top.png", (texture: Texture) => {
    //   grass.material[2].map = texture
    //   grass.material[2].map.colorSpace = SRGBColorSpace
    //   grass.material[2].visible = true
    //   grass.material[2].needsUpdate = true

    //   texture.magFilter = NearestFilter
    //   texture.minFilter = LinearMipMapNearestFilter
    // })

    return {
      id: "BlockMeshSystem",
      query: [],
      priority: 10,
      onTick: () => {
        let playerChunk = { x: 0, y: 0 }

        // todo chunk

        const t3 = performance.now()
        if (!rendered) {
          const dummy = new Object3D()

          const neighbors = world.blocks.neighbors(playerChunk, 24)
          const chunkData = world.blocks.visible(neighbors)

          let spruceCount = 0
          let oakCount = 0
          let leafCount = 0
          let otherCount = 0

          // for each block
          for (let i = 0; i < chunkData.length; i++) {
            const { x, y, z } = chunkData[i]
            const type = BlockTypeString[chunkData[i].type]

            dummy.position.set(x * 0.3, z * 0.3 + 0.15, y * 0.3)
            dummy.updateMatrix()

            if (type === "spruceLeaf") {
              leaf!.setColorAt(leafCount, new Color(0x0099aa))
              leaf?.setMatrixAt(leafCount, dummy.matrix)
              leafCount++
            } else if (type === "oakLeaf") {
              leaf!.setColorAt(leafCount, new Color(0x33dd77))
              leaf?.setMatrixAt(leafCount, dummy.matrix)
              leafCount++
            } else if (type === "oak") {
              oak!.setColorAt(oakCount, new Color(0xffaa99))
              oak?.setMatrixAt(oakCount, dummy.matrix)
              oakCount++
            } else if (type === "spruce") {
              spruce!.setColorAt(spruceCount, new Color(0xbb66ff))
              spruce?.setMatrixAt(spruceCount, dummy.matrix)
              spruceCount++
            } else {
              grass.setMatrixAt(otherCount, dummy.matrix)
              otherCount++
            }
          }

          grass.instanceMatrix.needsUpdate = true
          spruce!.instanceMatrix.needsUpdate = true
          oak!.instanceMatrix.needsUpdate = true
          leaf!.instanceMatrix.needsUpdate = true

          if (spruce?.instanceColor) spruce.instanceColor.needsUpdate = true
          if (oak?.instanceColor) oak.instanceColor.needsUpdate = true
          if (leaf?.instanceColor) leaf.instanceColor.needsUpdate = true

          grass.count = otherCount
          // world.three!.leaf!.count = leafCount
          // world.three!.oak!.count = oakCount
          // world.three!.spruce!.count = spruceCount

          rendered = true
        }
        logPerf("render blocks", t3)
      }
    }
  }
})

export type BlockMesh = InstancedMesh<BoxGeometry, MeshPhysicalMaterial[], InstancedMeshEventMap>

export const BlockMesh = (maxCount: number, renderer: ThreeRenderer): BlockMesh => {
  const mat = () => new MeshPhysicalMaterial({
    vertexColors: false, visible: false, specularIntensity: 0.05, wireframe: false
  })

  const mesh = new InstancedMesh(
    new BoxGeometry(0.3, 0.3, 0.3),
    [mat(), mat(), mat(), mat(), mat(), mat()],
    maxCount
  )

  GrassTexture(mesh.material, renderer)

  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.frustumCulled = false

  return mesh
}
