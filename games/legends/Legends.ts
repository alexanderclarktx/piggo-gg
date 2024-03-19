import { GameBuilder, HealthBarSystem, LineWall, PlayerSpawnSystem, Background } from "@piggo-gg/core";
import { Rift, WallPoints } from "@piggo-gg/games";

const wallPoints: WallPoints = [
  [0, 100], // top
  [100, 0], // top
  [2500, 0], // right
  [2500, 2400], // bottom
  [2400, 2500], // bottom
  [0, 2500], // left
  [0, 100]
]

export const Legends: GameBuilder<"legends"> = ({
  id: "legends",
  init: () => ({
    id: "legends",
    entities: [
      Background(),
      Rift(wallPoints),
      LineWall({ points: wallPoints.flat() })
    ],
    systems: [HealthBarSystem, PlayerSpawnSystem]
  })
});
