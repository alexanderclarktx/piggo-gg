import { ClientSystemBuilder, cos, max, min, sin, World, XYZ, XYZsub } from "@piggo-gg/core"
import { PerspectiveCamera, Vector3 } from "three"

export type D3Camera = {
  c: PerspectiveCamera
  mode: "first" | "third"
  transition: number
  dir: (world: World) => XYZ
  pos: () => XYZ
  setFov: (fov: number) => void
}

export const D3Camera = (): D3Camera => {

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000)
  camera.rotation.order = "YXZ"

  const d3Camera: D3Camera = {
    c: camera,
    mode: "third",
    transition: 125,
    dir: (world: World) => {
      if (!world.client) return new Vector3(0, 0, 0)

      const { localAim } = world.client.controls

      return XYZ(new Vector3(
        -sin(localAim.x) * cos(localAim.y),
        -cos(localAim.x) * cos(localAim.y),
        sin(localAim.y),
      ).normalize())
    },
    pos: () => {
      return XYZ(d3Camera.c.position)
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

        const pc = world.client.character()
        if (!pc) return

        const interpolated = pc.components.position.interpolate(world, delta)

        const { x, y } = world.client.controls.localAim
        const ratio = delta / 25
        const { camera } = world.three

        if (camera.mode !== lastMode) camera.transition = 0
        lastMode = camera.mode

        if (camera.transition < 125) {
          camera.transition += ratio * 8
        }

        const firstPos = { x: interpolated.x, y: interpolated.y, z: interpolated.z + 0.13 }

        const offset = new Vector3(-sin(x) * cos(y), sin(y), -cos(x) * cos(y)).multiplyScalar(0.6)
        const thirdPos = { x: interpolated.x - offset.x, y: interpolated.y - offset.z, z: interpolated.z + 0.2 - offset.y }

        const diff = XYZsub(firstPos, thirdPos)

        const percent = max(0, min(1, camera.transition / 100))

        if (camera.mode === "first") {
          if (camera.transition < 100) {
            camera.c.position.set(
              firstPos.x - diff.x * (1 - percent),
              firstPos.z - diff.z * (1 - percent),
              firstPos.y - diff.y * (1 - percent)
            )
          } else {
            camera.c.position.set(firstPos.x, firstPos.z, firstPos.y)
          }
          camera.c.rotation.set(y, x, 0)
        } else {
          if (camera.transition < 100) {
            camera.c.position.set(
              thirdPos.x + diff.x * (1 - percent),
              thirdPos.z + diff.z * (1 - percent),
              thirdPos.y + diff.y * (1 - percent)
            )
          } else {
            camera.c.position.set(thirdPos.x, thirdPos.z, thirdPos.y)
          }
          camera.c.lookAt(interpolated.x, interpolated.z + 0.13 + percent * 0.07, interpolated.y)
        }
      }
    }
  }
})
