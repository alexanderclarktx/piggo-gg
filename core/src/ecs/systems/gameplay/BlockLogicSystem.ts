import { Block, SystemBuilder } from "@piggo-gg/core"

export const BlockLogicSystem = SystemBuilder({
  id: "BlockLogicSystem",
  init: (world) => {

    const leafs: Block[] = []

    return {
      id: "BlockLogicSystem",
      query: [],
      priority: 4,
      onTick: () => {
        

      }
    }
  }
})
