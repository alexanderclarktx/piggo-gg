import { ClientSystemBuilder, cos, sin, World } from "@piggo-gg/core"
import { PerspectiveCamera, Vector3 } from "three"

export type D3Camera = {
  c: PerspectiveCamera
  mode: "first" | "third"
  updated: boolean
  dir: (world: World) => Vector3
  // up: () => Vector3
  setFov: (fov: number) => void
}

export const D3Camera = (): D3Camera => {

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000)
  camera.rotation.order = "YXZ"

  const d3Camera: D3Camera = {
    c: camera,
    mode: "third",
    updated: false,
    dir: (world: World) => {
      if (!world.client) return new Vector3(0, 0, 0)

      const { localAim } = world.client.controls

      return new Vector3(
        -sin(localAim.x), -0.33 + localAim.y, -cos(localAim.x)
      ).normalize()
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

    let lastMode = "third"

    return {
      id: "D3CameraSystem",
      query: [],
      priority: 9,
      onRender: (entities, delta) => {
        if (!world.three || !world.client) return

        const { camera } = world.three

        const pc = world.client.character()
        if (!pc) return

        const { position } = pc.components
        const interpolated = position.interpolate(world, delta)
        const { x, y } = world.client.controls.localAim

        // mark if the camera mode has updated
        camera.updated = camera.mode !== lastMode
        lastMode = camera.mode

        if (camera.mode === "first") {
          camera.c.position.set(interpolated.x, interpolated.z + 0.13, interpolated.y)
          camera.c.rotation.set(y, x, 0)
        } else {
          const offset = new Vector3(-sin(x), y, -cos(x)).multiplyScalar(0.6)

          camera.c.position.set(
            interpolated.x - offset.x, interpolated.z + 0.2 - offset.y, interpolated.y - offset.z
          )

          camera.c.lookAt(interpolated.x, interpolated.z + 0.2, interpolated.y)
        }
      }
    }
  }
})
