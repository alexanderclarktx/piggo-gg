import { Entity, Position, Renderable, loadTextureCached, pixiRect, pixiText } from "@piggo-gg/core"
import { AnimatedSprite, Graphics, Sprite, Text } from "pixi.js"

type SlotVisuals = {
  icon: Sprite
  count?: Text | undefined
}

export const PvEHUD = (): Entity => {

  const width = 50
  const height = 50
  const start = -width * 3

  let squares: Graphics[] = []
  let icons: Record<number, SlotVisuals | undefined> = {}

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
        dynamic: async ({ container, world }) => {
          const playerCharacter = world.client?.playerCharacter()
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
          for (let i = 0; i < squares.length; i++) {
            const slot = inventory.items[i]
            if (!slot && icons[i]) {
              container.removeChild(icons[i]!.icon)
              icons[i] = undefined
            }
            if (!slot) continue
            const item = slot[0]

            // set up new icon
            if (item && !icons[i]) {
              const textures = loadTextureCached(`${item.components.item.name}.json`)
              if (!textures) continue

              const slotSprite = new AnimatedSprite([textures["0"]])

              slotSprite.position.set(start + (width / 2) + i * (width + 10), height / 2)
              slotSprite.scale.set(2 * item.components.renderable.scale)
              slotSprite.anchor.set(0.5)

              const count = item.components.item.stackable ?
                pixiText({ text: `${slot!.length}`, pos: { x: 4, y: 0 }, style: { fontSize: 12, fill: 0xffffff } }) :
                undefined

              icons[i] = { icon: slotSprite, count }

              container.addChild(slotSprite)
              if (count) slotSprite.addChild(count)
            } else {
              const { count } = icons[i] || {}
              if (count) count.text = `${slot!.length}`
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
        }
      })
    }
  })
  return hud
}
