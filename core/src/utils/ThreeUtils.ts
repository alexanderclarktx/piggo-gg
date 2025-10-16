import { randomLR } from "@piggo-gg/core"
import { Color, Mesh, Object3D, Vector3 } from "three"
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

type SkinComponent = "armor" | "helmet" | "suit" | "skin"

const TeamSkins: Record<number, Record<SkinComponent, `#${string}`>> = {
  1: {
    armor: "#312e2b",
    helmet: "#453089",
    suit: "#4f535a",
    skin: "#be9393"
  },
  2: {
    armor: "#2b1608",
    helmet: "#671029",
    suit: "#7e4f19",
    skin: "#be9393"
  }
}


export const copyMaterials = (from: Object3D, to: Object3D, team = 2) => {
  const fromMap: Record<string, Object3D> = {}
  from.traverse((child) => {
    fromMap[child.name] = child
  })

  const fromColors = new Set<string>()

  to.traverse((child) => {
    if (fromMap[child.name] && child instanceof Mesh && fromMap[child.name] instanceof Mesh) {
      const fromChild = fromMap[child.name] as Mesh
      if (Array.isArray(fromChild.material)) {
        child.material = fromChild.material.map(m => m.clone())
      } else {
        // @ts-expect-error
        const color = fromChild.material.color as Color

        const hex = color.getHexString()

        fromColors.add(color.getHexString())

        child.material = fromChild.material.clone()

        if (hex === "cead86") {
          child.material.color = new Color(TeamSkins[team].skin)
        } else if (hex === "4f535a") {
          child.material.color = new Color(TeamSkins[team].suit)
        } else if (hex === "312e2b") {
          child.material.color = new Color(TeamSkins[team].armor)
        } else if (hex === "161616") {
          child.material.color = new Color(TeamSkins[team].helmet)
        }
      }
    }
  })

  console.log("from colors", [...fromColors])
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
