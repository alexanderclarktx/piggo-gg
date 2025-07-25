import { ClientSystemBuilder, cos, sin, World } from "@piggo-gg/core"
import { PerspectiveCamera, Vector3 } from "three"

export type TCamera = {
  c: PerspectiveCamera
  worldDirection: (world: World) => Vector3
  setFov: (fov: number) => void
}

export const TCameraSystem = () => ClientSystemBuilder({
  id: "TCameraSystem",
  init: (world) => {
    return {
      id: "TCameraSystem",
      query: [],
      priority: 9,
      onRender: (_, delta) => {
        if (!world.three) return

        const pc = world.client?.playerCharacter()
        if (!pc) return

        const { position } = pc.components

        const interpolated = position.interpolate(world, delta)

        const rotatedOffset = new Vector3(
          -sin(position.data.aim.x), position.data.aim.y, -cos(position.data.aim.x)
        ).multiplyScalar(0.6)

        world.three.camera.c.position.set(
          interpolated.x - rotatedOffset.x,
          interpolated.z + 0.4 - rotatedOffset.y,
          interpolated.y - rotatedOffset.z
        )

        world.three.camera.c.lookAt(interpolated.x, interpolated.z + 0.2, interpolated.y)
      }
    }
  }
})

export const TCamera = (): TCamera => {

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.rotation.order = 'YXZ'

  const tCamera: TCamera = {
    c: camera,
    worldDirection: (world: World) => {
      const pc = world.client?.playerCharacter()
      if (!pc) return new Vector3(0, 0, -1)

      const { position } = pc.components

      const { x } = position.data.aim

      const t = new Vector3(-sin(x), 0, -cos(x))
      return t.normalize()
    },
    setFov: (fov: number) => {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }
  return tCamera
}
