import {
  Action, Actions, Character, Effects, Entity, Item, KeyMouse,
  Name, Renderable, SpawnHitbox, SpawnHitboxProps, ValidSounds,
  XYdifferent, abs, hypot, loadTexture, min, mouseScreen, playSound, randomInt
} from "@piggo-gg/core"
import { Sprite } from "pixi.js"

export const Axe = (character: Character): Item => {

  let mouseLast = { x: 0, y: 0 }

  const axe: Item = Entity({
    id: `${character.id}-axe-${randomInt(1000)}`,
    components: {
      name: Name("axe"),
      position: character.components.position,
      actions: Actions<any>({
        "mb1": Whack("thud", 25),
        "spawnHitbox": SpawnHitbox
      }),
      effects: Effects(),
      renderable: Renderable({
        scaleMode: "nearest",
        zIndex: character.components.renderable.zIndex,
        scale: 2.5,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        visible: false,
        rotates: true,
        dynamic: (_, r, e, w) => {
          const { pointingDelta, rotation } = character.components.position.data

          if (rotation) {
            character.components.position.rotateDown(rotation > 0 ? 0.1 : -0.1, true)
          }

          if (XYdifferent(mouseScreen, mouseLast)) {

            const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

            const hyp_x = pointingDelta.x / hypotenuse
            const hyp_y = pointingDelta.y / hypotenuse

            r.position = {
              x: hyp_x * min(20, abs(pointingDelta.x)),
              y: hyp_y * min(20, abs(pointingDelta.y)) - 5
            }

            const flip = pointingDelta.x > 0 ? 1 : -1
            r.setScale({ x: flip, y: 1 })
          }

          mouseLast = mouseScreen
        },
        setup: async (r: Renderable) => {
          const textures = await loadTexture("axe.json")

          r.c = new Sprite(textures["0"])

          r.setOutline(0x000000)
        }
      })
    }
  })
  return axe
}

export const Pickaxe = (character: Character): Item => {

  let mouseLast = { x: 0, y: 0 }

  const pickaxe: Item = Entity({
    id: `${character.id}-pickaxe-${randomInt(1000)}`,
    components: {
      name: Name("pickaxe"),
      position: character.components.position,
      actions: Actions<any>({
        "mb1": Whack("clink", 10),
        "spawnHitbox": SpawnHitbox
      }),
      effects: Effects(),
      renderable: Renderable({
        scaleMode: "nearest",
        zIndex: character.components.renderable.zIndex,
        scale: 2.5,
        anchor: { x: 0.5, y: 0.5 },
        interpolate: true,
        visible: false,
        rotates: true,
        dynamic: (_, r, e, w) => {
          const { pointingDelta, rotation } = character.components.position.data

          if (rotation) {
            character.components.position.rotateDown(rotation > 0 ? 0.1 : -0.1, true)
          }

          if (XYdifferent(mouseScreen, mouseLast)) {

            const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

            const hyp_x = pointingDelta.x / hypotenuse
            const hyp_y = pointingDelta.y / hypotenuse

            r.position = {
              x: hyp_x * min(20, abs(pointingDelta.x)),
              y: hyp_y * min(20, abs(pointingDelta.y)) - 5
            }

            const flip = pointingDelta.x > 0 ? 1 : -1
            r.setScale({ x: flip, y: 1 })
          }

          mouseLast = mouseScreen
        },
        setup: async (r: Renderable) => {
          const textures = await loadTexture("pickaxe.json")

          r.c = new Sprite(textures["0"])

          r.setOutline(0x000000)
        }
      })
    }
  })
  return pickaxe
}

const Whack = (sound: ValidSounds, damage: number) => Action<KeyMouse & { character: Character }>(({ world, params, entity }) => {
  if (!entity) return

  const { mouse, character } = params

  if (!mouse || !character) return

  playSound(world.client?.sounds[sound])

  const { position } = entity.components
  if (!position) return

  if (position.data.pointingDelta.x > 0) {
    position.rotateUp(1)
  } else {
    position.rotateDown(1)
  }

  const angle = Math.atan2(position.data.pointingDelta.y, position.data.pointingDelta.x)

  const hurtboxParams: SpawnHitboxProps = {
    pos: {
      x: position.data.x + Math.cos(angle) * 30,
      y: position.data.y + Math.sin(angle) * 30,
    },
    team: character.components.team,
    radius: 20,
    damage,
    id: randomInt(1000),
    visible: false,
    expireTicks: 5
  }

  world.actionBuffer.push(world.tick + 1, entity.id, { action: "spawnHitbox", params: hurtboxParams })

  console.log("whack", params.mouse)
}, 15)
