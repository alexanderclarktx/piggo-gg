import { Actions, Character, Effects, Input, Item, ItemEntity, Networked, Position } from "@piggo-gg/core"

export const HookItem = ({ character }: { character: Character }) => {

  // const mesh =

  const item = ItemEntity({
    id: `hook-${character.id}`,
    components: {
      position: Position(),
      effects: Effects(),
      networked: Networked(),
      item: Item({ name: "hook", stackable: false }),
      actions: Actions({
        // hook: Hook(mesh),
      }),
      input: Input({
        press: {
          "mb1": ({ hold, character, world, aim, client }) => {
            if (hold) return null
            if (!character) return null
            if (!document.pointerLockElement && !client.mobile) return null
            if (world.client?.mobileLock) return null

            return null
          }
        }
      })
    }
  })

  return item
}
