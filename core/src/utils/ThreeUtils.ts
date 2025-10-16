import { randomLR, TeamNumber } from "@piggo-gg/core"
import { Color, Mesh, Object3D, Vector3 } from "three"
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

export type ColorMapping = Record<string, Record<TeamNumber, `#${string}`>>

export const colorMaterials = (obj: Object3D, mapping: ColorMapping, team: TeamNumber) => {
  obj.traverse((child) => {
    if (child instanceof Mesh) {
      if (!Array.isArray(child.material)) {
        const color = child.material.color as Color

        const hex = color.getHexString()

        if (mapping[hex]) {
          child.material.color = new Color(mapping[hex][team])
        }
      }
    }
  })
}

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

export const randomVector3 = (scale = 1) => {
  return new Vector3(randomLR(), randomLR(), randomLR()).normalize().multiplyScalar(scale)
}
