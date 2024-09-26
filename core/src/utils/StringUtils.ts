import { random, randomInt } from "@piggo-gg/core";

export const { stringify } = JSON

export const genHash = (length: number = 7) => {
  const id = random().toString(36).substring(length)
  return id
}

export const genPlayerId = () => {
  return `noob${randomInt(100)}`
}
