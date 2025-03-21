import {
  ClientSystemBuilder, Entity, Renderable, XY,
  Position, Character, abs, System, round
} from "@piggo-gg/core"
import { Application, Container } from "pixi.js"

export type Camera = {
  root: Container
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
      root.x = app.screen.width / 2 - x * scale
      root.y = app.screen.height / 2 - y * scale
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

export type CameraSystemProps = {
  follow?: (_: XY) => XY
}

export const CameraSystem = ({ follow = ({ x, y }) => ({ x, y }) }: CameraSystemProps = {}) => ClientSystemBuilder({
  id: "CameraSystem",
  init: (world) => {
    const { renderer } = world
    if (!renderer) return
    let centeredEntity: Character | undefined = undefined

    // handle zoom
    renderer.app.canvas.addEventListener("wheel", (event) => {
      renderer.camera?.scaleBy(-event.deltaY / 1000)
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
        if (character) centeredEntity = character
      },
      onRender: () => {
        if (!centeredEntity) return

        const { x, y } = follow(centeredEntity.components.renderable.c.position)
        renderer?.camera.moveTo({ x, y })
      }
    }

    return cameraSystem
  }
})
