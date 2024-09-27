import { Entity, Position, Renderable, loadTexture, loadTextureCached, pixiRect } from "@piggo-gg/core"
import { AnimatedSprite, Sprite } from "pixi.js"

export const PvEHUD = (): Entity => {

  const width = 50
  const height = 50

  const start = -width * 4
  const squares = Array.from({ length: 8 }, (_, i) => pixiRect({ w: width, h: height, y: 0, x: start + i * (width + 10), rounded: 5 }))

  const squareIcons: Record<number, Sprite | undefined> = {}

  const hud = Entity<Renderable | Position>({
    id: "PvEHUD",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (renderable, renderer) => {
          const canvasWidth = renderer.props.canvas.width
          hud.components.position.setPosition({ x: canvasWidth / 2, y: -100 })

          renderable.c.addChild(...squares)
        },
        dynamic: async (c, __, ___, w) => {
          const playerCharacter = w.client?.playerCharacter()
          if (!playerCharacter) return

          const { inventory } = playerCharacter.components

          if (!inventory) return

          for (let i = 0; i < 8; i++) {
            const item = inventory.items[i]
            if (!item && squareIcons[i]) {
              c.removeChild(squareIcons[i]!)
              squareIcons[i] = undefined
            }

            if (item && !squareIcons[i]) {
              const textures = loadTextureCached(`${item.components.name.data.name}.json`)
              if (!textures) continue

              const slotSprite = new AnimatedSprite([textures["0"]])
              slotSprite.position.set(start + (width / 2) + i * (width + 10), height / 2)
              slotSprite.scale.set(5)
              slotSprite.anchor.set(0.5)
              c.addChild(slotSprite)
              squareIcons[i] = slotSprite
            }
          }
        }
      })
    }
  })
  return hud
}

export const MobilePvEHUD = (): Entity => {

  const hud = Entity<Renderable | Position>({
    id: "MobilePvEHUD",
    components: {
      position: Position({ screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (_, renderer) => {
          const canvasWidth = renderer.props.canvas.width
          hud.components.position.setPosition({ x: canvasWidth / 2, y: -90 })
        },
        dynamic: (_, __, ___, w) => {
        }
      })
    }
  })
  return hud
}

