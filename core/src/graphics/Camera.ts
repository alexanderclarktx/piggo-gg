import {
  ClientSystemBuilder, Entity, Renderable, Position,
  Character, abs, round, XY, XYZ, sign, sqrt
} from "@piggo-gg/core"
import { Application, Container } from "pixi.js"

export type Camera = {
  angle: 0 | 1 | 2 | 3
  root: Container
  centeredEntity: Character | undefined
  scale: number
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

  const camera: Camera = {
    angle: 0,
    root,
    centeredEntity: undefined,
    scale: 2.5,
    add: (r: Renderable) => {
      renderables.add(r)
      root.addChild(r.c)
    },
    remove: (r: Renderable) => {
      renderables.delete(r)
      root.removeChild(r.c)
    },
    scaleBy: (delta: number) => {
      camera.scale += delta
      rescale()
    },
    inFrame: ({ x, y }: XY) => { // TODO broken
      const { width, height } = app.screen

      const camX = ((width / 2) - root.x) / camera.scale
      const camY = ((height / 2) - root.y) / camera.scale

      const s = camera.scale + 2

      const result = abs(camX - x) < width / s && abs(camY - y) < height / s

      return result
    },
    moveBy: ({ x, y }: XY) => {
      root.x += x
      root.y += y
    },
    moveTo: ({ x, y }: XY) => {
      root.x = round(app.screen.width / 2 - x * camera.scale, 3)
      root.y = round(app.screen.height / 2 - y * camera.scale, 3)
    },
    toWorldCoords: ({ x, y }: XY) => ({
      x: round((x - root.x) / camera.scale, 3),
      y: round((y - root.y) / camera.scale, 3)
    }),
    toCameraCoords: ({ x, y }: XY) => ({
      x: round(x * camera.scale + root.x, 3),
      y: round(y * camera.scale + root.y, 3)
    })
  }

  const rescale = () => {
    const min = 1
    const max = 5

    if (camera.scale < min) camera.scale = min
    if (camera.scale > max) camera.scale = max

    root.scale.set(camera.scale, camera.scale)
  }

  rescale()

  return camera
}

type Follow = (_: XYZ) => XYZ

export const CameraSystem = (follow: Follow = ({ x, y }) => ({ x, y, z: 0 })) => ClientSystemBuilder({
  id: "CameraSystem",
  init: (world) => {
    const { renderer } = world
    if (!renderer) return

    let targetScale = renderer.camera.scale

    // scroll to zoom
    renderer.app.canvas.addEventListener("wheel", (event) => {
      targetScale += -0.01 * sign(event.deltaY) * sqrt(abs(event.deltaY))
    })

    return {
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

        if (targetScale !== renderer.camera.scale) {
          const diff = targetScale - renderer.camera.scale
          renderer.camera.scaleBy(diff * 0.1)
        }

        const { position, renderable } = renderer.camera.centeredEntity.components

        const interpolated = position.interpolate(delta, world)

        const { x, y, z } = follow({
          x: position.data.x + interpolated.x,
          y: position.data.y + interpolated.y,
          z: position.data.z + interpolated.z
        })

        const rotated = world.flip({
          x: x + renderable.position.x,
          y: y + renderable.position.y
        })
        renderer?.camera.moveTo({ x: rotated.x, y: rotated.y - z })
      }
    }
  }
})
