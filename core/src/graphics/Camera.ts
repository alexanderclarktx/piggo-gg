import {
  ClientSystemBuilder, Entity, Renderable, Position,
  Character, abs, round, XY, XYZ, sign, sqrt, max, min
} from "@piggo-gg/core"
import { Application, Container } from "pixi.js"

export type Camera = {
  angle: 0 | 1 | 2 | 3
  root: Container
  focus: Character | undefined
  scale: number
  add: (r: Renderable) => void
  remove: (r: Renderable) => void
  scaleBy: (delta: number) => void
  scaleTo: (scale: number) => void
  inFrame: (_: XY) => boolean
  moveBy: (_: XY) => void
  moveTo: (_: XY) => void
  toWorldCoords: (_: XY) => XY
  toCameraCoords: (_: XY) => XY
}

// Camera handles the viewport of the game
export const Camera = (app: Application): Camera => {

  const root: Container = new Container({ sortableChildren: true, zIndex: 0, alpha: 1, cullableChildren: false })
  const renderables: Set<Renderable> = new Set()

  const camera: Camera = {
    angle: 0,
    root,
    focus: undefined,
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
    scaleTo: (scale: number) => {
      camera.scale = scale
      rescale()
    },
    inFrame: ({ x, y }: XY) => { // TODO broken
      const { width, height } = app.screen

      const camX = ((width / 2) - root.x) / camera.scale
      const camY = ((height / 2) - root.y) / camera.scale

      const s = camera.scale * 1.4

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
    const min = 1.2
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
      targetScale = min(targetScale, 5)
      targetScale = max(targetScale, 1)
    })

    return {
      id: "CameraSystem",
      query: ["renderable", "position"],
      priority: 9,
      onTick: (entities: Entity<Renderable | Position>[]) => {
        // camera focus on player's character
        const character = world.client?.playerCharacter()
        if (character) renderer.camera.focus = character

        // cull far away entities
        let numHidden = 0
        for (const entity of entities) {
          const { renderable } = entity.components

          if (renderable.cullable) {
            const { x, y } = renderable.c.position
            if (!renderer.camera.inFrame({ x, y })) {
              renderable.visible = false
              numHidden++
            } else {
              renderable.visible = true
            }
          }
        }
        // console.log(`hidden ${numHidden} entities`)
      },
      onRender: (_, delta) => {
        if (!renderer.camera.focus) return

        if (targetScale !== renderer.camera.scale) {
          const diff = targetScale - renderer.camera.scale
          renderer.camera.scaleBy(diff * 0.1)
        }

        const { position, renderable } = renderer.camera.focus.components

        const interpolated = position.interpolate(delta, world)

        const { x, y, z } = follow(interpolated)

        const rotated = world.flip({
          x: x + renderable.position.x,
          y: y + renderable.position.y
        })
        renderer?.camera.moveTo({ x: rotated.x, y: rotated.y - z })
      }
    }
  }
})
