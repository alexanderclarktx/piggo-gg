import { Action, Actions, Character, Effects, Entity, Input, Item, KeyMouse, Name } from "@piggo-gg/core"

export const Axe = (): Item => Entity({
  id: "axe",
  components: {
    name: Name("axe"),
    input: Input({
      press: {
        "mb1": ({ character, mouse }) => ({ action: "whack", params: { character, mouse } })
      }
    }),
    actions: Actions<any>({
      "whack": Whack,
    }),
    effects: Effects()
  }
})

const Whack = Action<KeyMouse & { character: Character }>(({ world, params, entity}) => {
  if (!entity) return

  const { mouse, character } = params

  if (!mouse || !character) return

  if (mouse.hold) return

  console.log("whack", params.mouse)
})
