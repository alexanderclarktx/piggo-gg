import { Background,  LineWall, SpawnSystem, pointsIsometric, Skelly, GameBuilder, DefaultUI } from "@piggo-gg/core"
import { Rift } from "@piggo-gg/games"

const wallPoints: number[][] = [
  [0, 100], // top
  [100, 0], // top
  [2500, 0], // right
  [2500, 2400], // bottom
  [2400, 2500], // bottom
  [0, 2500], // left
  [0, 100]
]

const wallPointsIso = pointsIsometric(wallPoints)

export const Legends: GameBuilder = {
  id: "legends",
  init: (world) => ({
    id: "legends",
    state: {},
    entities: [
      ...DefaultUI(world),
      Background(),
      Rift(wallPointsIso),
      LineWall({ points: wallPointsIso, hittable: false })
    ],
    systems: [SpawnSystem(Skelly)],
    netcode: "delay"
  })
}
