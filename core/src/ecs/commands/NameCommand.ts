import { Command, InvokedAction } from "@piggo-gg/core"

type NameCommandParams = { newName: string }
type NameCommandAction = InvokedAction<"name", NameCommandParams>

export const NameCommand: Command<NameCommandParams> = {
  id: "name",
  regex: /\/name (\w+)/,
  parse: ({ match, world }): NameCommandAction | undefined => {
    if (!world.client) return undefined
    return {
      action: "name",
      playerId: world.client?.playerId(),
      params: { newName: match[1] }
    }
  },
  invoke: ({ params, player }) => {
    if (!player) return undefined
    player.components.player.data.name = params.newName
  }
}
