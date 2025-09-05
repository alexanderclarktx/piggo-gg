import { Mesh } from "three"


// Mesh<CylinderGeometry, MeshBasicMaterial, Object3DEventMap>
export type Preview = {
  mesh: Mesh
}

export const Preview = (): Preview => {
  const mesh = new Mesh()
  return { mesh }
}

