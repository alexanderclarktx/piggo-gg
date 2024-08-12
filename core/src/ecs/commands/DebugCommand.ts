import { Command } from "@piggo-gg/core";

export const DebugCommand: Command = {
  id: "debug",
  regex: /\/debug/,
  // @ts-ignore
  parse: ({ world }): undefined => {
    world.debug = !world.debug;
  },
  invoke: () => {}
}
