import { AbilityHUD, Background, EnemySpawnSystem, FloorTiles, GameBuilder, HealthBarSystem, LineWall, PlayerSpawnSystem } from "@piggo-gg/core";
import { GunSystem } from "./systems/GunSystem";

export const Strike: GameBuilder<"strike"> = ({
  id: "strike",
  init: () => ({
    id: "strike",
    entities: [
      Background({ img: "stars.png" }),
      FloorTiles({ rows: 50, cols: 50 }),
      LineWall({ points: [ 32, 0, 832, 400, 32, 800, -768, 400, 32, 0 ] }),
      AbilityHUD(),
    ],
    systems: [PlayerSpawnSystem, HealthBarSystem, EnemySpawnSystem, GunSystem],
  })
})
