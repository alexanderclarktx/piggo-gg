import { ClientSystemBuilder, max, min } from "@piggo-gg/core";
import { PerspectiveCamera, Vector3 } from "three";

export type TCamera = {
  c: PerspectiveCamera
  worldDirection: () => Vector3
}

export const TCameraSystem = () => ClientSystemBuilder({
  id: "TCameraSystem",
  init: (world) => {
    return {
      id: "TCameraSystem",
      query: [],
      priority: 9,
      onTick: () => {
        if (!world.three) return

        const pc = world.client?.playerCharacter()
        if (!pc) return

        const { position } = pc.components

        world.three.camera.c.position.set(position.data.x, position.data.z, position.data.y)
      }
    }
  }
})

export const TCamera = (): TCamera => {

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.rotation.order = 'YXZ'

  let vert = 0
  let hori = 0

  window.addEventListener('pointermove', (e) => {
    if (!document.pointerLockElement) return

    vert -= e.movementY * 0.001
    hori -= e.movementX * 0.001

    vert = max(-1.5, min(1.5, vert))

    camera.rotation.set(vert, hori, 0)
  })

  const tCamera: TCamera = {
    c: camera,
    worldDirection: () => {
      const t = new Vector3(0, 0, 0)
      camera.getWorldDirection(t)
      t.y = 0
      t.normalize()
      return t
    }
  }
  return tCamera
}
