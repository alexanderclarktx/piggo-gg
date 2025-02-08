import { ClientSystemBuilder, Entity, Renderable, XY, Position, Character, isMobile } from "@piggo-gg/core"
import { Application, Container } from "pixi.js"

export type Camera = {
  root: Container
  add: (r: Renderable) => void
  remove: (r: Renderable) => void
  scaleBy: (delta: number) => void
  shouldCull: (_: XY) => boolean
  moveBy: (_: XY) => void
  moveTo: (_: XY) => void
  toWorldCoords: (_: XY) => XY
}

// Camera handles the viewport of the game
export const Camera = (app: Application): Camera => {

  const root: Container = new Container({ sortableChildren: true, zIndex: 0, alpha: 1 })
  const renderables: Set<Renderable> = new Set()

  let scale = 2

  const rescale = () => {
    const min = 1.6
    const max = 5

    if (scale < min) scale = min
    if (scale > max) scale = max

    root.scale.set(scale, scale)
  }

  rescale()

  return {
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
    shouldCull: ({ x, y }: XY) => {
      const { width, height } = app.screen
      const s = scale - 0.9
      return Math.abs(x - root.x) > width / s / 2 || Math.abs(y - root.y) > height / s / 2
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
      x: (x - root.x) / scale,
      y: (y - root.y) / scale
    }),
  }
}

export const CameraSystem = ClientSystemBuilder({
  id: "CameraSystem",
  init: (world) => {
    if (!world.renderer) return undefined

    const { renderer } = world
    let centeredEntity: Character | undefined = undefined

    return {
      id: "CameraSystem",
      query: ["renderable", "position"],
      onTick: (entities: Entity<Renderable | Position>[]) => {
        let numHidden = 0

        for (const entity of entities) {
          const { position, renderable } = entity.components

          // cull if far from camera
          if (renderable.cullable && !position.screenFixed && renderable.c.children) {
            renderable.c.children.forEach((child) => {
              child.visible = !renderer.camera.shouldCull({
                x: position.data.x + child.position.x,
                y: position.data.y + child.position.y
              })

              if (!child.visible) numHidden++

              console.log(renderer.camera.root.x, renderer.camera.root.y)
            })
          }


          // center camera on player's controlled entity
          const player = world.client?.player
          if (player) {
            const character = player.components.controlling.getControlledEntity(world)
            if (character) centeredEntity = character
          }
        }

        console.log("numHidden", numHidden)
      },
      onRender: (entities: Entity<Renderable | Position>[]) => {
        if (!centeredEntity) return

        const { x, y } = centeredEntity.components.renderable.c.position

        if (isMobile()) {
          // renderer.camera.moveTo({ x: x + 100, y: 0 })
          renderer.camera.moveTo({ x, y })
        } else {
          renderer.camera.moveTo({ x, y })
        }
      }
    }
  }
})
