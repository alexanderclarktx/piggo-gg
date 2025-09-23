import { ClientSystemBuilder } from "@piggo-gg/core"
import {
  BoxGeometry, InstancedMesh, InstancedMeshEventMap, MeshPhysicalMaterial
} from "three"

export const BlockMeshSysten = ClientSystemBuilder({
  id: "BlockMeshSystem",
  init: () => {

    let grass = BlockMesh(88000)
    let leaf = BlockMesh(5000)
    let oak = BlockMesh(5000)
    let spruce = BlockMesh(5000)

    return {
      id: "BlockMeshSystem",
      query: [],
      priority: 10,
      onTick: () => {

      }
    }
  }
})

export type BlockMesh = InstancedMesh<BoxGeometry, MeshPhysicalMaterial[], InstancedMeshEventMap>

export const BlockMesh = (maxCount: number): BlockMesh => {
  const mat = () => new MeshPhysicalMaterial({
    vertexColors: false, visible: false, specularIntensity: 0.05, wireframe: false
  })

  const mesh = new InstancedMesh(
    new BoxGeometry(0.3, 0.3, 0.3),
    [mat(), mat(), mat(), mat(), mat(), mat()],
    maxCount
  )

  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.frustumCulled = false

  return mesh
}
