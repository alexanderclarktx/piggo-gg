import { max, min } from "@piggo-gg/core";
import { PerspectiveCamera, Vector3 } from "three";

export type TCamera = {
  c: PerspectiveCamera
}

export const TCamera = (): TCamera => {

  const camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.rotation.order = 'YXZ'

  let vert = 0
  let hori = 0

  window.addEventListener('pointermove', (e) => {
    if (!document.pointerLockElement) return

    console.log(e.movementX, e.movementY)
    console.log(e.clientX, e.clientY)

    vert -= e.movementY * 0.001
    hori -= e.movementX * 0.001

    vert = max(-1.5, min(1.5, vert))

    camera.rotation.set(vert, hori, 0)
  })
  document.body.requestPointerLock({ unadjustedMovement: true })

  document.body.addEventListener('click', () => {
    document.body.requestPointerLock()
  })

  window.addEventListener("keydown", (event) => {
    const k = event.key.toLowerCase()

    // if (k === "b") three.debug(!debug)
    // if (k === "r") three.resize()

    if (k === " ") {
      camera.position.y += 0.1
    }
    if (k === "shift") {
      camera.position.y -= 0.1
    }

    if (k === "a") {
      const t = new Vector3(0, 0, 0)
      camera.getWorldDirection(t)
      t.y = 0
      t.normalize()

      const left = new Vector3()
      left.crossVectors(camera.up, t).normalize()

      camera.position.addScaledVector(left, 0.1)
    }
    if (k === "d") {
      const t = new Vector3(0, 0, 0)
      camera.getWorldDirection(t)
      t.y = 0
      t.normalize()

      const right = new Vector3()
      right.crossVectors(t, camera.up).normalize()

      camera.position.addScaledVector(right, 0.1)
    }
    if (k === "w") {
      const t = new Vector3(0, 0, 0)
      camera.getWorldDirection(t)
      t.y = 0
      t.normalize()

      camera.position.addScaledVector(t, 0.1)
    }
    if (k === "s") {
      const t = new Vector3(0, 0, 0)
      camera.getWorldDirection(t)
      t.y = 0
      t.normalize()

      camera.position.addScaledVector(t, -0.1)
    }
  })

  const tCamera: TCamera = {
    c: camera
  }
  return tCamera
}
