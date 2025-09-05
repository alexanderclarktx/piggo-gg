import { Mesh, MeshBasicMaterial, Object3DEventMap, PlaneGeometry } from "three"


// Mesh<CylinderGeometry, MeshBasicMaterial, Object3DEventMap>
export type Preview = {
  mesh: Mesh<PlaneGeometry, MeshBasicMaterial, Object3DEventMap>
}

export const Preview = (): Preview => {
  const geometry = new PlaneGeometry(0.3, 0.3)
  const material = new MeshBasicMaterial({ color: 0xffffff, side: 2 })

  const mesh = new Mesh(geometry, material)
  return { mesh }
}
