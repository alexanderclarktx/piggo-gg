import {
  Actions, Debug, Entity, Input, Position, Renderable, TeamColors,
  keys, max, pixiCircle, pixiGraphics, values
} from "@piggo-gg/core"
import { Container, Graphics } from "pixi.js"

export const Minimap = (dim: number, tileMap: number[]): Entity => {
  let scale = 0.5
  let fullscreen = false

  const dots: Record<string, Graphics> = {}

  const container = new Container()
  const tileGraphics = pixiGraphics({ alpha: 0.9, rotation: Math.PI / 4 })
  const background = pixiGraphics()
  const outline = pixiGraphics()
  const mask = background.clone()

  const tileColors: Record<number, number> = {
    37: TeamColors[1][0],
    64: TeamColors[2][0],
    19: 0xffccaa
  }

  const minimap = Entity<Position | Renderable>({
    id: "minimap",
    components: {
      position: Position({ x: -125, y: 125, screenFixed: true }),
      debug: Debug(),
      input: Input({
        press: { "capslock": ({ world }) => ({ actionId: "toggleFS", playerId: world.client?.playerId() }) }
      }),
      actions: Actions({
        toggleFS: ({ world }) => {
          fullscreen = !fullscreen
          if (fullscreen) {
            tileGraphics.mask = null
            tileGraphics.scale = 1.5
            values(dots).forEach((dot) => dot.mask = null)

            const bounds = tileGraphics.getBounds()

            minimap.components.position.data = {
              ...minimap.components.position.data,
              x: world.renderer!.app.canvas.width / 2,
              y: max(0, (world.renderer!.app.canvas.height - bounds.height) / 2 - 100)
            }

            background.clear()
            outline.clear()
          } else {
            tileGraphics.mask = mask
            tileGraphics.scale = 1
            values(dots).forEach((dot) => dot.mask = mask)

            minimap.components.position.data = {
              ...minimap.components.position.data,
              x: -125, y: 125
            }

            background.circle(0, 0, 100).fill({ color: 0x000000, alpha: 0.4 })
            outline.circle(0, 0, 100).stroke({ color: 0xffffff, width: 2, alpha: 0.9 })
          }
        },
      }),
      renderable: Renderable({
        zIndex: 10,
        dynamic: ({ world }) => {

          // remove dots that are no longer in the world
          keys(dots).forEach((id) => {
            if (!world.entities[id]) {
              container.removeChild(dots[id])
              delete dots[id]
            }
          })

          // update dot visibility
          keys(dots).forEach((id) => {
            dots[id].visible = true

            if (id === world.client?.playerId()) return

            const character = world.entities[id]?.components.controlling?.getCharacter(world)
            if (!character) return

            const { team } = character.components
            if (!team || team.data.team === world.client?.playerCharacter()?.components.team?.data.team) return
            dots[id].visible = team.visible
          })

          const playerCharacter = world.client?.playerCharacter()
          if (!playerCharacter) return
          const playerPosition = playerCharacter.components.position

          // update player dots
          world.queryEntities(["pc"]).forEach((entity) => {

            if (!dots[entity.id]) {
              const color = (entity.id === world.client?.playerId()) ? 0x00ff00 : 0xff0000
              dots[entity.id] = pixiCircle({ r: 3 }).fill({ color })
              dots[entity.id].mask = mask
              container.addChild(dots[entity.id])
            }

            const character = entity.components.controlling?.getCharacter(world)
            if (!character) return

            const { position } = character.components

            if (fullscreen) dots[entity.id].position.set(position.data.x / 7.6 - 4, position.data.y / 3.8 + 2)

            if (!fullscreen) {
              if (entity.id === world.client?.playerId()) {
                dots[entity.id].position.set(0, 0)
              } else {
                dots[entity.id].position.set((position.data.x - playerPosition.data.x) * scale / 5.6, (position.data.y - playerPosition.data.y) * scale / 2.8)
              }
            }
          })

          // update tile graphic position
          if (fullscreen) {
            tileGraphics.position.set(0, 0)
          } else {
            tileGraphics.position.set(-playerPosition.data.x / 5.6 * scale + 5, - playerPosition.data.y / 2.8 * scale + 2)
          }
        },
        setContainer: async () => {

          background.circle(0, 0, 100).fill({ color: 0x000000, alpha: 0.4 })
          outline.circle(0, 0, 100).stroke({ color: 0xffffff, width: 2, alpha: 0.9 })

          tileGraphics.mask = mask

          const width = 8 * scale
          let color = 0xccccff

          // draw the tiles
          tileMap.forEach((tile, i) => {
            if (tile === 0) return

            color = tileColors[tile] || 0xccccff

            const x = i % dim
            const y = Math.floor(i / dim)

            tileGraphics.rect(x * width, y * width, width, width).fill({ color })
          })

          container.addChild(background, tileGraphics, outline, mask)
          return container
        }
      })
    }
  })

  return minimap
}
