import { ClientSystemBuilder, cos, localAim, sin } from "@piggo-gg/core"
import { PerspectiveCamera, Vector3 } from "three"

export type D3Camera = {
  c: PerspectiveCamera
  zoom: number
  worldDirection: () => Vector3
  setFov: (fov: number) => void
}

export const D3Camera = (): D3Camera => {

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.rotation.order = "YXZ"

  const d3Camera: D3Camera = {
    c: camera,
    zoom: 0.6,
    worldDirection: () => {
      const t = new Vector3(-sin(localAim.x), 0, -cos(localAim.x))
      return t.normalize()
    },
    setFov: (fov: number) => {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  }
  return d3Camera
}

export const D3CameraSystem = () => ClientSystemBuilder({
  id: "D3CameraSystem",
  init: (world) => {

    // scrollwheel callback
    window.addEventListener("wheel", (e) => {
      e.preventDefault()
      world.three!.camera.zoom += e.deltaY * 0.001
      world.three!.camera.zoom = Math.min(Math.max(0.6, world.three!.camera.zoom), 0.9)
    })

    return {
      id: "D3CameraSystem",
      query: [],
      priority: 9,
      onRender: (_, delta) => {
        if (!world.three) return

        const pc = world.client?.playerCharacter()
        if (!pc) return

        const { position } = pc.components

        const interpolated = position.interpolate(world, delta)

        const { x, y } = localAim

        const rotatedOffset = new Vector3(-sin(x), y, -cos(x)).multiplyScalar(world.three.camera.zoom)

        world.three.camera.c.position.set(
          interpolated.x - rotatedOffset.x,
          interpolated.z + (world.three.camera.zoom / 3 * 2) - rotatedOffset.y,
          interpolated.y - rotatedOffset.z
        )

        world.three.camera.c.lookAt(interpolated.x, interpolated.z + 0.2, interpolated.y)
      }
    }
  }
})
