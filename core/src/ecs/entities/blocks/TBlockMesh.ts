import {
  BoxGeometry, BufferAttribute, Color, InstancedMesh,
  InstancedMeshEventMap, MeshPhysicalMaterial, Object3D
} from "three"

export type TBlockMesh = InstancedMesh<BoxGeometry, MeshPhysicalMaterial, InstancedMeshEventMap>

export const TBlockMesh = (): TBlockMesh => {
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

  const dummy = new Object3D()

  // arrange blocks in 2D grid
  for (let i = 0; i < 512; i++) {
    const j = i % 16
    const k = Math.floor(i / 16)

    dummy.position.set(j * 0.3, 0, k * 0.3)

    if ([31, 67, 134, 121, 300, 501, 420].includes(i)) dummy.position.y = 0.3

    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }

  return mesh
}
