import { ClientSystemBuilder, cos, min, sin, World, XYZdiff, XYZsub } from "@piggo-gg/core"
import { PerspectiveCamera, Vector3 } from "three"

export type D3Camera = {
  c: PerspectiveCamera
  mode: "first" | "third"
  transition: number
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
    transition: 100,
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
        const ratio = delta / 25

        const { camera } = world.three

        const pc = world.client.character()
        if (!pc) return

        const { position } = pc.components
        const interpolated = position.interpolate(world, delta)
        const { x, y } = world.client.controls.localAim

        // mark if the camera mode has updated
        if (camera.mode !== lastMode) camera.transition = 0
        lastMode = camera.mode

        if (camera.transition < 120) {
          camera.transition += ratio * 8
        }

        const firstPos = { x: interpolated.x, y: interpolated.y, z: interpolated.z + 0.13 }

        const thirdOffset = new Vector3(-sin(x), y, -cos(x)).multiplyScalar(0.6)
        const thirdPos = {
          x: interpolated.x - thirdOffset.x, y: interpolated.y - thirdOffset.z, z: interpolated.z + 0.2 - thirdOffset.y
        }

        const diffPos = XYZsub(firstPos, thirdPos)



        if (camera.mode === "first") {
          if (camera.transition < 100) {
            const transitionPos = {
              x: thirdPos.x + diffPos.x * camera.transition / 100,
              y: thirdPos.y + diffPos.y * camera.transition / 100,
              z: thirdPos.z + diffPos.z * camera.transition / 100
            }
            camera.c.position.set(transitionPos.x, transitionPos.z, transitionPos.y)
          } else {
            camera.c.position.set(firstPos.x, firstPos.z, firstPos.y)
          }
          camera.c.rotation.set(y, x, 0)
        } else {
          if (camera.transition < 100) {
            camera.c.position.set(
              firstPos.x - diffPos.x * camera.transition / 100,
              firstPos.z - diffPos.z * camera.transition / 100,
              firstPos.y - diffPos.y * camera.transition / 100
            )
          } else {
            camera.c.position.set(thirdPos.x, thirdPos.z, thirdPos.y)
            camera.c.lookAt(interpolated.x, interpolated.z + 0.2, interpolated.y)
          }
        }
      }
    }
  }
})
