import {
  ClientSystemBuilder, Entity, Renderable, Position, Character,
  abs, System, round, XY, XYZ, max, reduce, rotateGlobal
} from "@piggo-gg/core"
import { Application, Container } from "pixi.js"

export type Camera = {
  root: Container
  centeredEntity: Character | undefined
  add: (r: Renderable) => void
  remove: (r: Renderable) => void
  scaleBy: (delta: number) => void
  inFrame: (_: XY) => boolean
  moveBy: (_: XY) => void
  moveTo: (_: XY) => void
  toWorldCoords: (_: XY) => XY
  toCameraCoords: (_: XY) => XY
}

// Camera handles the viewport of the game
export const Camera = (app: Application): Camera => {

  const root: Container = new Container({ sortableChildren: true, zIndex: 0, alpha: 1 })
  const renderables: Set<Renderable> = new Set()

  let scale = 2

  const rescale = () => {
    const min = 1
    const max = 5

    if (scale < min) scale = min
    if (scale > max) scale = max

    root.scale.set(scale, scale)
  }

  rescale()

  const camera = {
    root,
    centeredEntity: undefined,
    add: (r: Renderable) => {
      renderables.add(r)
      root.addChild(r.c)
    },
    remove: (r: Renderable) => {
      renderables.delete(r)
      root.removeChild(r.c)
    },
    scaleBy: (delta: number) => {
      scale += delta
      rescale()
    },
    inFrame: ({ x, y }: XY) => { // TODO broken
      const { width, height } = app.screen

      const camX = ((width / 2) - root.x) / scale
      const camY = ((height / 2) - root.y) / scale

      const s = scale + 2

      const result = abs(camX - x) < width / s && abs(camY - y) < height / s

      return result
    },
    moveBy: ({ x, y }: XY) => {
      root.x += x
      root.y += y
    },
    moveTo: ({ x, y }: XY) => {
      root.x = round(app.screen.width / 2 - x * scale, 3)
      root.y = round(app.screen.height / 2 - y * scale, 3)
    },
    toWorldCoords: ({ x, y }: XY) => ({
      x: round((x - root.x) / scale, 3),
      y: round((y - root.y) / scale, 3)
    }),
    toCameraCoords: ({ x, y }: XY) => ({
      x: round(x * scale + root.x, 3),
      y: round(y * scale + root.y, 3)
    })
  }

  return camera
}

type Follow = (_: XYZ) => XYZ

export const CameraSystem = (follow: Follow = ({ x, y }) => ({ x, y, z: 0 })) => ClientSystemBuilder({
  id: "CameraSystem",
  init: (world) => {
    const { renderer } = world
    if (!renderer) return

    let zoomLeft = 0

    // handle zoom
    renderer.app.canvas.addEventListener("wheel", (event) => {
      zoomLeft = event.deltaY * 0.01
    })

    const cameraSystem: System = {
      id: "CameraSystem",
      query: ["renderable", "position"],
      priority: 10,
      onTick: (entities: Entity<Renderable | Position>[]) => {
        let numHidden = 0

        // cull far away entities
        // for (const entity of entities) {
        //   const { position, renderable } = entity.components

        //   // cull if far from camera
        //   if (renderable.cullable && !position.screenFixed && renderable.c.children) {
        //     renderable.c.children.forEach((child) => {
        //       child.visible = renderer.camera.inFrame({
        //         x: position.data.x + child.position.x,
        //         y: position.data.y + child.position.y
        //       })

        //       if (!child.visible) numHidden++
        //     })
        //   }
        // }

        // center camera on player's character
        const character = world.client?.playerCharacter()
        if (character) renderer.camera.centeredEntity = character
      },
      onRender: (_, delta) => {
        if (!renderer.camera.centeredEntity) return

        if (zoomLeft !== 0) {
          renderer.camera?.scaleBy(-zoomLeft * 0.1)
          zoomLeft = reduce(zoomLeft, 0.005)
        }

        // const interpolated = renderer.camera.centeredEntity.components.position.interpolate(delta, world)

        // const { x, y, z } = follow({
        //   x: renderer.camera.centeredEntity.components.position.data.x + interpolated.x,
        //   y: renderer.camera.centeredEntity.components.position.data.y + interpolated.y,
        //   z: renderer.camera.centeredEntity.components.position.data.z + interpolated.z
        // })
        const { x, y, z } = follow({
          x: renderer.camera.centeredEntity.components.position.data.x,
          y: renderer.camera.centeredEntity.components.position.data.y,
          z: renderer.camera.centeredEntity.components.position.data.z
        })

        if (renderer.camera.centeredEntity.components.position.data.standing) {
          renderer?.camera.moveTo({ x, y: y - max(z, 0) })
        } else {
          const rotated = rotateGlobal(renderer.camera.centeredEntity)
          renderer?.camera.moveTo({ x: rotated.x, y: rotated.y - max(z, 0) })
        }
      }
    }

    return cameraSystem
  }
})
