import { Entity, Position, Renderable, loadTexture, pixiRect } from "@piggo-gg/core"
import { AnimatedSprite } from "pixi.js"

export const PvEHUD = (): Entity => {

  const width = 50
  const height = 50

  const slot1 = -width * 4
  const squares = Array.from({ length: 8 }, (_, i) => pixiRect({ w: width, h: height, y: 0, x: slot1 + i * (width + 10), rounded: 5 }))

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

          if (inventory?.activeItem) {
            const textures = await loadTexture(`${inventory.activeItem.components.name.data.name}.json`)
            const slotSprite = new AnimatedSprite([textures["0"]])
            slotSprite.position.set(slot1 + (width / 2), height / 2)
            slotSprite.scale.set(5)
            slotSprite.anchor.set(0.5)
            c.addChild(slotSprite)
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

