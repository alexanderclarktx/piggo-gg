import { Entity, Position, Renderable, loadTextureCached, pixiRect } from "@piggo-gg/core"
import { AnimatedSprite, Graphics, Sprite } from "pixi.js"

export const PvEHUD = (): Entity => {

  const width = 50
  const height = 50
  const start = -width * 3

  let squares: Graphics[] = []
  let icons: Record<number, Sprite | undefined> = {}

  const hud = Entity<Renderable | Position>({
    id: "PvEHUD",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (renderable, renderer) => {
          const canvasWidth = renderer.props.canvas.width
          hud.components.position.setPosition({ x: canvasWidth / 2, y: -100 })

          squares = Array.from({ length: 5 }, (_, i) => pixiRect(
            { w: width, h: height, y: 0, x: start + i * (width + 10), rounded: 5 }
          ))
          icons = {}

          renderable.c.removeChildren()
          renderable.c.addChild(...squares)
        },
        dynamic: async (c, __, ___, w) => {
          const playerCharacter = w.client?.playerCharacter()
          if (!playerCharacter) return

          const { inventory } = playerCharacter.components

          if (!inventory) return

          // highlight the active item slot
          const { activeItemIndex } = inventory
          squares.forEach((s, i) => {
            s.tint = activeItemIndex === i ? 0xffff00 : 0xcccccc
            s.alpha = activeItemIndex === i ? 1 : 0.8
          })

          // update icons
          for (let i = 0; i < 8; i++) {
            const item = inventory.items[i]
            if (!item && icons[i]) {
              c.removeChild(icons[i]!)
              icons[i] = undefined
            }

            if (item && !icons[i]) {
              const textures = loadTextureCached(`${item.components.name.data.name}.json`)
              if (!textures) continue

              const slotSprite = new AnimatedSprite([textures["0"]])
              slotSprite.position.set(start + (width / 2) + i * (width + 10), height / 2)
              slotSprite.scale.set(5)
              slotSprite.anchor.set(0.5)
              c.addChild(slotSprite)
              icons[i] = slotSprite
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
