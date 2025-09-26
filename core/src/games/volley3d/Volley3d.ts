import { GameBuilder } from "@piggo-gg/core"

export type Volley3dState = {
  hit: 0 | 1 | 2 | 3 | 4
  jumpHits: string[]
  lastHit: string
  lastHitTeam: 0 | 1 | 2
  lastHitTick: number
  lastWin: 0 | 1 | 2
  lastWinTick: number
  phase: "serve" | "play" | "point" | "game"
  scoreLeft: number
  scoreRight: number
  teamServing: 1 | 2
}

export const Volley3d: GameBuilder<Volley3dState> = {
  id: "volley3d",
  init: () => ({
    id: "volley3d",
    netcode: "rollback",
    renderer: "three",
    settings: {},
    state: {
      hit: 0,
      jumpHits: [],
      lastHit: "",
      lastHitTeam: 0,
      lastHitTick: 0,
      lastWin: 0,
      lastWinTick: 0,
      phase: "point",
      scoreLeft: 0,
      scoreRight: 0,
      teamServing: 1
    },
    systems: [

    ],
    entities: [
      
    ]
  })
}
