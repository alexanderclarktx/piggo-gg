import { Command } from "@piggo-gg/core";

export const DebugCommand: Command = {
  id: "debug",
  regex: /\/d$/,
  parse: ({ world }): undefined => {
    world.debug = !world.debug;
  },
  invoke: () => {}
}
