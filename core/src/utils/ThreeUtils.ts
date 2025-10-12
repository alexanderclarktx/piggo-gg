import { Mesh, Object3D } from "three"
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

export const copyMaterials = (from: Object3D, to: Object3D) => {
  const fromMap: Record<string, Object3D> = {}
  from.traverse((child) => {
    fromMap[child.name] = child
  })

  to.traverse((child) => {
    if (fromMap[child.name] && child instanceof Mesh && fromMap[child.name] instanceof Mesh) {
      const fromChild = fromMap[child.name] as Mesh
      if (Array.isArray(fromChild.material)) {
        child.material = fromChild.material.map(m => m.clone())
      } else {
        child.material = fromChild.material.clone()
      }
    }
  })
}

export const cloneSkeleton = clone

export const cloneThree = <O extends Object3D>(o: O): O => {
  const cloned = o.clone()

  cloned.traverse((child) => {
    if (child instanceof Mesh) {
      if (Array.isArray(child.material)) {
        child.material = child.material.map(m => m.clone())
      } else {
        child.material = child.material.clone()
      }
    }
  })

  return cloned
}
