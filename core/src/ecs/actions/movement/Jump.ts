import { Action } from "@piggo-gg/core"

export const Jump = Action("jump", ({ entity }) => {
  if (!entity) return

  const { position } = entity.components

  position?.setVelocity({ x: 0, y: -200 })
}, 20)
