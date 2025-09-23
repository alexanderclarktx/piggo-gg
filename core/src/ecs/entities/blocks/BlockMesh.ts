import {
  BoxGeometry, InstancedMesh, InstancedMeshEventMap, MeshPhysicalMaterial
} from "three"

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
