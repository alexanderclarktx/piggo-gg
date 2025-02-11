import { Command, InvokedAction } from "@piggo-gg/core"

type NameCommandParams = { newName: string }
type NameCommandAction = InvokedAction<"name", NameCommandParams>

export const NameCommand: Command<NameCommandParams> = {
  id: "name",
  regex: /^\/name (\w+)/,
  prepare: () => ({ actionId: "name" }),
  parse: ({ match, world }): NameCommandAction | undefined => {
    if (!world.client) return undefined
    return {
      actionId: "name",
      playerId: world.client?.playerId(),
      params: { newName: match[1] }
    }
  },
  invoke: ({ params, player }) => {
    if (!player) return undefined
    player.components.pc.data.name = params.newName
  },
  cooldown: 0
}
