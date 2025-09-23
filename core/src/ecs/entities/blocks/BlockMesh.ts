import { ClientSystemBuilder } from "@piggo-gg/core"
import {
  BoxGeometry, InstancedMesh, InstancedMeshEventMap, MeshPhysicalMaterial
} from "three"

export const BlockMeshSysten = ClientSystemBuilder({
  id: "BlockMeshSystem",
  init: () => {

    let spruce: undefined | BlockMesh = undefined
    let oak: undefined | BlockMesh = undefined
    let leaf: undefined | BlockMesh = undefined
    let grass: undefined | BlockMesh = undefined

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
