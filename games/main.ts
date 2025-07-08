import {
  Animals, Volley, Lobby, Flappy, Craft, Dungeon,
  Home, Strike, ARAM, Soccer, Legends, Jump, DDE
} from "@piggo-gg/games"

export const games = [Lobby, Volley, DDE, Flappy, Animals, Craft, Dungeon, Home, Strike, ARAM, Soccer, Legends, Jump]

export * from "./animals/Animals"
export * from "./aram/ARAM"
export * from "./dungeon/Dungeon"
export * from "./dde/DDE"
export * from "./flappy/Flappy"
export * from "./home/Home"
export * from "./jump/Jump"
export * from "./legends/entities"
export * from "./legends/Legends"
export * from "./lobby/Lobby"
export * from "./craft/Craft"
export * from "./soccer/Soccer"
export * from "./strike/Strike"
export * from "./strike/StrikeSystem"
export * from "./volley/Volley"
