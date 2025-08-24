import {
  BoxGeometry, BufferAttribute, Color, InstancedMesh,
  InstancedMeshEventMap, MeshPhysicalMaterial
} from "three"

export type D3BlockMesh = InstancedMesh<BoxGeometry, MeshPhysicalMaterial[], InstancedMeshEventMap>

export const D3BlockMesh = (maxCount: number = 22000): D3BlockMesh => {
  const geometry = new BoxGeometry(0.3, 0.3, 0.3)
  const { position } = geometry.attributes

  const faceColors = [
    new Color(0xffffff), new Color(0xffffff),
    new Color(0xffffff), new Color(0xffffff),
    new Color(0xffffff), new Color(0xffffff)
  ]

  const colorAttr = new Float32Array(position.count * 3)
  for (let i = 0; i < position.count; i++) {
    const faceIndex = Math.floor(i / 4)
    const color = faceColors[faceIndex]
    colorAttr.set([color.r, color.g, color.b], i * 3)
  }

  geometry.setAttribute("color", new BufferAttribute(colorAttr, 3))

  const mat = () => new MeshPhysicalMaterial({
    vertexColors: true, visible: false, specularIntensity: 0.05, wireframe: false
  })

  const mesh = new InstancedMesh(geometry, [mat(), mat(), mat(), mat(), mat(), mat()], maxCount)

  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.frustumCulled = false

  return mesh
}
