import { random } from "@piggo-gg/core"

export const { stringify } = JSON

export const randomHash = (length: number = 7) => {
  const id = random().toString(36).substring(length)
  return id
}

export const randomPlayerId = () => {
  return `player-${randomHash(5)}`
}
