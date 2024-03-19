import { Background, GameBuilder, Health, HealthBarSystem, PlayerSpawnSystem, Zombie } from "@piggo-gg/core";

export const Strike: GameBuilder<"strike"> = ({
  id: "strike",
  init: () => ({
    id: "strike",
    entities: [
      Zombie({ id: "zombie" }).extend([
        new Health(100, 100)]
      ),
      Background()
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem]
  })
})
