import { ClientSystemBuilder, cos, localAim, sin } from "@piggo-gg/core"
import { PerspectiveCamera, Vector3 } from "three"

export type TCamera = {
  c: PerspectiveCamera
  worldDirection: () => Vector3
  setFov: (fov: number) => void
}

export const TCamera = (): TCamera => {

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.rotation.order = "YXZ"

  const tCamera: TCamera = {
    c: camera,
    worldDirection: () => {
      const t = new Vector3(-sin(localAim.x), 0, -cos(localAim.x))
      return t.normalize()
    },
    setFov: (fov: number) => {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }
  return tCamera
}

export const TCameraSystem = () => ClientSystemBuilder({
  id: "TCameraSystem",
  init: (world) => ({
    id: "TCameraSystem",
    query: [],
    priority: 9,
    onRender: (_, delta) => {
      if (!world.three) return

      const pc = world.client?.playerCharacter()
      if (!pc) return

      const { position } = pc.components

      const interpolated = position.interpolate(world, delta)

      const { x, y } = localAim

      const rotatedOffset = new Vector3(-sin(x), y, -cos(x)).multiplyScalar(0.6)

      world.three.camera.c.position.set(
        interpolated.x - rotatedOffset.x,
        interpolated.z + 0.4 - rotatedOffset.y,
        interpolated.y - rotatedOffset.z
      )

      world.three.camera.c.lookAt(interpolated.x, interpolated.z + 0.2, interpolated.y)
    }
  })
})
