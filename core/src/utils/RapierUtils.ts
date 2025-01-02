import { Polyline } from "@dimforge/rapier2d-compat"

export const polyline = (points: number[]) => {
  return new Polyline(Float32Array.from(points))
}
