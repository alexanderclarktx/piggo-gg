import { GameBuilder, HealthBarSystem, LineWall, PlayerSpawnSystem, Background, worldToIsometric } from "@piggo-gg/core";
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

const wallPointsIso: WallPoints = wallPoints.map(([x, y]) => worldToIsometric({ x, y })).map(({ x, y }) => [x, y]);

export const Legends: GameBuilder<"legends"> = ({
  id: "legends",
  init: () => ({
    id: "legends",
    entities: [
      Background(),
      Rift(wallPointsIso),
      LineWall({ points: wallPointsIso.flat() })
    ],
    systems: [HealthBarSystem, PlayerSpawnSystem]
  })
});
