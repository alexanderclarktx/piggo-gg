import { Entity, Player, SystemBuilder } from "@piggo-gg/core";

export const StrikeSystem: SystemBuilder<"StrikeSystem"> = {
  id: "StrikeSystem",
  init: ({ world }) => {
    return {
      id: "StrikeSystem",
      query: ["query"],
      onTick: (players: Entity<Player>[]) => {
        // console.log("StrikeSystem", strikes);
      }
    }
  }
}
