import { Entity, Position, Renderable, pixiRect, pixiText } from "@piggo-gg/core"
import { Graphics } from "pixi.js"

type AbilityStrings = [string, string, string, string]

export const MobilePvPHUD = (): Entity => {

  const ammo = pixiText({ text: "", pos: { x: 130, y: 5 }, anchor: { x: 1, y: 0 }, style: { fontSize: 32 } })
  const hp = pixiText({ text: "100 ⛨", pos: { x: -100, y: 5 }, anchor: { x: 0.5, y: 0 }, style: { fontSize: 32 } })

  const hud = Entity<Renderable | Position>({
    id: "MobilePvPHUD",
    components: {
      position: Position({ screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (renderable, renderer) => {
          const canvasWidth = renderer.props.canvas.width
          hud.components.position.setPosition({ x: canvasWidth / 2, y: -90 })

          // outline
          const outline = new Graphics()
          outline.moveTo(-150, 45)
            .lineTo(-50, 45)
            .lineTo(-20, 65)
            .lineTo(20, 65)
            .lineTo(50, 45)
            .lineTo(150, 45)
            .stroke({ width: 2, color: 0xffffff, alpha: 0.9 })

          renderable.c.addChild(outline, hp, ammo)
        },
        dynamic: ({ world }) => {
          const playerCharacter = world.client?.playerCharacter()
          if (!playerCharacter) return

          const { health } = playerCharacter.components
          const gun = playerCharacter.components.inventory?.activeItem(world)?.components?.gun

          console.log("z", gun)

          if (gun) ammo.text = `${gun.data.clip} ‖` // TODO infinite ammo ${gun.data.ammo}`
          if (health) hp.text = `${health.data.health} ⛨`
        }
      })
    }

  })
  return hud
}

export const PvPHUD = (keys: AbilityStrings, labels: AbilityStrings): Entity => {

  const width = 50
  const height = 50

  const square1 = pixiRect({ w: width, h: height, y: 0, x: -150 })
  const square2 = pixiRect({ w: width, h: height, y: 0, x: -75 })
  const square3 = pixiRect({ w: width, h: height, y: 0, x: 0 })
  const square4 = pixiRect({ w: width, h: height, y: 0, x: 75 })

  const ammo = pixiText({ text: "", pos: { x: 320, y: 10 }, anchor: { x: 1, y: 0 }, style: { fontSize: 32 } })
  const hp = pixiText({ text: "100 ⛨", pos: { x: -310, y: 10 }, anchor: { x: 0.5, y: 0 }, style: { fontSize: 32 } })

  const hud = Entity<Renderable | Position>({
    id: "PvPHUD",
    components: {
      position: Position({ x: 0, y: 0, screenFixed: true }),
      renderable: Renderable({
        zIndex: 10,
        setup: async (renderable, renderer) => {
          const canvasWidth = renderer.props.canvas.width
          hud.components.position.setPosition({ x: canvasWidth / 2, y: -100 })

          // hotkey text
          const key1 = pixiText({ text: keys[0], pos: { x: -148, y: 35 } })
          const key2 = pixiText({ text: keys[1], pos: { x: -73, y: 35 } })
          const key3 = pixiText({ text: keys[2], pos: { x: 2, y: 35 } })
          const key4 = pixiText({ text: keys[3], pos: { x: 77, y: 35 } })

          // ability labels
          const label1 = pixiText({ text: labels[0], pos: { x: -141, y: 10 }, style: { fontSize: 18 } })
          const label2 = pixiText({ text: labels[1], pos: { x: -70, y: 11 }, style: { fontSize: 16 } })
          const label3 = pixiText({ text: labels[2], pos: { x: 5, y: 11 }, style: { fontSize: 16 } })
          const label4 = pixiText({ text: labels[3], pos: { x: 80, y: 11 }, style: { fontSize: 16 } })

          // outline
          const outline = new Graphics()
          outline.moveTo(-400, 50)
            .lineTo(-230, 50)
            .lineTo(-170, -10)
            .lineTo(150, -10)
            .lineTo(210, 50)
            .lineTo(380, 50)
            .stroke({ width: 2, color: 0xffffff, alpha: 0.9 })

          renderable.c.addChild(outline, hp, ammo, square1, square2, square3, square4, key1, key2, key3, key4, label1, label2, label3, label4)
        },
        dynamic: ({ world }) => {
          const playerCharacter = world.client?.playerCharacter()
          if (!playerCharacter) return

          const { actions, health } = playerCharacter.components
          const gun = playerCharacter.components.inventory?.activeItem(world)?.components?.gun

          if (gun) ammo.text = `${gun.data.clip} ‖` // TODO infinite ammo ${gun.data.ammo}`
          if (health) hp.text = `${health.data.health} ⛨`

          // handle abilities
          labels.forEach((label, i) => {
            const square = [square1, square2, square3, square4][i]
            const ability = actions?.actionMap[label]

            // no ability
            if (!ability) {
              square.alpha = 0.4
              return
            }

            // no cooldown timer
            if (!ability.cdLeft || !ability.cooldown) {
              square.alpha = 1
              return
            }

            // cooldown
            const cooldownRatio = ability.cdLeft / ability.cooldown
            square.alpha = 1 - 0.7 * Math.sqrt(cooldownRatio)
          })
        }
      })
    }
  })

  return hud
}
