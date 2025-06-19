import { XYZ } from "@piggo-gg/core";
import { PerspectiveCamera } from "three";

export type TCamera = {
  c: PerspectiveCamera
  pos: XYZ
}

export const TCamera = (pos?: XYZ): TCamera => {
  const tCamera: TCamera = {
    c: new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000),
    pos: pos ?? { x: 0, y: 0, z: 0 }
  }
  return tCamera
}
