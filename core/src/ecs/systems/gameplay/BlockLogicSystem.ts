import { SystemBuilder } from "@piggo-gg/core"

export const BlockLogicSystem = SystemBuilder({
  id: "BlockLogicSystem",
  init: (world) => {
    return {
      id: "BlockLogicSystem",
      query: [],
      priority: 4,
      onTick: () => {
        // only the server runs this system
        // if (world.mode !== "server") return

      }
    }
  }
})
