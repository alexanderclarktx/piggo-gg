import { Action, Actions, Character, Effects, Entity, Item, KeyMouse, Name, Renderable, ValidSounds, abs, hypot, loadTexture, min, playSound, randomInt } from "@piggo-gg/core"
import { Sprite } from "pixi.js"

export const Axe = (character: Character): Item => Entity({
  id: `${character.id}-axe-${randomInt(1000)}`,
  components: {
    name: Name("axe"),
    position: character.components.position,
    actions: Actions<any>({
      "mb1": Whack("thunk"),
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

        const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

        const hyp_x = pointingDelta.x / hypotenuse
        const hyp_y = pointingDelta.y / hypotenuse

        r.position = {
          x: hyp_x * min(20, abs(pointingDelta.x)),
          y: hyp_y * min(20, abs(pointingDelta.y)) - 5
        }

        const flip = pointingDelta.x > 0 ? 1 : -1
        r.setScale({ x: flip, y: 1 })
      },
      setup: async (r: Renderable) => {
        const textures = await loadTexture("axe.json")

        r.c = new Sprite(textures["0"])

        r.setOutline(0x000000)
      }
    })
  }
})

export const Pickaxe = (character: Character): Item => Entity({
  id: `${character.id}-pickaxe-${randomInt(1000)}`,
  components: {
    name: Name("pickaxe"),
    position: character.components.position,
    actions: Actions<any>({
      "mb1": Whack("clink")
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

        const hypotenuse = hypot(pointingDelta.x, pointingDelta.y)

        const hyp_x = pointingDelta.x / hypotenuse
        const hyp_y = pointingDelta.y / hypotenuse

        r.position = {
          x: hyp_x * min(20, abs(pointingDelta.x)),
          y: hyp_y * min(20, abs(pointingDelta.y)) - 5
        }

        const flip = pointingDelta.x > 0 ? 1 : -1
        r.setScale({ x: flip, y: 1 })
      },
      setup: async (r: Renderable) => {
        const textures = await loadTexture("pickaxe.json")

        r.c = new Sprite(textures["0"])

        r.setOutline(0x000000)
      }
    })
  }
})

const Whack = (sound: ValidSounds) => Action<KeyMouse & { character: Character }>(({ world, params, entity }) => {
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

  console.log("whack", params.mouse)
}, 15)
