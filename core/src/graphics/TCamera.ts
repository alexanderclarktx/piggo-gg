import { ClientSystemBuilder, cos, sin, World } from "@piggo-gg/core"
import { PerspectiveCamera, Vector3 } from "three"

export type TCamera = {
  c: PerspectiveCamera
  worldDirection: (world: World) => Vector3
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

        const interpolated = position.interpolate(delta, world)

        world.three.camera.c.position.set(interpolated.x, interpolated.z, interpolated.y)

        world.three.camera.c.rotation.set(
          position.data.aim.y, position.data.aim.x, 0
        )
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
    }
  }
  return tCamera
}
