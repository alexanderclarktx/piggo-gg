import { Command } from "@piggo-gg/core"

export const DebugCommand: Command = {
  id: "debug",
  regex: /\/d$/,
  prepare: () => ({ actionId: "debug" }),
  parse: ({ world }): undefined => {
    world.debug = !world.debug
  },
  invoke: () => {},
  cooldown: 0
}
