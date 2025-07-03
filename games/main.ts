import {
  Animals, Volley, Lobby, Flappy, Craft, Dungeon,
  Home, Strike, ARAM, Soccer, Legends, Jump, Blox
} from "@piggo-gg/games"

export const games = [Lobby, Volley, Blox, Flappy, Animals, Craft, Dungeon, Home, Strike, ARAM, Soccer, Legends, Jump]

export * from "./animals/Animals"
export * from "./aram/ARAM"
export * from "./dungeon/Dungeon"
export * from "./blox/Blox"
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
