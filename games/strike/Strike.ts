import { Background, GameBuilder, Health, HealthBarSystem, PlayerSpawnSystem, FloorTiles, Zombie } from "@piggo-gg/core";

export const Strike: GameBuilder<"strike"> = ({
  id: "strike",
  init: () => ({
    id: "strike",
    entities: [
      Zombie({ id: "zombie" }).extend([
        new Health(100, 100)]
      ),
      Background({img: "stars.png"}),
      FloorTiles({ rows: 50, cols: 50}),
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem]
  })
})
