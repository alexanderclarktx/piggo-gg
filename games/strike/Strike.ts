import { Background, EnemySpawnSystem, FloorTiles, GameBuilder, HealthBarSystem, PlayerSpawnSystem } from "@piggo-gg/core";
import { GunsSystem } from "./systems/GunsSystem";

export const Strike: GameBuilder<"strike"> = ({
  id: "strike",
  init: () => ({
    id: "strike",
    entities: [
      Background({ img: "stars.png" }),
      FloorTiles({ rows: 50, cols: 50 }),
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem, EnemySpawnSystem, GunsSystem],
  })
})
