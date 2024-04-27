import { Background, HealthBarSystem, IsometricGame, LineWall, PlayerSpawnSystem, pointsIsometric } from "@piggo-gg/core";
import { Rift } from "@piggo-gg/games";

const wallPoints: number[][] = [
  [0, 100], // top
  [100, 0], // top
  [2500, 0], // right
  [2500, 2400], // bottom
  [2400, 2500], // bottom
  [0, 2500], // left
  [0, 100]
]

const wallPointsIso = pointsIsometric(wallPoints);

export const Legends = IsometricGame({
  id: "legends",
  init: () => ({
    id: "legends",
    entities: [
      Background(),
      Rift(wallPointsIso),
      LineWall({ points: wallPointsIso })
    ],
    systems: [HealthBarSystem, PlayerSpawnSystem]
  })
});
