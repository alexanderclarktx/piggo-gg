import { GameBuilder, LineWall, PlayerSpawnSystem, SpaceBackground } from "@piggo-gg/core";
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

export const PiggoLegends: GameBuilder<"piggolegends"> = ({
  id: "piggolegends",
  init: () => ({
    id: "piggolegends",
    entities: [
      // Zombie({ id: "zombie1", color: 0x00eeff, positionProps: { x: 200, y: 400 } }),

      SpaceBackground(),

      Rift(wallPoints),
      LineWall({ points: wallPoints.flat() })
    ],
    systems: [ PlayerSpawnSystem ]
  })
});
