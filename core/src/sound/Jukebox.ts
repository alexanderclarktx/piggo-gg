import { Entity, Position } from "@piggo-gg/core"

export const Jukebox = (): Entity => {
  const jukebox = Entity({
    id: "jukebox",
    components: {
      position: Position({ x: 200, y: 50, screenFixed: true })
    }
  })
  return jukebox
}
