import { Actions, Deagle, Entity, Input, Item, Name, Reload, Shoot, SpawnBullet } from "@piggo-gg/core"

export const DeagleItem = (): Item => Entity({
  id: "deagle",
  components: {
    name: Name("deagle"),
    input: Input({
      press: {
        "r": ({ character, mouse }) => ({ action: "reload", params: { character, mouse } }),
        "mb1": ({ character, mouse }) => ({ action: "shoot", params: { character, mouse } })
      }
    }),
    actions: Actions<any>({
      "spawnBullet": SpawnBullet,
      "shoot": Shoot,
      "reload": Reload
    }),
    gun: Deagle()
  }
})
